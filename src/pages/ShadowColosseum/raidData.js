// raidData.js — Hunter Chibis (ALL Fire/Water/Dark + Nier Collab), Raid Bosses, Sung Jinwoo Skills & Synergies
// Mode Raid pour Shadow Colosseum — 36 Hunters

// ─── Hunter Chibi Sprites (from characters.js icons) ─────────

const S = {
  // FIRE (12)
  h_megumin:   'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771533719/Megumin_yymsbq.png',
  h_yuqi:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403437/yuki_dqefqm.png',
  h_kanae:     'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606320/icons/build-18.png',
  h_stark:     'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820683/stark_portrait_ag5teg.png',
  h_fern:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820683/fern_portrait_vu4q7v.png',
  h_reed:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1769042084/Reed_portrait_ldj0p5.png',
  h_choi:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606289/icons/build-6.png',
  h_emma:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606292/icons/build-7.png',
  h_esil:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606294/icons/build-8.png',
  h_gina:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606297/icons/build-9.png',
  h_yoo:       'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606370/icons/build-37.png',
  h_song:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606359/icons/build-34.png',
  // WATER (12)
  h_shuhua:    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751536775/IconShuhua_njc2f2.png',
  h_chae_in:   'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606282/icons/build-3.png',
  h_frieren:   'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1761820684/frieren_portrait_jtvtcd.png',
  h_alicia:    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606278/icons/build.png',
  h_meilin:    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606335/icons/build-24.png',
  h_seo:       'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606349/icons/build-30.png',
  h_seorin:    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606352/icons/build-31.png',
  h_anna:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606280/icons/build-2.png',
  h_han_song:  'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606306/icons/build-13.png',
  h_lee_johee: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606330/icons/build-22.png',
  h_nam:       'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606342/icons/build-27.png',
  h_meri:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1770934646/Meri_Portrait_kjowxk.png',
  // DARK / SHADOW (12)
  h_ilhwan:    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759951014/ilhwan_uncoloried_uzywyu-removebg-preview_t87rro.png',
  h_minnie:    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756403438/Minnie_bcfolv.png',
  h_charlotte: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606287/icons/build-5.png',
  h_harper:    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606309/icons/build-14.png',
  h_isla:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606317/icons/build-17.png',
  h_lim:       'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606332/icons/build-23.png',
  h_lee_bora:  'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606327/icons/build-21.png',
  h_silverbaek:'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606357/icons/build-33.png',
  h_sian:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1769042083/Igris_portrait_xqbgqf.png',
  h_son:       'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1770934305/Son_Portrait_vmup4f.png',
  h_hwang:     'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606314/icons/build-16.png',
  h_kang:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606322/icons/build-19.png',
  // CHIBI (mascots)
  h_daijin:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771602808/Daijin_p1pvcs.png',
  h_pod042:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771604133/Pod042_rlmzhk.png',
  // STEINS;GATE (collab)
  h_kurisu:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771653556/Kurisu_Makise_bgr1ft.png',
  h_kurisu_skin: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771653555/Kurisu_Makise_Skin_pxpiyx.png',
  h_mayuri:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771655865/Mayuri_pdutiq.png',
  // ATTACK ON TITAN (collab)
  h_mikasa:    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771655466/Mikasa_axfrpp.png',
  // TOKYO GHOUL (collab)
  h_kaneki:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771655666/Kaneki_aobcre.png',
  h_kaneki_skin: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771655641/KanekiSkin_horxi4.png',
  // FATE (collab)
  h_saber:     'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771655017/Saber_xg6thi.png',
  // BERSERK (collab)
  h_guts:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771654575/Guts_y7usbq.png',
  // JUJUTSU KAISEN (collab)
  h_sukuna:    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771728787/Sukuna_rcgrdk.png',
  h_gojo:      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771729193/GojoSatoru_ty0ahp.png',
  // NIER AUTOMATA (collab)
  h_a9:        'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771654101/A9_tky2tw.png',
  h_2b:        'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771499926/2B_vly2pt.png',
  h_pascal:    'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771500784/Pascal_xfuwum.png',
  h_a2:        'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771503623/A2_a0cyk9.png',
  h_a2_atk1:   'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771503621/A2_ATK_houugg.png',
  h_a2_atk2:   'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771503620/A2_ATK2_roqlzl.png',
  h_a2_bunny:  'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771503620/A2_BUNNY_zkdqad.png',
};

// ═══════════════════════════════════════════════════════════════
// 35 HUNTER CHIBIS — Fire / Water / Shadow
// ═══════════════════════════════════════════════════════════════

export const HUNTERS = {

  // ─── FIRE ───────────────────────────────────────────── (11)

  h_kanae: {
    name: 'Tawata Kanae', element: 'fire', rarity: 'mythique', class: 'assassin',
    sprite: S.h_kanae, passiveDesc: 'SPD +20% au 1er tour',
    base:   { hp: 350, atk: 52, def: 16, spd: 42, crit: 22, res: 4, mana: 100 },
    growth: { hp: 11, atk: 3.8, def: 0.9, spd: 2.0, crit: 0.7, res: 0.2, mana: 0.5 },
    skills: [
      { name: 'Flamme Eclair', power: 110, cdMax: 0 },
      { name: 'Dague Incandescente', power: 200, cdMax: 3 },
      { name: 'Embrasement', power: 150, cdMax: 2, buffAtk: 25, buffDur: 2 },
    ],
  },
  h_stark: {
    name: 'Stark', element: 'fire', rarity: 'mythique', class: 'fighter',
    sprite: S.h_stark, passiveDesc: 'DEF +30% quand PV < 40%',
    base:   { hp: 520, atk: 46, def: 30, spd: 24, crit: 10, res: 12, mana: 120 },
    growth: { hp: 17, atk: 3.2, def: 1.8, spd: 1.1, crit: 0.3, res: 0.5, mana: 0.6 },
    skills: [
      { name: 'Poing Ardent', power: 105, cdMax: 0 },
      { name: 'Eruption Offensive', power: 185, cdMax: 3 },
      { name: 'Garde de Flamme', power: 0, cdMax: 4, buffDef: 60, buffDur: 3 },
    ],
  },
  h_fern: {
    name: 'Fern', element: 'fire', rarity: 'mythique', class: 'fighter',
    sprite: S.h_fern, passiveDesc: 'ATK +15% permanent',
    base:   { hp: 440, atk: 54, def: 22, spd: 32, crit: 16, res: 6, mana: 130 },
    growth: { hp: 14, atk: 3.8, def: 1.2, spd: 1.5, crit: 0.5, res: 0.2, mana: 0.7 },
    skills: [
      { name: 'Magie Offensive', power: 112, cdMax: 0 },
      { name: 'Destruction Totale', power: 210, cdMax: 4 },
      { name: 'Flamme de Fern', power: 155, cdMax: 2 },
    ],
  },
  h_reed: {
    name: 'Christopher Reed', element: 'fire', rarity: 'mythique', class: 'support',
    sprite: S.h_reed, passiveDesc: 'DEF equipe +10% passif',
    base:   { hp: 480, atk: 34, def: 32, spd: 26, crit: 8, res: 18, mana: 320 },
    growth: { hp: 16, atk: 2.2, def: 1.8, spd: 1.2, crit: 0.3, res: 0.7, mana: 2 },
    skills: [
      { name: 'Flamme Gardienne', power: 90, cdMax: 0 },
      { name: 'Mur de Feu', power: 0, cdMax: 3, buffDef: 50, buffDur: 3 },
      { name: 'Infusion de Force', power: 0, cdMax: 4, buffAtk: 40, buffDur: 3 },
    ],
  },
  h_choi: {
    name: 'Choi Jong-In', element: 'fire', rarity: 'legendaire', class: 'mage',
    sprite: S.h_choi, passiveDesc: 'Degats AoE +15%',
    base:   { hp: 360, atk: 48, def: 18, spd: 28, crit: 14, res: 12, mana: 300 },
    growth: { hp: 12, atk: 3.4, def: 1.0, spd: 1.3, crit: 0.5, res: 0.5, mana: 2 },
    skills: [
      { name: 'Boule de Feu', power: 105, cdMax: 0 },
      { name: 'Eruption Ardente', power: 195, cdMax: 3 },
      { name: 'Inferno', power: 150, cdMax: 2, debuffDef: 20, debuffDur: 2 },
    ],
  },
  h_emma: {
    name: 'Emma Laurent', element: 'fire', rarity: 'legendaire', class: 'tank',
    sprite: S.h_emma, passiveDesc: 'DEF +20%, aggro augmentee',
    base:   { hp: 580, atk: 28, def: 40, spd: 18, crit: 5, res: 18, mana: 90 },
    growth: { hp: 19, atk: 1.8, def: 2.2, spd: 0.8, crit: 0.2, res: 0.7, mana: 0.4 },
    skills: [
      { name: 'Bouclier Brulant', power: 88, cdMax: 0 },
      { name: 'Forteresse Ignee', power: 0, cdMax: 3, buffDef: 70, buffDur: 3 },
      { name: 'Soin de Braise', power: 0, cdMax: 4, healSelf: 30 },
    ],
  },
  h_esil: {
    name: 'Esil Radiru', element: 'fire', rarity: 'legendaire', class: 'fighter',
    sprite: S.h_esil, passiveDesc: 'DEF +25% quand PV < 50%',
    base:   { hp: 480, atk: 44, def: 28, spd: 26, crit: 12, res: 10, mana: 110 },
    growth: { hp: 16, atk: 3.0, def: 1.6, spd: 1.2, crit: 0.4, res: 0.4, mana: 0.5 },
    skills: [
      { name: 'Coup de Lance', power: 100, cdMax: 0 },
      { name: 'Charge Brulante', power: 180, cdMax: 3 },
      { name: 'Garde de Feu', power: 0, cdMax: 4, buffDef: 50, buffDur: 3 },
    ],
  },
  h_yuqi: {
    name: 'Yuqi', element: 'fire', rarity: 'legendaire', class: 'fighter',
    sprite: S.h_yuqi, passiveDesc: 'PV +15% permanent',
    base:   { hp: 500, atk: 40, def: 26, spd: 24, crit: 10, res: 10, mana: 100 },
    growth: { hp: 17, atk: 2.8, def: 1.5, spd: 1.1, crit: 0.3, res: 0.4, mana: 0.5 },
    skills: [
      { name: 'Frappe Brisante', power: 100, cdMax: 0 },
      { name: 'Impact Volcanique', power: 175, cdMax: 3 },
      { name: 'Aura Brulante', power: 0, cdMax: 4, buffAtk: 35, buffDur: 3 },
    ],
  },
  h_yoo: {
    name: 'Yoo Soohyun', element: 'fire', rarity: 'legendaire', class: 'mage',
    sprite: S.h_yoo, passiveDesc: 'CRIT +10% sur skills CD3+',
    base:   { hp: 350, atk: 46, def: 17, spd: 30, crit: 16, res: 10, mana: 280 },
    growth: { hp: 11, atk: 3.4, def: 0.9, spd: 1.4, crit: 0.5, res: 0.4, mana: 1.8 },
    skills: [
      { name: 'Lance de Flamme', power: 102, cdMax: 0 },
      { name: 'Meteore', power: 190, cdMax: 3 },
      { name: 'Combustion', power: 140, cdMax: 2, debuffDef: 15, debuffDur: 2 },
    ],
  },
  h_gina: {
    name: 'Gina', element: 'fire', rarity: 'rare', class: 'support',
    sprite: S.h_gina, passiveDesc: 'Soin +15% efficacite',
    base:   { hp: 400, atk: 28, def: 22, spd: 26, crit: 8, res: 14, mana: 220 },
    growth: { hp: 13, atk: 2.0, def: 1.3, spd: 1.1, crit: 0.3, res: 0.5, mana: 1.4 },
    skills: [
      { name: 'Flammeche', power: 85, cdMax: 0 },
      { name: 'Soin Igné', power: 0, cdMax: 4, healSelf: 22 },
      { name: 'Protection de Feu', power: 0, cdMax: 3, buffDef: 35, buffDur: 3 },
    ],
  },
  h_song: {
    name: 'Song Chiyul', element: 'fire', rarity: 'rare', class: 'mage',
    sprite: S.h_song, passiveDesc: 'ATK +10% contre boss',
    base:   { hp: 330, atk: 42, def: 15, spd: 28, crit: 12, res: 8, mana: 240 },
    growth: { hp: 10, atk: 3.0, def: 0.9, spd: 1.2, crit: 0.4, res: 0.3, mana: 1.5 },
    skills: [
      { name: 'Etincelle', power: 95, cdMax: 0 },
      { name: 'Pyrotechnie', power: 170, cdMax: 3 },
      { name: 'Flamme Dansante', power: 130, cdMax: 2 },
    ],
  },

  // ─── SPECIAL ────────────────────────────────────────────
  h_megumin: {
    name: 'Megumin', element: 'fire', rarity: 'legendaire', class: 'mage',
    series: 'konosuba', sprite: S.h_megumin, passiveDesc: '+10% ATK/DEF/SPD a toute l\'equipe',
    base:   { hp: 180, atk: 58, def: 8, spd: 28, crit: 20, res: 10, mana: 260 },
    growth: { hp: 6, atk: 4.0, def: 0.4, spd: 1.2, crit: 0.5, res: 0.35, mana: 1.8 },
    skills: [
      { name: 'Flamme Écarlate', power: 120, cdMax: 0, manaCost: 0, manaRestore: 25 },
      { name: 'Détonation de Mana', power: 100, cdMax: 4, manaCost: 0, manaScaling: 7, consumeHalfMana: true },
      { name: 'EXPLOSION!!!', power: 1800, cdMax: 8, manaCost: 400, manaThreshold: 0.9, selfDamage: 15, selfStunTurns: 2 },
    ],
    special: true,
  },

  // ─── WATER ──────────────────────────────────────────── (12)

  h_chae_in: {
    name: 'Cha Hae-In', element: 'water', rarity: 'mythique', class: 'fighter',
    sprite: S.h_chae_in, passiveDesc: 'ATK et SPD +10% permanent',
    base:   { hp: 440, atk: 52, def: 24, spd: 36, crit: 18, res: 8, mana: 130 },
    growth: { hp: 14, atk: 3.8, def: 1.3, spd: 1.7, crit: 0.5, res: 0.3, mana: 0.7 },
    skills: [
      { name: 'Coup d\'Epee', power: 110, cdMax: 0 },
      { name: 'Frappe Celeste', power: 195, cdMax: 3 },
      { name: 'Danse du Sabre', power: 155, cdMax: 2, buffAtk: 30, buffDur: 2 },
    ],
  },
  h_frieren: {
    name: 'Frieren', element: 'water', rarity: 'mythique', class: 'mage',
    sprite: S.h_frieren, passiveDesc: 'Degats magiques +25%',
    base:   { hp: 360, atk: 56, def: 15, spd: 28, crit: 18, res: 10, mana: 380 },
    growth: { hp: 11, atk: 4.0, def: 0.8, spd: 1.3, crit: 0.6, res: 0.4, mana: 2.5 },
    skills: [
      { name: 'Zoltraak', power: 115, cdMax: 0 },
      { name: 'Magie Ancienne', power: 225, cdMax: 4 },
      { name: 'Gel Eternel', power: 165, cdMax: 3, debuffDef: 25, debuffDur: 2 },
    ],
  },
  h_alicia: {
    name: 'Alicia Blanche', element: 'water', rarity: 'mythique', class: 'mage',
    sprite: S.h_alicia, passiveDesc: 'CRIT DMG +20%',
    base:   { hp: 370, atk: 54, def: 16, spd: 30, crit: 20, res: 8, mana: 350 },
    growth: { hp: 12, atk: 3.8, def: 0.9, spd: 1.4, crit: 0.6, res: 0.3, mana: 2.2 },
    skills: [
      { name: 'Lame de Glace', power: 108, cdMax: 0 },
      { name: 'Blizzard Absolu', power: 210, cdMax: 4 },
      { name: 'Givre Tranchant', power: 155, cdMax: 2 },
    ],
  },
  h_meri: {
    name: 'Meri Laine', element: 'water', rarity: 'mythique', class: 'support',
    sprite: S.h_meri, passiveDesc: 'Buff equipe +15% efficacite',
    base:   { hp: 460, atk: 30, def: 28, spd: 28, crit: 8, res: 16, mana: 340 },
    growth: { hp: 15, atk: 2.0, def: 1.5, spd: 1.3, crit: 0.3, res: 0.6, mana: 2.2 },
    skills: [
      { name: 'Vague d\'Infusion', power: 88, cdMax: 0 },
      { name: 'Maree Soignante', power: 0, cdMax: 4, healSelf: 28 },
      { name: 'Courant Renforcant', power: 0, cdMax: 3, buffAtk: 40, buffDur: 3 },
    ],
  },
  h_shuhua: {
    name: 'Shuhua', element: 'water', rarity: 'legendaire', class: 'fighter',
    sprite: S.h_shuhua, passiveDesc: 'ATK +12% permanent',
    base:   { hp: 450, atk: 46, def: 24, spd: 30, crit: 14, res: 8, mana: 110 },
    growth: { hp: 15, atk: 3.4, def: 1.3, spd: 1.4, crit: 0.4, res: 0.3, mana: 0.6 },
    skills: [
      { name: 'Poing d\'Eau', power: 105, cdMax: 0 },
      { name: 'Raz-de-Maree', power: 180, cdMax: 3 },
      { name: 'Vague Protectrice', power: 0, cdMax: 4, buffDef: 40, buffDur: 3 },
    ],
  },
  h_meilin: {
    name: 'Meilin Fisher', element: 'water', rarity: 'legendaire', class: 'support',
    sprite: S.h_meilin, passiveDesc: 'Soin +20% efficacite',
    base:   { hp: 430, atk: 26, def: 24, spd: 28, crit: 8, res: 16, mana: 280 },
    growth: { hp: 14, atk: 1.8, def: 1.4, spd: 1.2, crit: 0.3, res: 0.6, mana: 1.8 },
    skills: [
      { name: 'Eclat Glace', power: 85, cdMax: 0 },
      { name: 'Source de Vie', power: 0, cdMax: 4, healSelf: 25 },
      { name: 'Barriere d\'Eau', power: 0, cdMax: 3, buffDef: 45, buffDur: 3 },
    ],
  },
  h_seo: {
    name: 'Seo Jiwoo', element: 'water', rarity: 'legendaire', class: 'tank',
    sprite: S.h_seo, passiveDesc: 'PV +20%, aggro augmentee',
    base:   { hp: 600, atk: 26, def: 38, spd: 18, crit: 5, res: 20, mana: 100 },
    growth: { hp: 20, atk: 1.8, def: 2.2, spd: 0.8, crit: 0.2, res: 0.8, mana: 0.5 },
    skills: [
      { name: 'Bouclier Glacial', power: 85, cdMax: 0 },
      { name: 'Mur de Glace', power: 0, cdMax: 3, buffDef: 70, buffDur: 3 },
      { name: 'Soin Aquatique', power: 0, cdMax: 4, healSelf: 35 },
    ],
  },
  h_anna: {
    name: 'Anna Ruiz', element: 'water', rarity: 'legendaire', class: 'assassin',
    sprite: S.h_anna, passiveDesc: 'CRIT +12% permanent',
    base:   { hp: 360, atk: 46, def: 16, spd: 36, crit: 18, res: 5, mana: 90 },
    growth: { hp: 11, atk: 3.4, def: 0.9, spd: 1.8, crit: 0.6, res: 0.2, mana: 0.4 },
    skills: [
      { name: 'Fleche de Glace', power: 105, cdMax: 0 },
      { name: 'Tir Perforant', power: 185, cdMax: 3 },
      { name: 'Pluie de Fleches', power: 140, cdMax: 2 },
    ],
  },
  h_han_song: {
    name: 'Han Song-Yi', element: 'water', rarity: 'legendaire', class: 'assassin',
    sprite: S.h_han_song, passiveDesc: 'SPD +15% permanent',
    base:   { hp: 340, atk: 48, def: 15, spd: 40, crit: 20, res: 4, mana: 90 },
    growth: { hp: 11, atk: 3.5, def: 0.9, spd: 1.9, crit: 0.6, res: 0.2, mana: 0.4 },
    skills: [
      { name: 'Lame d\'Eau', power: 108, cdMax: 0 },
      { name: 'Frappe Eclair', power: 190, cdMax: 3 },
      { name: 'Danse Mortelle', power: 150, cdMax: 2, buffAtk: 20, buffDur: 2 },
    ],
  },
  h_seorin: {
    name: 'Seorin', element: 'water', rarity: 'rare', class: 'assassin',
    sprite: S.h_seorin, passiveDesc: 'CRIT +8% contre ennemis PV < 50%',
    base:   { hp: 320, atk: 40, def: 14, spd: 36, crit: 16, res: 4, mana: 80 },
    growth: { hp: 10, atk: 2.8, def: 0.8, spd: 1.8, crit: 0.5, res: 0.2, mana: 0.3 },
    skills: [
      { name: 'Fleche Rapide', power: 95, cdMax: 0 },
      { name: 'Tir Glacial', power: 165, cdMax: 3 },
      { name: 'Esquive Aquatique', power: 0, cdMax: 3, buffAtk: 30, buffDur: 2 },
    ],
  },
  h_lee_johee: {
    name: 'Lee Johee', element: 'water', rarity: 'rare', class: 'support',
    sprite: S.h_lee_johee, passiveDesc: 'Soin +10% efficacite',
    base:   { hp: 400, atk: 24, def: 22, spd: 24, crit: 6, res: 14, mana: 200 },
    growth: { hp: 13, atk: 1.6, def: 1.3, spd: 1.0, crit: 0.2, res: 0.5, mana: 1.2 },
    skills: [
      { name: 'Lumiere Soignante', power: 80, cdMax: 0 },
      { name: 'Regeneration', power: 0, cdMax: 4, healSelf: 22 },
      { name: 'Benediction', power: 0, cdMax: 3, buffDef: 30, buffDur: 3 },
    ],
  },
  h_nam: {
    name: 'Nam Chae-Young', element: 'water', rarity: 'rare', class: 'assassin',
    sprite: S.h_nam, passiveDesc: 'SPD +10% permanent',
    base:   { hp: 320, atk: 38, def: 14, spd: 34, crit: 14, res: 4, mana: 80 },
    growth: { hp: 10, atk: 2.6, def: 0.8, spd: 1.7, crit: 0.4, res: 0.2, mana: 0.3 },
    skills: [
      { name: 'Tir Rapide', power: 92, cdMax: 0 },
      { name: 'Volée de Flèches', power: 160, cdMax: 3 },
      { name: 'Embuscade', power: 130, cdMax: 2, buffAtk: 20, buffDur: 2 },
    ],
  },

  // ─── SHADOW / DARK ─────────────────────────────────── (12)

  h_ilhwan: {
    name: 'Ilhwan', element: 'shadow', rarity: 'mythique', class: 'assassin',
    sprite: S.h_ilhwan, passiveDesc: 'CRIT +15% quand PV > 80%',
    base:   { hp: 380, atk: 54, def: 18, spd: 40, crit: 22, res: 5, mana: 100 },
    growth: { hp: 12, atk: 3.8, def: 1.0, spd: 1.8, crit: 0.6, res: 0.2, mana: 0.5 },
    skills: [
      { name: 'Lame d\'Ombre', power: 112, cdMax: 0 },
      { name: 'Assassinat', power: 205, cdMax: 3 },
      { name: 'Danse de l\'Ombre', power: 160, cdMax: 2, buffAtk: 25, buffDur: 2 },
    ],
  },
  h_minnie: {
    name: 'Minnie', element: 'shadow', rarity: 'mythique', class: 'assassin',
    sprite: S.h_minnie, passiveDesc: 'DEF ignore +10% sur crits',
    base:   { hp: 360, atk: 50, def: 20, spd: 38, crit: 20, res: 6, mana: 100 },
    growth: { hp: 11, atk: 3.6, def: 1.0, spd: 1.8, crit: 0.6, res: 0.2, mana: 0.5 },
    skills: [
      { name: 'Frappe Sournoise', power: 108, cdMax: 0 },
      { name: 'Embuscade Nocturne', power: 195, cdMax: 3 },
      { name: 'Voile d\'Ombre', power: 0, cdMax: 3, buffAtk: 35, buffDur: 2 },
    ],
  },
  h_silverbaek: {
    name: 'Baek Yoonho', element: 'shadow', rarity: 'mythique', class: 'fighter',
    sprite: S.h_silverbaek, passiveDesc: 'ATK +20% quand PV > 70%',
    base:   { hp: 500, atk: 52, def: 28, spd: 28, crit: 14, res: 10, mana: 130 },
    growth: { hp: 16, atk: 3.8, def: 1.5, spd: 1.3, crit: 0.4, res: 0.4, mana: 0.7 },
    skills: [
      { name: 'Griffe d\'Argent', power: 110, cdMax: 0 },
      { name: 'Metamorphose', power: 200, cdMax: 4, buffAtk: 40, buffDur: 3 },
      { name: 'Rugissement Bestial', power: 170, cdMax: 3 },
    ],
  },
  h_sian: {
    name: 'Sian Halat', element: 'shadow', rarity: 'mythique', class: 'assassin',
    sprite: S.h_sian, passiveDesc: 'ATK +3% par attaque (stack x10)',
    base:   { hp: 370, atk: 50, def: 18, spd: 38, crit: 18, res: 6, mana: 100 },
    growth: { hp: 12, atk: 3.6, def: 1.0, spd: 1.8, crit: 0.5, res: 0.2, mana: 0.5 },
    skills: [
      { name: 'Poing Sombre', power: 108, cdMax: 0 },
      { name: 'Combo Furieux', power: 195, cdMax: 3 },
      { name: 'Rage d\'Ombre', power: 0, cdMax: 4, buffAtk: 50, buffDur: 3 },
    ],
  },
  h_charlotte: {
    name: 'Charlotte', element: 'shadow', rarity: 'legendaire', class: 'mage',
    sprite: S.h_charlotte, passiveDesc: 'DoT +25% degats',
    base:   { hp: 350, atk: 46, def: 16, spd: 30, crit: 14, res: 10, mana: 280 },
    growth: { hp: 11, atk: 3.2, def: 1.0, spd: 1.4, crit: 0.5, res: 0.4, mana: 1.8 },
    skills: [
      { name: 'Ombre Rampante', power: 100, cdMax: 0 },
      { name: 'Malediction Noire', power: 175, cdMax: 3, debuffDef: 20, debuffDur: 2 },
      { name: 'Nuee Sombre', power: 145, cdMax: 2 },
    ],
  },
  h_lee_bora: {
    name: 'Lee Bora', element: 'shadow', rarity: 'legendaire', class: 'mage',
    sprite: S.h_lee_bora, passiveDesc: 'Debuff ennemi +15% efficacite',
    base:   { hp: 360, atk: 44, def: 18, spd: 28, crit: 14, res: 12, mana: 280 },
    growth: { hp: 12, atk: 3.2, def: 1.0, spd: 1.3, crit: 0.5, res: 0.5, mana: 1.8 },
    skills: [
      { name: 'Frappe Obscure', power: 100, cdMax: 0 },
      { name: 'Voile Maudit', power: 165, cdMax: 3, debuffDef: 25, debuffDur: 2 },
      { name: 'Explosion Sombre', power: 180, cdMax: 4 },
    ],
  },
  h_harper: {
    name: 'Harper', element: 'shadow', rarity: 'legendaire', class: 'tank',
    sprite: S.h_harper, passiveDesc: 'DEF +20%, aggro augmentee',
    base:   { hp: 580, atk: 28, def: 38, spd: 18, crit: 5, res: 18, mana: 90 },
    growth: { hp: 19, atk: 1.8, def: 2.2, spd: 0.8, crit: 0.2, res: 0.7, mana: 0.4 },
    skills: [
      { name: 'Frappe du Neant', power: 88, cdMax: 0 },
      { name: 'Mur d\'Ombre', power: 0, cdMax: 3, buffDef: 65, buffDur: 3 },
      { name: 'Absorption Sombre', power: 0, cdMax: 4, healSelf: 30 },
    ],
  },
  h_lim: {
    name: 'Lim Tae-Gyu', element: 'shadow', rarity: 'legendaire', class: 'fighter',
    sprite: S.h_lim, passiveDesc: 'ATK +15% contre ennemis debuffs',
    base:   { hp: 470, atk: 44, def: 26, spd: 26, crit: 12, res: 8, mana: 110 },
    growth: { hp: 15, atk: 3.0, def: 1.5, spd: 1.2, crit: 0.4, res: 0.3, mana: 0.6 },
    skills: [
      { name: 'Poing Briseur', power: 102, cdMax: 0 },
      { name: 'Impact Devastateur', power: 180, cdMax: 3 },
      { name: 'Force Sombre', power: 0, cdMax: 4, buffAtk: 45, buffDur: 3 },
    ],
  },
  h_kang: {
    name: 'Kang Taeshik', element: 'shadow', rarity: 'legendaire', class: 'assassin',
    sprite: S.h_kang, passiveDesc: 'CRIT +10% permanent',
    base:   { hp: 350, atk: 46, def: 16, spd: 36, crit: 18, res: 5, mana: 90 },
    growth: { hp: 11, atk: 3.4, def: 0.9, spd: 1.7, crit: 0.6, res: 0.2, mana: 0.4 },
    skills: [
      { name: 'Dague Empoisonnee', power: 105, cdMax: 0 },
      { name: 'Coup Traitre', power: 190, cdMax: 3 },
      { name: 'Furtivite', power: 0, cdMax: 3, buffAtk: 30, buffDur: 2 },
    ],
  },
  h_son: {
    name: 'Son Kihoon', element: 'shadow', rarity: 'legendaire', class: 'tank',
    sprite: S.h_son, passiveDesc: 'RES +15% permanent',
    base:   { hp: 560, atk: 26, def: 36, spd: 18, crit: 5, res: 20, mana: 100 },
    growth: { hp: 18, atk: 1.8, def: 2.0, spd: 0.8, crit: 0.2, res: 0.8, mana: 0.5 },
    skills: [
      { name: 'Coup de Masse', power: 90, cdMax: 0 },
      { name: 'Bastion', power: 0, cdMax: 3, buffDef: 60, buffDur: 3 },
      { name: 'Endurance Sombre', power: 0, cdMax: 4, healSelf: 28 },
    ],
  },
  h_isla: {
    name: 'Isla Wright', element: 'shadow', rarity: 'rare', class: 'support',
    sprite: S.h_isla, passiveDesc: 'Soin +10% efficacite',
    base:   { hp: 400, atk: 24, def: 22, spd: 26, crit: 6, res: 14, mana: 200 },
    growth: { hp: 13, atk: 1.6, def: 1.3, spd: 1.1, crit: 0.2, res: 0.5, mana: 1.2 },
    skills: [
      { name: 'Toucher Obscur', power: 82, cdMax: 0 },
      { name: 'Soin des Ombres', power: 0, cdMax: 4, healSelf: 22 },
      { name: 'Voile Protecteur', power: 0, cdMax: 3, buffDef: 30, buffDur: 3 },
    ],
  },
  h_hwang: {
    name: 'Hwang Dongsuk', element: 'shadow', rarity: 'rare', class: 'tank',
    sprite: S.h_hwang, passiveDesc: 'DEF +10% permanent',
    base:   { hp: 520, atk: 24, def: 32, spd: 16, crit: 4, res: 14, mana: 80 },
    growth: { hp: 17, atk: 1.6, def: 1.8, spd: 0.7, crit: 0.1, res: 0.6, mana: 0.3 },
    skills: [
      { name: 'Coup de Bouclier', power: 85, cdMax: 0 },
      { name: 'Garde', power: 0, cdMax: 3, buffDef: 50, buffDur: 3 },
      { name: 'Soin Brut', power: 0, cdMax: 4, healSelf: 20 },
    ],
  },

  // ═══ CHIBI — Mascots Hunters ═══

  h_daijin: {
    name: 'Daijin', element: 'shadow', rarity: 'mythique', class: 'assassin',
    series: 'chibi', sprite: S.h_daijin, passiveDesc: 'Esquive Feline : SPD +15% & CRIT +10% permanent',
    base:   { hp: 320, atk: 48, def: 14, spd: 44, crit: 24, res: 6, mana: 80 },
    growth: { hp: 10, atk: 3.4, def: 0.8, spd: 2.2, crit: 0.8, res: 0.2, mana: 0.4 },
    skills: [
      { name: 'Griffe Feline', power: 105, cdMax: 0 },
      { name: 'Bond Dimensionnel', power: 185, cdMax: 3 },
      { name: 'Pierre de Scellement', power: 140, cdMax: 2, buffDef: 30, buffDur: 2 },
    ],
  },

  h_pod042: {
    name: 'Pod 042', element: 'water', rarity: 'mythique', class: 'support',
    series: 'chibi', sprite: S.h_pod042, passiveDesc: 'Protocole de Soutien : Equipe +10% DEF',
    base:   { hp: 400, atk: 32, def: 26, spd: 30, crit: 8, res: 14, mana: 280 },
    growth: { hp: 13, atk: 2.2, def: 1.5, spd: 1.3, crit: 0.3, res: 0.5, mana: 1.8 },
    skills: [
      { name: 'Tir Laser', power: 90, cdMax: 0 },
      { name: 'Programme R010: Bouclier', power: 0, cdMax: 3, buffDef: 40, buffDur: 2 },
      { name: 'Programme A110: Analyse', power: 130, cdMax: 2, debuffDef: 25, debuffDur: 2 },
    ],
  },

  // ═══ STEINS;GATE — Collab Hunters ═══

  h_kurisu: {
    name: 'Kurisu Makise', element: 'water', rarity: 'mythique', class: 'mage',
    series: 'steinsgate', sprite: S.h_kurisu, passiveDesc: 'Analyse Temporelle : ATK +5% par action (max 30%)',
    base:   { hp: 380, atk: 52, def: 18, spd: 36, crit: 18, res: 8, mana: 350 },
    growth: { hp: 12, atk: 3.6, def: 1.0, spd: 1.6, crit: 0.6, res: 0.3, mana: 2.2 },
    skills: [
      { name: 'Impulsion Temporelle', power: 108, cdMax: 0 },
      { name: 'Divergence Shift', power: 195, cdMax: 3 },
      { name: 'Amadeus Protocol', power: 160, cdMax: 2, buffAtk: 20, buffDur: 2 },
    ],
  },

  h_mayuri: {
    name: 'Mayuri Shiina', element: 'water', rarity: 'mythique', class: 'support',
    series: 'steinsgate', sprite: S.h_mayuri, passiveDesc: 'Tutturu~ : Buff raid ATK +15% & DEF +10% pour TOUTE l\'equipe',
    base:   { hp: 460, atk: 28, def: 24, spd: 32, crit: 6, res: 16, mana: 360 },
    growth: { hp: 15, atk: 1.8, def: 1.4, spd: 1.4, crit: 0.2, res: 0.6, mana: 2.2 },
    skills: [
      { name: 'Etoile Filante', power: 78, cdMax: 0 },
      { name: 'Tutturu Heal', power: 0, cdMax: 3, healSelf: 30, buffDef: 25, buffDur: 2, manaCost: 30 },
      { name: 'Convergence du Destin', power: 0, cdMax: 5, grantExtraTurn: true, grantFreeCast: true, buffAtk: 80, buffDur: 1, manaCost: 60 },
    ],
  },

  // ═══ ATTACK ON TITAN — Ackerman ═══

  h_mikasa: {
    name: 'Mikasa Ackerman', element: 'shadow', rarity: 'mythique', class: 'fighter',
    series: 'aot', sprite: S.h_mikasa, passiveDesc: 'Lien Ackerman : Equipe ATK +12% & SPD +8%',
    base:   { hp: 420, atk: 55, def: 20, spd: 40, crit: 20, res: 6, mana: 120 },
    growth: { hp: 13, atk: 3.8, def: 1.1, spd: 1.8, crit: 0.6, res: 0.2, mana: 0.6 },
    skills: [
      { name: 'Lame Ackerman', power: 115, cdMax: 0 },
      { name: 'Manoeuvre 3D', power: 200, cdMax: 3, buffAtk: 20, buffDur: 2 },
      { name: 'Devotion Absolue', power: 150, cdMax: 3, healSelf: 25, buffDef: 35, buffDur: 2 },
    ],
  },

  // ═══ TOKYO GHOUL — One-Eyed King ═══

  h_kaneki: {
    name: 'Ken Kaneki', element: 'shadow', rarity: 'mythique', class: 'assassin',
    series: 'tokyoghoul', sprite: S.h_kaneki, passiveDesc: 'Eveil Goule : ATK +30% & CRIT +15 sous 50% PV',
    base:   { hp: 360, atk: 56, def: 16, spd: 38, crit: 24, res: 4, mana: 80 },
    growth: { hp: 11, atk: 4.0, def: 0.9, spd: 1.6, crit: 0.8, res: 0.2, mana: 0.4 },
    skills: [
      { name: 'Griffe de Kagune', power: 112, cdMax: 0 },
      { name: 'Kagune: Rinkaku', power: 220, cdMax: 3 },
      { name: 'Centipede', power: 280, cdMax: 4, selfDamage: 15, buffAtk: 35, buffDur: 2 },
    ],
  },

  // ═══ FATE — King of Knights ═══

  h_saber: {
    name: 'Saber', element: 'water', rarity: 'mythique', class: 'fighter',
    series: 'fate', sprite: S.h_saber, passiveDesc: 'Instinct Royal : Buff aleatoire chaque tour (ATK, CRIT, SPD ou Jackpot)',
    base:   { hp: 440, atk: 54, def: 24, spd: 34, crit: 16, res: 8, mana: 130 },
    growth: { hp: 14, atk: 3.8, def: 1.3, spd: 1.5, crit: 0.5, res: 0.3, mana: 0.7 },
    skills: [
      { name: 'Excalibur Strike', power: 112, cdMax: 0 },
      { name: 'Invisible Air', power: 170, cdMax: 2, buffDef: 30, buffDur: 2 },
      { name: 'Excalibur', power: 260, cdMax: 4 },
    ],
  },

  // ═══ BERSERK — The Black Swordsman ═══

  h_guts: {
    name: 'Guts', element: 'shadow', rarity: 'mythique', class: 'fighter',
    series: 'berserk', sprite: S.h_guts, passiveDesc: 'Berserker Armor : Plus les PV baissent, plus il devient un monstre',
    base:   { hp: 480, atk: 58, def: 22, spd: 28, crit: 18, res: 4, mana: 100 },
    growth: { hp: 16, atk: 4.2, def: 1.2, spd: 1.2, crit: 0.6, res: 0.2, mana: 0.5 },
    skills: [
      { name: 'Dragon Slayer', power: 118, cdMax: 0 },
      { name: 'Canon du Bras', power: 195, cdMax: 3, debuffDef: 20, debuffDur: 2 },
      { name: 'Berserker Armor', power: 280, cdMax: 4, buffAtk: 40, buffDur: 3, selfDamage: 20 },
    ],
  },

  // ═══ JUJUTSU KAISEN — The King of Curses ═══

  h_sukuna: {
    name: 'Sukuna', element: 'fire', rarity: 'mythique', class: 'fighter',
    series: 'jjk', sprite: S.h_sukuna, passiveDesc: 'Roi des Fleaux : La vitesse augmente a chaque attaque, les coups critiques infligent des degats bonus',
    base:   { hp: 380, atk: 52, def: 16, spd: 45, crit: 25, res: 3, mana: 110 },
    growth: { hp: 12, atk: 3.6, def: 0.8, spd: 2.2, crit: 0.9, res: 0.15, mana: 0.6 },
    skills: [
      { name: 'Dismantle', power: 110, cdMax: 0 },
      { name: 'Cleave', power: 200, cdMax: 3, debuffDef: 25, debuffDur: 2 },
      { name: 'Malevolent Shrine', power: 300, cdMax: 5, buffSpd: 30, buffDur: 3 },
    ],
  },

  h_gojo: {
    name: 'Gojo Satoru', element: 'light', rarity: 'mythique', class: 'mage',
    series: 'jjk', sprite: S.h_gojo, passiveDesc: 'Infini : Reduit les degats recus et augmente CRIT. Six Eyes amplifie la puissance des techniques',
    base:   { hp: 420, atk: 55, def: 28, spd: 32, crit: 22, res: 8, mana: 400 },
    growth: { hp: 14, atk: 3.8, def: 1.6, spd: 1.4, crit: 0.8, res: 0.3, mana: 2.8 },
    skills: [
      { name: 'Blue', power: 120, cdMax: 0 },
      { name: 'Red', power: 210, cdMax: 3, debuffDef: 20, debuffDur: 2 },
      { name: 'Hollow Purple', power: 320, cdMax: 5, buffAtk: 30, buffDur: 2 },
    ],
  },

  // ═══ NIER AUTOMATA — Collab Hunters ═══

  h_a9: {
    name: 'A9', element: 'shadow', rarity: 'mythique', class: 'assassin',
    series: 'nier', sprite: S.h_a9, passiveDesc: 'Protocole Executeur : ATK +25% vs cibles < 30% HP',
    base:   { hp: 340, atk: 54, def: 16, spd: 42, crit: 22, res: 5, mana: 90 },
    growth: { hp: 11, atk: 3.8, def: 0.9, spd: 2.0, crit: 0.7, res: 0.2, mana: 0.5 },
    skills: [
      { name: 'Lame Silencieuse', power: 108, cdMax: 0, manaCost: 0 },
      { name: 'Infiltration', power: 155, cdMax: 2, buffAtk: 20, buffDur: 2, manaCost: 15 },
      { name: 'Programme B100: Execution', power: 220, cdMax: 4, manaCost: 30 },
    ],
  },

  h_2b: {
    name: '2B', element: 'shadow', rarity: 'mythique', class: 'fighter',
    series: 'nier', sprite: S.h_2b, passiveDesc: 'DMG +15% vs cibles debuff',
    base:   { hp: 460, atk: 55, def: 26, spd: 38, crit: 20, res: 10, mana: 140 },
    growth: { hp: 15, atk: 4.0, def: 1.4, spd: 1.8, crit: 0.6, res: 0.4, mana: 0.7 },
    skills: [
      { name: 'Frappe Vertueuse', power: 115, cdMax: 0, manaCost: 0 },
      { name: 'Mode B — Offensive', power: 215, cdMax: 3, buffAtk: 30, buffDur: 2, manaCost: 30 },
      { name: 'Pod Programme R011', power: 160, cdMax: 2, debuffDef: 25, debuffDur: 2, manaCost: 15 },
    ],
  },

  h_pascal: {
    name: 'Pascal', element: 'water', rarity: 'mythique', class: 'support',
    series: 'nier', sprite: S.h_pascal, passiveDesc: 'Aura: allies +10% RES au combat',
    base:   { hp: 440, atk: 30, def: 28, spd: 32, crit: 8, res: 16, mana: 300 },
    growth: { hp: 13, atk: 2.4, def: 1.6, spd: 1.4, crit: 0.4, res: 0.5, mana: 2 },
    skills: [
      { name: 'Parole Apaisante', power: 85, cdMax: 0, manaCost: 0 },
      { name: 'Protocole Pacifiste', power: 0, cdMax: 2, healSelf: 25, buffDef: 25, buffDur: 2, manaCost: 20 },
      { name: 'Philosophie des Machines', power: 150, cdMax: 4, buffAtk: 20, buffDef: 15, buffDur: 2, manaCost: 35 },
    ],
  },

  h_a2: {
    name: 'A2', element: 'fire', rarity: 'mythique', class: 'fighter',
    series: 'nier', sprite: S.h_a2, passiveDesc: 'Berserk: +20% ATK +15% SPD sous 50% HP',
    base:   { hp: 430, atk: 55, def: 20, spd: 34, crit: 22, res: 6, mana: 120 },
    growth: { hp: 14, atk: 4.2, def: 1.0, spd: 1.6, crit: 0.7, res: 0.3, mana: 0.6 },
    skills: [
      { name: 'Frappe Sauvage', power: 110, cdMax: 0, manaCost: 0 },
      { name: 'Lame Sanguinaire', power: 175, cdMax: 2, debuffDef: 20, debuffDur: 2, manaCost: 15 },
      { name: 'Mode Berserk', power: 250, cdMax: 3, buffAtk: 30, buffDur: 2, selfDamage: 15, manaCost: 30,
        atkFrames: [S.h_a2_atk1, S.h_a2_atk2] },
    ],
  },
};

// ─── Sung Jinwoo — 5 Skills Clavier ──────────────────────────

export const SUNG_SKILLS = [
  {
    id: 'arise',
    name: 'Arise!',
    desc: 'ATK +25% equipe pendant 8s',
    key: 'a', altKey: 'q',
    icon: '\u2694\uFE0F',
    cdSec: 15,
    durationSec: 8,
    effect: { type: 'buff', stat: 'atk', value: 25 },
    color: 'from-red-500 to-orange-500',
  },
  {
    id: 'domination',
    name: 'Domination',
    desc: 'DEF +40%, RES +20% equipe pendant 8s',
    key: 'e', altKey: null,
    icon: '\uD83D\uDEE1\uFE0F',
    cdSec: 18,
    durationSec: 8,
    effect: { type: 'buff', stat: 'def', value: 40, stat2: 'res', value2: 20 },
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'ombre_royale',
    name: 'Ombre Royale',
    desc: 'SPD +30%, CRIT +15% equipe pendant 10s',
    key: '1', altKey: '&',
    icon: '\uD83D\uDCA8',
    cdSec: 25,
    durationSec: 10,
    effect: { type: 'buff', stat: 'spd', value: 30, stat2: 'crit', value2: 15 },
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'volonte',
    name: 'Volonte du Monarque',
    desc: 'Boss DEF -30% pendant 6s',
    key: '2', altKey: '\u00e9',
    icon: '\uD83D\uDC51',
    cdSec: 30,
    durationSec: 6,
    effect: { type: 'debuff', stat: 'def', value: 30 },
    color: 'from-yellow-500 to-amber-500',
  },
  {
    id: 'shadow_exchange',
    name: 'Shadow Exchange',
    desc: 'Soin 30% PV max a tous',
    key: '3', altKey: '"',
    icon: '\u2764\uFE0F',
    cdSec: 45,
    durationSec: 0,
    effect: { type: 'heal', value: 30 },
    color: 'from-green-500 to-emerald-500',
  },
];

// ─── Raid Boss — Ant Queen ───────────────────────────────────

export const RAID_BOSSES = {
  ant_queen: {
    id: 'ant_queen',
    name: 'Reine des Fourmis',
    element: 'earth',
    emoji: '\uD83D\uDC1C',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753968545/antQueen_jzt22r.png',
    totalBars: 10,
    baseHP: 50000,
    barScaling: (i) => 50000 * (1 + 0.3 * i),
    stats: { atk: 80, def: 45, spd: 25, crit: 12, res: 15 },
    skills: [
      { name: 'Mandibule', power: 100, cdSec: 0, target: 'single' },
      { name: 'Acide', power: 60, cdSec: 8, target: 'aoe', debuffDef: 20 },
      { name: 'Essaim', power: 40, cdSec: 15, target: 'multi', hits: 3 },
      { name: 'Rage', power: 150, cdSec: 20, target: 'single', buffAtk: 50 },
    ],
    phases: [
      { barsRemaining: 10, name: 'Normal', atkMult: 1.0, spdMult: 1.0 },
      { barsRemaining: 6, name: 'Enrage', atkMult: 1.3, spdMult: 1.2 },
      { barsRemaining: 3, name: 'Berserk', atkMult: 1.6, spdMult: 1.5 },
    ],
  },
};

// ─── Raid Tier System ────────────────────────────────────────

export const RAID_TIERS = {
  1: {
    id: 1, name: 'Normal',
    nameColor: 'text-gray-300', bgGradient: 'from-gray-800/40 to-gray-700/40',
    borderColor: 'border-gray-500/30', emoji: '',
    rcPerBar: 1, maxRC: 10,
    bossHPMult: 1.0, bossAtkMult: 1.0, bossDefMult: 1.0, bossSpdMult: 1.0,
    coinMult: 1.0, xpMult: 1.0,
    hammerTiers: ['marteau_forge'], hammerCountBase: 1, hammerCountPerRC: 0.2,
    artifactDrop1: { rcMin: 2, rarities: ['rare', 'legendaire', 'mythique'], thresholds: [2, 5, 8] },
    artifactDrop2: { rcMin: 6, rarities: ['legendaire', 'mythique'], thresholds: [6, 9] },
    artifactDropFullClear: 'legendaire',
  },
  2: {
    id: 2, name: 'Heroique',
    nameColor: 'text-blue-400', bgGradient: 'from-blue-900/40 to-blue-700/40',
    borderColor: 'border-blue-500/30', emoji: '',
    rcPerBar: 10, maxRC: 100,
    bossHPMult: 3.0, bossAtkMult: 1.5, bossDefMult: 1.3, bossSpdMult: 1.1,
    coinMult: 2.5, xpMult: 2.0,
    hammerTiers: ['marteau_forge', 'marteau_runique'], hammerCountBase: 2, hammerCountPerRC: 0.15,
    artifactDrop1: { rcMin: 20, rarities: ['legendaire', 'mythique'], thresholds: [20, 60] },
    artifactDrop2: { rcMin: 50, rarities: ['legendaire', 'mythique'], thresholds: [50, 80] },
    artifactDropFullClear: 'mythique',
  },
  3: {
    id: 3, name: 'Legendaire',
    nameColor: 'text-purple-400', bgGradient: 'from-purple-900/40 to-purple-700/40',
    borderColor: 'border-purple-500/30', emoji: '',
    rcPerBar: 100, maxRC: 1000,
    bossHPMult: 10.0, bossAtkMult: 2.2, bossDefMult: 1.8, bossSpdMult: 1.3,
    coinMult: 5.0, xpMult: 3.5,
    hammerTiers: ['marteau_runique', 'marteau_celeste'], hammerCountBase: 3, hammerCountPerRC: 0.10,
    artifactDrop1: { rcMin: 200, rarities: ['legendaire', 'mythique'], thresholds: [200, 600] },
    artifactDrop2: { rcMin: 500, rarities: ['mythique'], thresholds: [500] },
    artifactDropFullClear: 'mythique',
  },
  4: {
    id: 4, name: 'Mythique',
    nameColor: 'text-red-400', bgGradient: 'from-red-900/40 to-red-700/40',
    borderColor: 'border-red-500/30', emoji: '',
    rcPerBar: 1000, maxRC: 10000,
    bossHPMult: 35.0, bossAtkMult: 3.0, bossDefMult: 2.5, bossSpdMult: 1.5,
    coinMult: 10.0, xpMult: 5.0,
    hammerTiers: ['marteau_celeste'], hammerCountBase: 5, hammerCountPerRC: 0.08,
    artifactDrop1: { rcMin: 2000, rarities: ['mythique'], thresholds: [2000] },
    artifactDrop2: { rcMin: 5000, rarities: ['mythique'], thresholds: [5000] },
    artifactDropFullClear: 'mythique',
  },
  5: {
    id: 5, name: 'Divin',
    nameColor: 'text-yellow-300', bgGradient: 'from-yellow-900/40 to-amber-700/40',
    borderColor: 'border-yellow-500/30', emoji: '',
    rcPerBar: 10000, maxRC: 100000,
    bossHPMult: 120.0, bossAtkMult: 4.0, bossDefMult: 3.5, bossSpdMult: 1.8,
    coinMult: 20.0, xpMult: 8.0,
    hammerTiers: ['marteau_celeste'], hammerCountBase: 8, hammerCountPerRC: 0.05,
    artifactDrop1: { rcMin: 20000, rarities: ['mythique'], thresholds: [20000] },
    artifactDrop2: { rcMin: 50000, rarities: ['mythique'], thresholds: [50000] },
    artifactDropFullClear: 'mythique',
  },
  6: {
    id: 6, name: 'Ultime',
    nameColor: 'text-red-300', bgGradient: 'from-red-900/50 to-orange-900/50',
    borderColor: 'border-red-500/40', emoji: '',
    rcPerBar: 1, maxRC: Infinity, infiniteBars: true,
    bossHPMult: 300.0, bossAtkMult: 5.5, bossDefMult: 4.5, bossSpdMult: 2.0,
    coinMult: 40.0, xpMult: 12.0,
    hammerTiers: ['marteau_celeste'], hammerCountBase: 10, hammerCountPerRC: 0.03,
    artifactDrop1: { rcMin: 5, rarities: ['mythique'], thresholds: [5] },
    artifactDrop2: { rcMin: 15, rarities: ['mythique'], thresholds: [15] },
    artifactDropFullClear: 'mythique',
  },
};

export const MAX_RAID_TIER = 6;
export const getTierData = (tierId) => RAID_TIERS[tierId] || RAID_TIERS[1];

// Helper: determine artifact rarity from RC thresholds
export const getTierArtifactRarity = (drop, rc) => {
  if (!drop) return 'rare';
  for (let i = drop.thresholds.length - 1; i >= 0; i--) {
    if (rc >= drop.thresholds[i]) return drop.rarities[Math.min(i, drop.rarities.length - 1)];
  }
  return drop.rarities[0];
};

// ─── Raid Constants ──────────────────────────────────────────

export const RAID_DURATION_SEC = 180;
export const RAID_TICK_MS = 100;
export const BOSS_BASE_INTERVAL_MS = 4000;
export const TEAM_SIZE = 3;

// ─── SPD → attack interval ──────────────────────────────────

export const spdToInterval = (spd) => Math.max(500, 3000 / (1 + spd / 50));

// ─── Team Synergies ──────────────────────────────────────────

export const computeSynergies = (team) => {
  const bonuses = { atk: 0, def: 0, hp: 0, spd: 0, crit: 0, res: 0, allStats: 0 };
  const labels = [];
  if (team.length === 0) return { bonuses, labels };

  const elemCount = {};
  const classSet = new Set();
  let hasSupport = false;
  let hasTank = false;

  team.forEach(c => {
    elemCount[c.element] = (elemCount[c.element] || 0) + 1;
    classSet.add(c.class);
    if (c.class === 'support') hasSupport = true;
    if (c.class === 'tank') hasTank = true;
  });

  const maxElem = Math.max(...Object.values(elemCount));
  if (maxElem >= 3) {
    bonuses.atk += 20;
    bonuses.def += 10;
    labels.push('Trinite elementaire: ATK +20%, DEF +10%');
  } else if (maxElem >= 2) {
    bonuses.atk += 10;
    labels.push('Duo elementaire: ATK +10%');
  }

  if (classSet.size >= 3) {
    bonuses.allStats += 5;
    labels.push('Diversite: +5% toutes stats');
  }

  if (hasSupport) {
    bonuses.hp += 10;
    labels.push('Support: PV +10%');
  }

  if (hasTank) {
    bonuses.def += 10;
    labels.push('Tank: DEF +10%');
  }

  return { bonuses, labels };
};

export const computeCrossTeamSynergy = (team1, team2) => {
  const labels = [];
  const bonuses = { crit: 0 };
  if (team1.length === 0 || team2.length === 0) return { bonuses, labels };

  const domElem = (team) => {
    const cnt = {};
    team.forEach(c => { cnt[c.element] = (cnt[c.element] || 0) + 1; });
    return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0];
  };

  if (domElem(team1) === domElem(team2)) {
    bonuses.crit += 5;
    labels.push('Resonance: CRIT +5%');
  }

  return { bonuses, labels };
};

// ─── Hunter Unlock Thresholds (more tiers for 35 hunters) ────

export const HUNTER_UNLOCK_THRESHOLDS = [
  { rc: 3,   rarity: 'rare',       label: '3 RC' },
  { rc: 8,   rarity: 'rare',       label: '8 RC' },
  { rc: 15,  rarity: 'legendaire', label: '15 RC' },
  { rc: 25,  rarity: 'legendaire', label: '25 RC' },
  { rc: 40,  rarity: 'legendaire', label: '40 RC' },
  { rc: 55,  rarity: 'mythique',   label: '55 RC' },
  { rc: 75,  rarity: 'mythique',   label: '75 RC' },
  { rc: 100, rarity: 'mythique',   label: '100 RC' },
  { rc: 130, rarity: 'mythique',   label: '130 RC' },
  { rc: 170, rarity: 'mythique',   label: '170 RC' },
  { rc: 220, rarity: 'mythique',   label: '220 RC' },
  { rc: 280, rarity: 'mythique',   label: '280 RC' },
];

export const HUNTER_SHOP_PRICES = {
  rare: 500,
  legendaire: 2000,
  mythique: 5000,
};

// ─── Raid Rewards ────────────────────────────────────────────

export const computeRaidRewards = (rc, isFullClear, tierData = RAID_TIERS[1]) => {
  const baseCoins = Math.floor(rc * 200 * tierData.coinMult);
  const fullClearBonus = isFullClear ? Math.floor(500 * tierData.coinMult) : 0;
  const xpPerChibi = Math.floor((150 + rc * 25) * tierData.xpMult);
  return { coins: baseCoins + fullClearBonus, xpPerChibi, isFullClear };
};

// ─── Persistence Keys ────────────────────────────────────────

export const RAID_SAVE_KEY = 'shadow_colosseum_raid';

export const defaultRaidData = () => ({
  hunterCollection: [],
  raidStats: { totalRC: 0, bestRC: 0, totalDamage: 0, raidsPlayed: 0, bestTierCleared: 0, tierBestRC: {} },
  weeklyBoss: {},
  lastTeam: [],
  unlockedTier: 1,
  currentTier: 1,
});

export const loadRaidData = () => {
  try {
    const raw = { ...defaultRaidData(), ...JSON.parse(localStorage.getItem(RAID_SAVE_KEY)) };
    // Migration: convert old string[] hunterCollection to {id, stars}[]
    if (raw.hunterCollection.length > 0 && typeof raw.hunterCollection[0] === 'string') {
      raw.hunterCollection = raw.hunterCollection.map(id => ({ id, stars: 0 }));
    }
    // Migration: add tier fields
    if (!raw.unlockedTier) raw.unlockedTier = 1;
    if (!raw.currentTier) raw.currentTier = 1;
    if (!raw.raidStats.bestTierCleared && raw.raidStats.bestTierCleared !== 0) raw.raidStats.bestTierCleared = 0;
    if (!raw.raidStats.tierBestRC) raw.raidStats.tierBestRC = {};
    localStorage.setItem(RAID_SAVE_KEY, JSON.stringify(raw));
    return raw;
  } catch {
    return defaultRaidData();
  }
};

import { cloudStorage } from '../../utils/CloudStorage';
export const saveRaidData = (d) => cloudStorage.save(RAID_SAVE_KEY, d);

// ─── Hunter Passive Effects (structured, applied in combat) ──────────
// Types:
//   permanent  → stat % applied at entity build time
//   healBonus  → injected into talentBonuses.healBonus
//   buffBonus  → buff effectiveness (support buff durations/values)
//   teamDef    → team-wide DEF % passive
//   lowHp      → stat % when HP < threshold%
//   highHp     → stat % when HP > threshold%
//   firstTurn  → stat % on turn 1 only
//   vsBoss     → stat % vs boss targets
//   stacking   → +X% per attack (max stacks)
//   critDmg    → crit damage bonus %
//   magicDmg   → magic/skill damage bonus (treated as allDamage)
//   aoeDmg     → AoE damage bonus (applied to multi-hit/AoE)
//   defIgnore  → DEF ignore % on crits
//   dotDmg     → DoT damage bonus
//   debuffBonus→ debuff effectiveness bonus
//   skillCd    → stat bonus on skills with cdMax >= N
//   vsLowHp   → stat bonus vs enemies below threshold% HP
//   vsDebuffed→ stat bonus vs debuffed enemies

export const HUNTER_PASSIVE_EFFECTS = {
  // ── FIRE ──
  h_kanae:     { type: 'firstTurn', stats: { spd: 20 } },
  h_stark:     { type: 'lowHp', threshold: 40, stats: { def: 30 } },
  h_fern:      { type: 'permanent', stats: { atk: 15 } },
  h_reed:      { type: 'teamDef', value: 10 },
  h_choi:      { type: 'aoeDmg', value: 15 },
  h_emma:      { type: 'permanent', stats: { def: 20 } },
  h_esil:      { type: 'lowHp', threshold: 50, stats: { def: 25 } },
  h_yuqi:      { type: 'permanent', stats: { hp: 15 } },
  h_yoo:       { type: 'skillCd', minCd: 3, stats: { crit: 10 } },
  h_gina:      { type: 'healBonus', value: 15 },
  h_song:      { type: 'vsBoss', stats: { atk: 10 } },
  h_megumin:   { type: 'teamAura', stats: { atk: 10, def: 10, spd: 10 } },
  // ── WATER ──
  h_chae_in:   { type: 'permanent', stats: { atk: 10, spd: 10 } },
  h_frieren:   { type: 'magicDmg', value: 25 },
  h_alicia:    { type: 'critDmg', value: 20 },
  h_meri:      { type: 'buffBonus', value: 15 },
  h_shuhua:    { type: 'permanent', stats: { atk: 12 } },
  h_meilin:    { type: 'healBonus', value: 20 },
  h_seo:       { type: 'permanent', stats: { hp: 20 } },
  h_anna:      { type: 'permanent', stats: { crit: 12 } },
  h_han_song:  { type: 'permanent', stats: { spd: 15 } },
  h_seorin:    { type: 'vsLowHp', threshold: 50, stats: { crit: 8 } },
  h_lee_johee: { type: 'healBonus', value: 10 },
  h_nam:       { type: 'permanent', stats: { spd: 10 } },
  // ── SHADOW ──
  h_ilhwan:    { type: 'highHp', threshold: 80, stats: { crit: 15 } },
  h_minnie:    { type: 'defIgnore', value: 10 },
  h_silverbaek:{ type: 'highHp', threshold: 70, stats: { atk: 20 } },
  h_sian:      { type: 'stacking', perStack: { atk: 3 }, maxStacks: 10 },
  h_charlotte: { type: 'dotDmg', value: 25 },
  h_lee_bora:  { type: 'debuffBonus', value: 15 },
  h_harper:    { type: 'permanent', stats: { def: 20 } },
  h_lim:       { type: 'vsDebuffed', stats: { atk: 15 } },
  h_kang:      { type: 'permanent', stats: { crit: 10 } },
  h_son:       { type: 'permanent', stats: { res: 15 } },
  h_isla:      { type: 'healBonus', value: 10 },
  h_hwang:     { type: 'permanent', stats: { def: 10 } },
  // ── ATTACK ON TITAN ──
  h_mikasa:    { type: 'teamAura', stats: { atk: 12, spd: 8 } },
  // ── TOKYO GHOUL ──
  h_kaneki:    { type: 'lowHp', threshold: 50, stats: { atk: 30, crit: 15 } },
  // ── FATE ──
  h_saber:     { type: 'chaotic', effects: [
    { chance: 0.40, stats: { atk: 20 }, label: 'ATK +20%' },
    { chance: 0.25, stats: { crit: 15 }, label: 'CRIT +15' },
    { chance: 0.20, stats: { spd: 20 }, label: 'SPD +20%' },
    { chance: 0.15, stats: { atk: 30, spd: 15, crit: 10 }, label: 'JACKPOT !' },
  ]},
  // ── JUJUTSU KAISEN ──
  h_sukuna:    { type: 'stacking', perStack: { spd: 8, crit: 3 }, maxStacks: 6 },
  h_gojo:      { type: 'permanent', stats: { def: 25, crit: 15, res: 10 } },
  // ── BERSERK ──
  h_guts:      { type: 'berserker', tiers: [
    { threshold: 70, stats: { atk: 15, spd: 5 } },
    { threshold: 40, stats: { atk: 35, spd: 15, crit: 10 } },
    { threshold: 20, stats: { atk: 60, spd: 25, crit: 20 } },
  ]},
  // ── CHIBI ──
  h_daijin:    { type: 'permanent', stats: { spd: 15, crit: 10 } },
  h_pod042:    { type: 'teamDef', value: 10 },
  // ── STEINS;GATE ──
  h_kurisu:    { type: 'stacking', perStack: { atk: 5 }, maxStacks: 6 },
  h_mayuri:    { type: 'teamAura', stats: { atk: 15, def: 10 } },
  // ── NIER AUTOMATA ──
  h_a9:        { type: 'vsLowHp', threshold: 30, stats: { atk: 25 } },
  h_2b:        { type: 'vsDebuffed', stats: { atk: 15 } },
  h_pascal:    { type: 'teamAura', stats: { res: 10 } },
  h_a2:        { type: 'lowHp', threshold: 50, stats: { atk: 20, spd: 15 } },
};

export const getHunterPassive = (hunterId) => HUNTER_PASSIVE_EFFECTS[hunterId] || null;

// ─── Nier Automata — Special Drop System ─────────────────────────
// Each Nier hunter has its own drop config (stage/tier, chance)
// stageId = specific stage only | tier = any stage in that tier
export const NIER_HUNTERS = ['h_2b', 'h_pascal', 'h_a2', 'h_a9', 'h_mikasa', 'h_kaneki', 'h_saber', 'h_daijin', 'h_pod042', 'h_kurisu', 'h_mayuri'];
export const NIER_DROP_CONFIGS = {
  h_2b:     { stageId: 'a2_eve',           tier: 6, isBossOnly: true,  baseChance: 0.0035, perStarBonus: 0.0001 }, // 0.35%
  h_pascal: { stageId: 'a2_roi_machines',  tier: 5, isBossOnly: true,  baseChance: 0.006,  perStarBonus: 0.0001 }, // 0.60%
  h_a2:     {                              tier: 4, isBossOnly: false, baseChance: 0.009,  perStarBonus: 0.0001 }, // 0.90%
  h_a9:     { minTier: 5,                           isBossOnly: false, baseChance: 0.01,   perStarBonus: 0 },      // 1% (1/100) tiers 5-6
  h_mikasa: { minTier: 5,                           isBossOnly: false, baseChance: 0.002,  perStarBonus: 0 },      // 0.2% (1/500) tiers 5-6
  h_kaneki: { minTier: 5,                           isBossOnly: false, baseChance: 0.002,  perStarBonus: 0 },      // 0.2% (1/500) tiers 5-6
  h_saber:  { minTier: 5,                           isBossOnly: false, baseChance: 0.01,   perStarBonus: 0 },      // 1% (1/100) tiers 5-6
  h_daijin: { minTier: 5,                           isBossOnly: false, baseChance: 0.01,   perStarBonus: 0 },      // 1% (1/100) tiers 5-6
  h_pod042: { minTier: 5,                           isBossOnly: false, baseChance: 0.01,   perStarBonus: 0 },      // 1% (1/100) tiers 5-6
  h_kurisu: { minTier: 5,                           isBossOnly: false, baseChance: 0.01,   perStarBonus: 0 },      // 1% (1/100) tiers 5-6
  h_mayuri: { minTier: 5,                           isBossOnly: false, baseChance: 0.005,  perStarBonus: 0 },      // 0.5% (1/200) tiers 5-6
};
// Legacy alias for backward compat
export const NIER_DROP_CONFIG = NIER_DROP_CONFIGS.h_2b;

export function rollNierHunterDrop(stageId, stageTier, isBoss, star = 0) {
  for (const id of NIER_HUNTERS) {
    const cfg = NIER_DROP_CONFIGS[id];
    // Skip if config requires boss stage and this isn't one
    if (cfg.isBossOnly && !isBoss) continue;
    // Match by specific stageId, minTier (>=), or exact tier
    const stageMatch = cfg.stageId ? (cfg.stageId === stageId)
                     : cfg.minTier ? (stageTier >= cfg.minTier)
                     : (cfg.tier === stageTier);
    if (!stageMatch) continue;
    const chance = cfg.baseChance + star * cfg.perStarBonus;
    if (Math.random() < chance) return id;
  }
  return null;
}

// ─── Boss Hunter Drops — Hunters that drop from World Bosses ─────
export const BOSS_HUNTER_DROPS = {
  h_guts:    { bosses: ['ragnarok', 'zephyr', 'supreme_monarch', 'archdemon'], baseChance: 1 / 1500 }, // 1/1500
  h_megumin: { bosses: ['ragnarok', 'zephyr', 'supreme_monarch', 'archdemon'], baseChance: 1 / 1000 }, // 1/1000
  h_sukuna:  { bosses: ['ragnarok', 'zephyr', 'supreme_monarch', 'archdemon', 'ant_queen'], baseChance: 1 / 1500, minTier: 5 }, // 1/1500, Divin+ only
  h_gojo:    { bosses: ['ragnarok', 'zephyr', 'supreme_monarch', 'archdemon'], baseChance: 1 / 1000 }, // 1/1000
};

export function rollBossHunterDrop(bossId, lootMult = 1, tier = 1) {
  for (const [hunterId, cfg] of Object.entries(BOSS_HUNTER_DROPS)) {
    if (!cfg.bosses.includes(bossId)) continue;
    if (cfg.minTier && tier < cfg.minTier) continue;
    if (Math.random() < cfg.baseChance * lootMult) return hunterId;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSAL DROP SYSTEM — Same rates everywhere (ARC I, ARC II, Raid)
// Hunters: 5 rolls × 1% per victory
// Set Ultime: 5 rolls × 0.5% per victory
// ═══════════════════════════════════════════════════════════════

export const UNIVERSAL_HUNTER_DROPS = { rollCount: 5, chance: 0.01 };
export const UNIVERSAL_SET_ULTIME_DROPS = { rollCount: 5, chance: 0.005 };

export const MANAYA_PIECE_SLOTS = ['weapon', 'helmet', 'chest', 'gloves', 'boots', 'necklace', 'bracelet', 'ring', 'earring'];
export const MANAYA_PIECE_NAMES = {
  weapon: 'Griffe de Manaya', helmet: 'Diademe de Manaya', chest: 'Plastron de Manaya',
  gloves: 'Serres de Manaya', boots: 'Pas de Manaya', necklace: 'Pendentif de Manaya',
  bracelet: 'Chaine de Manaya', ring: 'Sceau de Manaya', earring: 'Larme de Manaya',
};

// Roll universal hunter drops: 5 rolls × 1%, any hunter from HUNTERS pool
export function rollUniversalHunterDrops() {
  const hunterIds = Object.keys(HUNTERS);
  if (hunterIds.length === 0) return [];
  const drops = [];
  for (let i = 0; i < UNIVERSAL_HUNTER_DROPS.rollCount; i++) {
    if (Math.random() < UNIVERSAL_HUNTER_DROPS.chance) {
      const pickId = hunterIds[Math.floor(Math.random() * hunterIds.length)];
      const h = HUNTERS[pickId];
      drops.push({ id: pickId, name: h.name, rarity: h.rarity, series: h.series || null });
    }
  }
  return drops;
}

// Roll universal set ultime drops: 5 rolls × 0.5%, random Manaya piece
export function rollUniversalSetUltimeDrops() {
  const drops = [];
  for (let i = 0; i < UNIVERSAL_SET_ULTIME_DROPS.rollCount; i++) {
    if (Math.random() < UNIVERSAL_SET_ULTIME_DROPS.chance) {
      const slot = MANAYA_PIECE_SLOTS[Math.floor(Math.random() * MANAYA_PIECE_SLOTS.length)];
      drops.push({ slot, name: MANAYA_PIECE_NAMES[slot] });
    }
  }
  return drops;
}

// ─── Hunter Drop Sources (for codex display) ─────────────────────
// Universal system: all hunters drop from all modes (5 rolls × 1%)
export function getHunterDropSources(hunterId) {
  const sources = [];

  // 1. Universal drop — ALL modes (ARC I, ARC II, Raid Manaya)
  sources.push({ type: 'universal', label: 'Drop Universel', detail: '5 tirages × 1% par victoire (ARC I, ARC II, Raid)', color: '#ff2d55' });

  // 2. RC Unlock (all non-special hunters)
  const h = HUNTERS[hunterId];
  if (h && !h.series) {
    sources.push({ type: 'rc', label: 'Unlock RC', detail: 'Paliers RC (3-280)', color: '#60a5fa' });
  }

  // 3. Shop (all non-special hunters)
  if (h && !h.series) {
    const price = HUNTER_SHOP_PRICES[h.rarity] || '?';
    sources.push({ type: 'shop', label: 'Boutique', detail: price + ' coins', color: '#10b981' });
  }

  return sources;
}

// ─── Hunter Skins System ─────────────────────────────────────────
// Each hunter can have alternate skins. 'default' is always owned.
// Skins can drop from specific stages or be unlocked via events.
// If a skin drops and the hunter isn't owned → auto-unlock hunter + skin.

export const HUNTER_SKINS = {
  h_kaneki: [
    { id: 'default', name: 'Ken Kaneki', sprite: S.h_kaneki },
    { id: 'legendary', name: 'Kaneki Legendaire', sprite: S.h_kaneki_skin,
      dropChance: 0.005, minTier: 5 },
  ],
  h_kurisu: [
    { id: 'default', name: 'Kurisu Makise', sprite: S.h_kurisu },
    { id: 'legendary', name: 'Kurisu Legendaire', sprite: S.h_kurisu_skin,
      dropChance: 0.005, minTier: 5 },
  ],
  h_2b: [
    { id: 'default', name: '2B', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771499926/2B_vly2pt.png' },
    { id: 'pink', name: '2B Rose', sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771500244/2B_PINK_rvidyt.png',
      dropChance: 0.0005, stageId: 'a2_eve' },
  ],
  h_a2: [
    { id: 'default', name: 'A2', sprite: S.h_a2 },
    { id: 'bunny', name: 'A2 Bunny', sprite: S.h_a2_bunny,
      dropChance: 0.005, tier: 4 },
  ],
};

export function rollSkinDrop(stageId, stageTier) {
  const drops = [];
  for (const [hunterId, skins] of Object.entries(HUNTER_SKINS)) {
    for (const skin of skins) {
      if (skin.id === 'default') continue;
      // Match by stageId, minTier (>=), exact tier, or any
      const match = skin.stageId ? (skin.stageId === stageId) : skin.minTier ? (stageTier >= skin.minTier) : skin.tier ? (skin.tier === stageTier) : true;
      if (!match) continue;
      if (skin.dropChance && Math.random() < skin.dropChance) {
        drops.push({ hunterId, skinId: skin.id, skinName: skin.name, sprite: skin.sprite });
      }
    }
  }
  return drops.length > 0 ? drops[0] : null;
}

export function getHunterSprite(hunterId, data) {
  const activeSkin = data?.activeSkin?.[hunterId];
  if (activeSkin && HUNTER_SKINS[hunterId]) {
    const skin = HUNTER_SKINS[hunterId].find(s => s.id === activeSkin);
    if (skin) return skin.sprite;
  }
  return HUNTERS[hunterId]?.sprite || '';
}

// ─── Star (Advancement) stat bonuses ─────────────────────────────
// Each duplicate (star) gives cumulative % bonuses to stats.
// A0-A5 use fixed bonuses, A6-A200 every 5 levels = +1%, A201-A1000 every 10 levels = +1%
export const STAR_STAT_BONUSES = {
  0: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 },
  1: { hp: 5, atk: 3, def: 2, spd: 0, crit: 0, res: 0 },
  2: { hp: 8, atk: 5, def: 3, spd: 2, crit: 1, res: 0 },
  3: { hp: 12, atk: 8, def: 5, spd: 3, crit: 2, res: 1 },
  4: { hp: 16, atk: 12, def: 8, spd: 4, crit: 3, res: 2 },
  5: { hp: 20, atk: 15, def: 10, spd: 5, crit: 5, res: 3 },
};

// Compute dynamic star bonuses
// A0-A5: fixed table, A6-A200: +1% HP/ATK/DEF every 5 levels, A201-A1000: +1% every 10 levels
const computeStarBonuses = (stars) => {
  if (stars <= 5) {
    return STAR_STAT_BONUSES[stars] || STAR_STAT_BONUSES[0];
  }

  const baseBonus = STAR_STAT_BONUSES[5];
  let extraBonus;

  if (stars <= 200) {
    // A6-A200: every 5 awakening levels = +1% HP/ATK/DEF
    const extraTiers = Math.floor(stars / 5) - 1; // -1 because A5 is already in base
    extraBonus = extraTiers * 1;
  } else {
    // A201-A1000: bonus at A200 + every 10 levels = +1%
    const bonusAt200 = Math.floor(200 / 5) - 1; // 39
    const extraTiers = Math.floor((stars - 200) / 10);
    extraBonus = bonusAt200 + extraTiers;
  }

  return {
    hp: baseBonus.hp + extraBonus,
    atk: baseBonus.atk + extraBonus,
    def: baseBonus.def + extraBonus,
    spd: baseBonus.spd,
    crit: baseBonus.crit,
    res: baseBonus.res,
  };
};

// Apply star bonuses to a stats object (mutates in-place)
export const applyStarBonuses = (stats, stars) => {
  const bonus = computeStarBonuses(stars);
  if (bonus.hp)   stats.hp  = Math.floor(stats.hp  * (1 + bonus.hp / 100));
  if (bonus.atk)  stats.atk = Math.floor(stats.atk * (1 + bonus.atk / 100));
  if (bonus.def)  stats.def = Math.floor(stats.def * (1 + bonus.def / 100));
  if (bonus.spd)  stats.spd = Math.floor(stats.spd * (1 + bonus.spd / 100));
  if (bonus.crit) stats.crit += bonus.crit;
  if (bonus.res)  stats.res += bonus.res;
  return stats;
};

// ─── Helper: get available pool (shadow chibis + unlocked hunters) ─

export const getHunterPool = (raidData) => {
  const pool = {};
  (raidData.hunterCollection || []).forEach(entry => {
    const id = typeof entry === 'string' ? entry : entry.id;
    const stars = typeof entry === 'string' ? 0 : (entry.stars || 0);
    if (HUNTERS[id]) pool[id] = { ...HUNTERS[id], stars };
  });
  return pool;
};

// ─── Eveil helpers ──────────────────────────────────────────────

export const getHunterStars = (raidData, hunterId) => {
  const entry = (raidData.hunterCollection || []).find(e =>
    (typeof e === 'string' ? e : e.id) === hunterId
  );
  if (!entry) return 0;
  return typeof entry === 'string' ? 0 : (entry.stars || 0);
};

export const addHunterOrDuplicate = (raidData, hunterId) => {
  const collection = (raidData.hunterCollection || []).map(e =>
    typeof e === 'string' ? { id: e, stars: 0 } : { ...e }
  );
  const idx = collection.findIndex(e => e.id === hunterId);
  if (idx >= 0) {
    if (collection[idx].stars < 1000) collection[idx].stars++; // Max A1000
    return { collection, isDuplicate: true, newStars: collection[idx].stars };
  }
  collection.push({ id: hunterId, stars: 0 });
  return { collection, isDuplicate: false, newStars: 0 };
};
