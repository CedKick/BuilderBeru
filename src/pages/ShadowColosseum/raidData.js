// raidData.js — Hunter Chibis (ALL Fire/Water/Dark), Raid Bosses, Sung Jinwoo Skills & Synergies
// Mode Raid pour Shadow Colosseum — 35 Hunters

// ─── Hunter Chibi Sprites (from characters.js icons) ─────────

const S = {
  // FIRE (11)
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
};

// ═══════════════════════════════════════════════════════════════
// 35 HUNTER CHIBIS — Fire / Water / Shadow
// ═══════════════════════════════════════════════════════════════

export const HUNTERS = {

  // ─── FIRE ───────────────────────────────────────────── (11)

  h_kanae: {
    name: 'Tawata Kanae', element: 'fire', rarity: 'mythique', class: 'assassin',
    sprite: S.h_kanae, passiveDesc: 'SPD +20% au 1er tour',
    base:   { hp: 350, atk: 52, def: 16, spd: 42, crit: 22, res: 4 },
    growth: { hp: 11, atk: 3.8, def: 0.9, spd: 2.0, crit: 0.7, res: 0.2 },
    skills: [
      { name: 'Flamme Eclair', power: 110, cdMax: 0 },
      { name: 'Dague Incandescente', power: 200, cdMax: 3 },
      { name: 'Embrasement', power: 150, cdMax: 2, buffAtk: 25, buffDur: 2 },
    ],
  },
  h_stark: {
    name: 'Stark', element: 'fire', rarity: 'mythique', class: 'fighter',
    sprite: S.h_stark, passiveDesc: 'DEF +30% quand PV < 40%',
    base:   { hp: 520, atk: 46, def: 30, spd: 24, crit: 10, res: 12 },
    growth: { hp: 17, atk: 3.2, def: 1.8, spd: 1.1, crit: 0.3, res: 0.5 },
    skills: [
      { name: 'Poing Ardent', power: 105, cdMax: 0 },
      { name: 'Eruption Offensive', power: 185, cdMax: 3 },
      { name: 'Garde de Flamme', power: 0, cdMax: 4, buffDef: 60, buffDur: 3 },
    ],
  },
  h_fern: {
    name: 'Fern', element: 'fire', rarity: 'mythique', class: 'fighter',
    sprite: S.h_fern, passiveDesc: 'ATK +15% permanent',
    base:   { hp: 440, atk: 54, def: 22, spd: 32, crit: 16, res: 6 },
    growth: { hp: 14, atk: 3.8, def: 1.2, spd: 1.5, crit: 0.5, res: 0.2 },
    skills: [
      { name: 'Magie Offensive', power: 112, cdMax: 0 },
      { name: 'Destruction Totale', power: 210, cdMax: 4 },
      { name: 'Flamme de Fern', power: 155, cdMax: 2 },
    ],
  },
  h_reed: {
    name: 'Christopher Reed', element: 'fire', rarity: 'mythique', class: 'support',
    sprite: S.h_reed, passiveDesc: 'DEF equipe +10% passif',
    base:   { hp: 480, atk: 34, def: 32, spd: 26, crit: 8, res: 18 },
    growth: { hp: 16, atk: 2.2, def: 1.8, spd: 1.2, crit: 0.3, res: 0.7 },
    skills: [
      { name: 'Flamme Gardienne', power: 90, cdMax: 0 },
      { name: 'Mur de Feu', power: 0, cdMax: 3, buffDef: 50, buffDur: 3 },
      { name: 'Infusion de Force', power: 0, cdMax: 4, buffAtk: 40, buffDur: 3 },
    ],
  },
  h_choi: {
    name: 'Choi Jong-In', element: 'fire', rarity: 'legendaire', class: 'mage',
    sprite: S.h_choi, passiveDesc: 'Degats AoE +15%',
    base:   { hp: 360, atk: 48, def: 18, spd: 28, crit: 14, res: 12 },
    growth: { hp: 12, atk: 3.4, def: 1.0, spd: 1.3, crit: 0.5, res: 0.5 },
    skills: [
      { name: 'Boule de Feu', power: 105, cdMax: 0 },
      { name: 'Eruption Ardente', power: 195, cdMax: 3 },
      { name: 'Inferno', power: 150, cdMax: 2, debuffDef: 20, debuffDur: 2 },
    ],
  },
  h_emma: {
    name: 'Emma Laurent', element: 'fire', rarity: 'legendaire', class: 'tank',
    sprite: S.h_emma, passiveDesc: 'DEF +20%, aggro augmentee',
    base:   { hp: 580, atk: 28, def: 40, spd: 18, crit: 5, res: 18 },
    growth: { hp: 19, atk: 1.8, def: 2.2, spd: 0.8, crit: 0.2, res: 0.7 },
    skills: [
      { name: 'Bouclier Brulant', power: 88, cdMax: 0 },
      { name: 'Forteresse Ignee', power: 0, cdMax: 3, buffDef: 70, buffDur: 3 },
      { name: 'Soin de Braise', power: 0, cdMax: 4, healSelf: 30 },
    ],
  },
  h_esil: {
    name: 'Esil Radiru', element: 'fire', rarity: 'legendaire', class: 'fighter',
    sprite: S.h_esil, passiveDesc: 'DEF +25% quand PV < 50%',
    base:   { hp: 480, atk: 44, def: 28, spd: 26, crit: 12, res: 10 },
    growth: { hp: 16, atk: 3.0, def: 1.6, spd: 1.2, crit: 0.4, res: 0.4 },
    skills: [
      { name: 'Coup de Lance', power: 100, cdMax: 0 },
      { name: 'Charge Brulante', power: 180, cdMax: 3 },
      { name: 'Garde de Feu', power: 0, cdMax: 4, buffDef: 50, buffDur: 3 },
    ],
  },
  h_yuqi: {
    name: 'Yuqi', element: 'fire', rarity: 'legendaire', class: 'fighter',
    sprite: S.h_yuqi, passiveDesc: 'PV +15% permanent',
    base:   { hp: 500, atk: 40, def: 26, spd: 24, crit: 10, res: 10 },
    growth: { hp: 17, atk: 2.8, def: 1.5, spd: 1.1, crit: 0.3, res: 0.4 },
    skills: [
      { name: 'Frappe Brisante', power: 100, cdMax: 0 },
      { name: 'Impact Volcanique', power: 175, cdMax: 3 },
      { name: 'Aura Brulante', power: 0, cdMax: 4, buffAtk: 35, buffDur: 3 },
    ],
  },
  h_yoo: {
    name: 'Yoo Soohyun', element: 'fire', rarity: 'legendaire', class: 'mage',
    sprite: S.h_yoo, passiveDesc: 'CRIT +10% sur skills CD3+',
    base:   { hp: 350, atk: 46, def: 17, spd: 30, crit: 16, res: 10 },
    growth: { hp: 11, atk: 3.4, def: 0.9, spd: 1.4, crit: 0.5, res: 0.4 },
    skills: [
      { name: 'Lance de Flamme', power: 102, cdMax: 0 },
      { name: 'Meteore', power: 190, cdMax: 3 },
      { name: 'Combustion', power: 140, cdMax: 2, debuffDef: 15, debuffDur: 2 },
    ],
  },
  h_gina: {
    name: 'Gina', element: 'fire', rarity: 'rare', class: 'support',
    sprite: S.h_gina, passiveDesc: 'Soin +15% efficacite',
    base:   { hp: 400, atk: 28, def: 22, spd: 26, crit: 8, res: 14 },
    growth: { hp: 13, atk: 2.0, def: 1.3, spd: 1.1, crit: 0.3, res: 0.5 },
    skills: [
      { name: 'Flammeche', power: 85, cdMax: 0 },
      { name: 'Soin Igné', power: 0, cdMax: 4, healSelf: 22 },
      { name: 'Protection de Feu', power: 0, cdMax: 3, buffDef: 35, buffDur: 3 },
    ],
  },
  h_song: {
    name: 'Song Chiyul', element: 'fire', rarity: 'rare', class: 'mage',
    sprite: S.h_song, passiveDesc: 'ATK +10% contre boss',
    base:   { hp: 330, atk: 42, def: 15, spd: 28, crit: 12, res: 8 },
    growth: { hp: 10, atk: 3.0, def: 0.9, spd: 1.2, crit: 0.4, res: 0.3 },
    skills: [
      { name: 'Etincelle', power: 95, cdMax: 0 },
      { name: 'Pyrotechnie', power: 170, cdMax: 3 },
      { name: 'Flamme Dansante', power: 130, cdMax: 2 },
    ],
  },

  // ─── WATER ──────────────────────────────────────────── (12)

  h_chae_in: {
    name: 'Cha Hae-In', element: 'water', rarity: 'mythique', class: 'fighter',
    sprite: S.h_chae_in, passiveDesc: 'ATK et SPD +10% permanent',
    base:   { hp: 440, atk: 52, def: 24, spd: 36, crit: 18, res: 8 },
    growth: { hp: 14, atk: 3.8, def: 1.3, spd: 1.7, crit: 0.5, res: 0.3 },
    skills: [
      { name: 'Coup d\'Epee', power: 110, cdMax: 0 },
      { name: 'Frappe Celeste', power: 195, cdMax: 3 },
      { name: 'Danse du Sabre', power: 155, cdMax: 2, buffAtk: 30, buffDur: 2 },
    ],
  },
  h_frieren: {
    name: 'Frieren', element: 'water', rarity: 'mythique', class: 'mage',
    sprite: S.h_frieren, passiveDesc: 'Degats magiques +25%',
    base:   { hp: 360, atk: 56, def: 15, spd: 28, crit: 18, res: 10 },
    growth: { hp: 11, atk: 4.0, def: 0.8, spd: 1.3, crit: 0.6, res: 0.4 },
    skills: [
      { name: 'Zoltraak', power: 115, cdMax: 0 },
      { name: 'Magie Ancienne', power: 225, cdMax: 4 },
      { name: 'Gel Eternel', power: 165, cdMax: 3, debuffDef: 25, debuffDur: 2 },
    ],
  },
  h_alicia: {
    name: 'Alicia Blanche', element: 'water', rarity: 'mythique', class: 'mage',
    sprite: S.h_alicia, passiveDesc: 'CRIT DMG +20%',
    base:   { hp: 370, atk: 54, def: 16, spd: 30, crit: 20, res: 8 },
    growth: { hp: 12, atk: 3.8, def: 0.9, spd: 1.4, crit: 0.6, res: 0.3 },
    skills: [
      { name: 'Lame de Glace', power: 108, cdMax: 0 },
      { name: 'Blizzard Absolu', power: 210, cdMax: 4 },
      { name: 'Givre Tranchant', power: 155, cdMax: 2 },
    ],
  },
  h_meri: {
    name: 'Meri Laine', element: 'water', rarity: 'mythique', class: 'support',
    sprite: S.h_meri, passiveDesc: 'Buff equipe +15% efficacite',
    base:   { hp: 460, atk: 30, def: 28, spd: 28, crit: 8, res: 16 },
    growth: { hp: 15, atk: 2.0, def: 1.5, spd: 1.3, crit: 0.3, res: 0.6 },
    skills: [
      { name: 'Vague d\'Infusion', power: 88, cdMax: 0 },
      { name: 'Maree Soignante', power: 0, cdMax: 4, healSelf: 28 },
      { name: 'Courant Renforcant', power: 0, cdMax: 3, buffAtk: 40, buffDur: 3 },
    ],
  },
  h_shuhua: {
    name: 'Shuhua', element: 'water', rarity: 'legendaire', class: 'fighter',
    sprite: S.h_shuhua, passiveDesc: 'ATK +12% permanent',
    base:   { hp: 450, atk: 46, def: 24, spd: 30, crit: 14, res: 8 },
    growth: { hp: 15, atk: 3.4, def: 1.3, spd: 1.4, crit: 0.4, res: 0.3 },
    skills: [
      { name: 'Poing d\'Eau', power: 105, cdMax: 0 },
      { name: 'Raz-de-Maree', power: 180, cdMax: 3 },
      { name: 'Vague Protectrice', power: 0, cdMax: 4, buffDef: 40, buffDur: 3 },
    ],
  },
  h_meilin: {
    name: 'Meilin Fisher', element: 'water', rarity: 'legendaire', class: 'support',
    sprite: S.h_meilin, passiveDesc: 'Soin +20% efficacite',
    base:   { hp: 430, atk: 26, def: 24, spd: 28, crit: 8, res: 16 },
    growth: { hp: 14, atk: 1.8, def: 1.4, spd: 1.2, crit: 0.3, res: 0.6 },
    skills: [
      { name: 'Eclat Glace', power: 85, cdMax: 0 },
      { name: 'Source de Vie', power: 0, cdMax: 4, healSelf: 25 },
      { name: 'Barriere d\'Eau', power: 0, cdMax: 3, buffDef: 45, buffDur: 3 },
    ],
  },
  h_seo: {
    name: 'Seo Jiwoo', element: 'water', rarity: 'legendaire', class: 'tank',
    sprite: S.h_seo, passiveDesc: 'PV +20%, aggro augmentee',
    base:   { hp: 600, atk: 26, def: 38, spd: 18, crit: 5, res: 20 },
    growth: { hp: 20, atk: 1.8, def: 2.2, spd: 0.8, crit: 0.2, res: 0.8 },
    skills: [
      { name: 'Bouclier Glacial', power: 85, cdMax: 0 },
      { name: 'Mur de Glace', power: 0, cdMax: 3, buffDef: 70, buffDur: 3 },
      { name: 'Soin Aquatique', power: 0, cdMax: 4, healSelf: 35 },
    ],
  },
  h_anna: {
    name: 'Anna Ruiz', element: 'water', rarity: 'legendaire', class: 'assassin',
    sprite: S.h_anna, passiveDesc: 'CRIT +12% permanent',
    base:   { hp: 360, atk: 46, def: 16, spd: 36, crit: 18, res: 5 },
    growth: { hp: 11, atk: 3.4, def: 0.9, spd: 1.8, crit: 0.6, res: 0.2 },
    skills: [
      { name: 'Fleche de Glace', power: 105, cdMax: 0 },
      { name: 'Tir Perforant', power: 185, cdMax: 3 },
      { name: 'Pluie de Fleches', power: 140, cdMax: 2 },
    ],
  },
  h_han_song: {
    name: 'Han Song-Yi', element: 'water', rarity: 'legendaire', class: 'assassin',
    sprite: S.h_han_song, passiveDesc: 'SPD +15% permanent',
    base:   { hp: 340, atk: 48, def: 15, spd: 40, crit: 20, res: 4 },
    growth: { hp: 11, atk: 3.5, def: 0.9, spd: 1.9, crit: 0.6, res: 0.2 },
    skills: [
      { name: 'Lame d\'Eau', power: 108, cdMax: 0 },
      { name: 'Frappe Eclair', power: 190, cdMax: 3 },
      { name: 'Danse Mortelle', power: 150, cdMax: 2, buffAtk: 20, buffDur: 2 },
    ],
  },
  h_seorin: {
    name: 'Seorin', element: 'water', rarity: 'rare', class: 'assassin',
    sprite: S.h_seorin, passiveDesc: 'CRIT +8% contre ennemis PV < 50%',
    base:   { hp: 320, atk: 40, def: 14, spd: 36, crit: 16, res: 4 },
    growth: { hp: 10, atk: 2.8, def: 0.8, spd: 1.8, crit: 0.5, res: 0.2 },
    skills: [
      { name: 'Fleche Rapide', power: 95, cdMax: 0 },
      { name: 'Tir Glacial', power: 165, cdMax: 3 },
      { name: 'Esquive Aquatique', power: 0, cdMax: 3, buffAtk: 30, buffDur: 2 },
    ],
  },
  h_lee_johee: {
    name: 'Lee Johee', element: 'water', rarity: 'rare', class: 'support',
    sprite: S.h_lee_johee, passiveDesc: 'Soin +10% efficacite',
    base:   { hp: 400, atk: 24, def: 22, spd: 24, crit: 6, res: 14 },
    growth: { hp: 13, atk: 1.6, def: 1.3, spd: 1.0, crit: 0.2, res: 0.5 },
    skills: [
      { name: 'Lumiere Soignante', power: 80, cdMax: 0 },
      { name: 'Regeneration', power: 0, cdMax: 4, healSelf: 22 },
      { name: 'Benediction', power: 0, cdMax: 3, buffDef: 30, buffDur: 3 },
    ],
  },
  h_nam: {
    name: 'Nam Chae-Young', element: 'water', rarity: 'rare', class: 'assassin',
    sprite: S.h_nam, passiveDesc: 'SPD +10% permanent',
    base:   { hp: 320, atk: 38, def: 14, spd: 34, crit: 14, res: 4 },
    growth: { hp: 10, atk: 2.6, def: 0.8, spd: 1.7, crit: 0.4, res: 0.2 },
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
    base:   { hp: 380, atk: 54, def: 18, spd: 40, crit: 22, res: 5 },
    growth: { hp: 12, atk: 3.8, def: 1.0, spd: 1.8, crit: 0.6, res: 0.2 },
    skills: [
      { name: 'Lame d\'Ombre', power: 112, cdMax: 0 },
      { name: 'Assassinat', power: 205, cdMax: 3 },
      { name: 'Danse de l\'Ombre', power: 160, cdMax: 2, buffAtk: 25, buffDur: 2 },
    ],
  },
  h_minnie: {
    name: 'Minnie', element: 'shadow', rarity: 'mythique', class: 'assassin',
    sprite: S.h_minnie, passiveDesc: 'DEF ignore +10% sur crits',
    base:   { hp: 360, atk: 50, def: 20, spd: 38, crit: 20, res: 6 },
    growth: { hp: 11, atk: 3.6, def: 1.0, spd: 1.8, crit: 0.6, res: 0.2 },
    skills: [
      { name: 'Frappe Sournoise', power: 108, cdMax: 0 },
      { name: 'Embuscade Nocturne', power: 195, cdMax: 3 },
      { name: 'Voile d\'Ombre', power: 0, cdMax: 3, buffAtk: 35, buffDur: 2 },
    ],
  },
  h_silverbaek: {
    name: 'Baek Yoonho', element: 'shadow', rarity: 'mythique', class: 'fighter',
    sprite: S.h_silverbaek, passiveDesc: 'ATK +20% quand PV > 70%',
    base:   { hp: 500, atk: 52, def: 28, spd: 28, crit: 14, res: 10 },
    growth: { hp: 16, atk: 3.8, def: 1.5, spd: 1.3, crit: 0.4, res: 0.4 },
    skills: [
      { name: 'Griffe d\'Argent', power: 110, cdMax: 0 },
      { name: 'Metamorphose', power: 200, cdMax: 4, buffAtk: 40, buffDur: 3 },
      { name: 'Rugissement Bestial', power: 170, cdMax: 3 },
    ],
  },
  h_sian: {
    name: 'Sian Halat', element: 'shadow', rarity: 'mythique', class: 'assassin',
    sprite: S.h_sian, passiveDesc: 'ATK +3% par attaque (stack x10)',
    base:   { hp: 370, atk: 50, def: 18, spd: 38, crit: 18, res: 6 },
    growth: { hp: 12, atk: 3.6, def: 1.0, spd: 1.8, crit: 0.5, res: 0.2 },
    skills: [
      { name: 'Poing Sombre', power: 108, cdMax: 0 },
      { name: 'Combo Furieux', power: 195, cdMax: 3 },
      { name: 'Rage d\'Ombre', power: 0, cdMax: 4, buffAtk: 50, buffDur: 3 },
    ],
  },
  h_charlotte: {
    name: 'Charlotte', element: 'shadow', rarity: 'legendaire', class: 'mage',
    sprite: S.h_charlotte, passiveDesc: 'DoT +25% degats',
    base:   { hp: 350, atk: 46, def: 16, spd: 30, crit: 14, res: 10 },
    growth: { hp: 11, atk: 3.2, def: 1.0, spd: 1.4, crit: 0.5, res: 0.4 },
    skills: [
      { name: 'Ombre Rampante', power: 100, cdMax: 0 },
      { name: 'Malediction Noire', power: 175, cdMax: 3, debuffDef: 20, debuffDur: 2 },
      { name: 'Nuee Sombre', power: 145, cdMax: 2 },
    ],
  },
  h_lee_bora: {
    name: 'Lee Bora', element: 'shadow', rarity: 'legendaire', class: 'mage',
    sprite: S.h_lee_bora, passiveDesc: 'Debuff ennemi +15% efficacite',
    base:   { hp: 360, atk: 44, def: 18, spd: 28, crit: 14, res: 12 },
    growth: { hp: 12, atk: 3.2, def: 1.0, spd: 1.3, crit: 0.5, res: 0.5 },
    skills: [
      { name: 'Frappe Obscure', power: 100, cdMax: 0 },
      { name: 'Voile Maudit', power: 165, cdMax: 3, debuffDef: 25, debuffDur: 2 },
      { name: 'Explosion Sombre', power: 180, cdMax: 4 },
    ],
  },
  h_harper: {
    name: 'Harper', element: 'shadow', rarity: 'legendaire', class: 'tank',
    sprite: S.h_harper, passiveDesc: 'DEF +20%, aggro augmentee',
    base:   { hp: 580, atk: 28, def: 38, spd: 18, crit: 5, res: 18 },
    growth: { hp: 19, atk: 1.8, def: 2.2, spd: 0.8, crit: 0.2, res: 0.7 },
    skills: [
      { name: 'Frappe du Neant', power: 88, cdMax: 0 },
      { name: 'Mur d\'Ombre', power: 0, cdMax: 3, buffDef: 65, buffDur: 3 },
      { name: 'Absorption Sombre', power: 0, cdMax: 4, healSelf: 30 },
    ],
  },
  h_lim: {
    name: 'Lim Tae-Gyu', element: 'shadow', rarity: 'legendaire', class: 'fighter',
    sprite: S.h_lim, passiveDesc: 'ATK +15% contre ennemis debuffs',
    base:   { hp: 470, atk: 44, def: 26, spd: 26, crit: 12, res: 8 },
    growth: { hp: 15, atk: 3.0, def: 1.5, spd: 1.2, crit: 0.4, res: 0.3 },
    skills: [
      { name: 'Poing Briseur', power: 102, cdMax: 0 },
      { name: 'Impact Devastateur', power: 180, cdMax: 3 },
      { name: 'Force Sombre', power: 0, cdMax: 4, buffAtk: 45, buffDur: 3 },
    ],
  },
  h_kang: {
    name: 'Kang Taeshik', element: 'shadow', rarity: 'legendaire', class: 'assassin',
    sprite: S.h_kang, passiveDesc: 'CRIT +10% permanent',
    base:   { hp: 350, atk: 46, def: 16, spd: 36, crit: 18, res: 5 },
    growth: { hp: 11, atk: 3.4, def: 0.9, spd: 1.7, crit: 0.6, res: 0.2 },
    skills: [
      { name: 'Dague Empoisonnee', power: 105, cdMax: 0 },
      { name: 'Coup Traitre', power: 190, cdMax: 3 },
      { name: 'Furtivite', power: 0, cdMax: 3, buffAtk: 30, buffDur: 2 },
    ],
  },
  h_son: {
    name: 'Son Kihoon', element: 'shadow', rarity: 'legendaire', class: 'tank',
    sprite: S.h_son, passiveDesc: 'RES +15% permanent',
    base:   { hp: 560, atk: 26, def: 36, spd: 18, crit: 5, res: 20 },
    growth: { hp: 18, atk: 1.8, def: 2.0, spd: 0.8, crit: 0.2, res: 0.8 },
    skills: [
      { name: 'Coup de Masse', power: 90, cdMax: 0 },
      { name: 'Bastion', power: 0, cdMax: 3, buffDef: 60, buffDur: 3 },
      { name: 'Endurance Sombre', power: 0, cdMax: 4, healSelf: 28 },
    ],
  },
  h_isla: {
    name: 'Isla Wright', element: 'shadow', rarity: 'rare', class: 'support',
    sprite: S.h_isla, passiveDesc: 'Soin +10% efficacite',
    base:   { hp: 400, atk: 24, def: 22, spd: 26, crit: 6, res: 14 },
    growth: { hp: 13, atk: 1.6, def: 1.3, spd: 1.1, crit: 0.2, res: 0.5 },
    skills: [
      { name: 'Toucher Obscur', power: 82, cdMax: 0 },
      { name: 'Soin des Ombres', power: 0, cdMax: 4, healSelf: 22 },
      { name: 'Voile Protecteur', power: 0, cdMax: 3, buffDef: 30, buffDur: 3 },
    ],
  },
  h_hwang: {
    name: 'Hwang Dongsuk', element: 'shadow', rarity: 'rare', class: 'tank',
    sprite: S.h_hwang, passiveDesc: 'DEF +10% permanent',
    base:   { hp: 520, atk: 24, def: 32, spd: 16, crit: 4, res: 14 },
    growth: { hp: 17, atk: 1.6, def: 1.8, spd: 0.7, crit: 0.1, res: 0.6 },
    skills: [
      { name: 'Coup de Bouclier', power: 85, cdMax: 0 },
      { name: 'Garde', power: 0, cdMax: 3, buffDef: 50, buffDur: 3 },
      { name: 'Soin Brut', power: 0, cdMax: 4, healSelf: 20 },
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

export const computeRaidRewards = (rc, isFullClear) => {
  const baseCoins = rc * 200;
  const fullClearBonus = isFullClear ? 500 : 0;
  const xpPerChibi = 150 + rc * 25;
  return { coins: baseCoins + fullClearBonus, xpPerChibi, isFullClear };
};

// ─── Persistence Keys ────────────────────────────────────────

export const RAID_SAVE_KEY = 'shadow_colosseum_raid';

export const defaultRaidData = () => ({
  hunterCollection: [],
  raidStats: { totalRC: 0, bestRC: 0, totalDamage: 0, raidsPlayed: 0 },
  weeklyBoss: {},
  lastTeam: [],
});

export const loadRaidData = () => {
  try {
    const raw = { ...defaultRaidData(), ...JSON.parse(localStorage.getItem(RAID_SAVE_KEY)) };
    // Migration: convert old string[] hunterCollection to {id, stars}[]
    if (raw.hunterCollection.length > 0 && typeof raw.hunterCollection[0] === 'string') {
      raw.hunterCollection = raw.hunterCollection.map(id => ({ id, stars: 0 }));
      localStorage.setItem(RAID_SAVE_KEY, JSON.stringify(raw));
    }
    return raw;
  } catch {
    return defaultRaidData();
  }
};

export const saveRaidData = (d) => localStorage.setItem(RAID_SAVE_KEY, JSON.stringify(d));

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
    if (collection[idx].stars < 5) collection[idx].stars++;
    return { collection, isDuplicate: true, newStars: collection[idx].stars };
  }
  collection.push({ id: hunterId, stars: 0 });
  return { collection, isDuplicate: false, newStars: 0 };
};
