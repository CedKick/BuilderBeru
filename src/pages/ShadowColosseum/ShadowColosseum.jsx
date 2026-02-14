// src/pages/ShadowColosseum/ShadowColosseum.jsx
// "Le Colisee des Ombres" — Chibi Battle RPG
// Fais combattre tes chibis captures, monte de niveaux, bats des boss !

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import shadowCoinManager from '../../components/ChibiSystem/ShadowCoinManager';
import { TALENT_TREES, computeTalentBonuses, getTreeMaxPoints, getNodeDesc } from './talentTreeData';

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════

const SPRITES = {
  kaisel: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
  tank: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png',
  nyarthulu: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755505833/Nyarthulu_face_vawrrz.png',
  raven: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422541/Raven_face_xse2x9.png',
  lil_kaisel: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422081/lil_face_vyjvxz.png',
  pingsu: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755505263/Pingsu_face_tnilyr.png',
  okami: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755422300/Okami_face_qfzt4j.png',
  alecto: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755423129/alecto_face_irsy6q.png',
};

const ELEMENTS = {
  shadow: { name: 'Ombre', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/40', icon: '\uD83C\uDF11', beats: 'wind' },
  fire: { name: 'Feu', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40', icon: '\uD83D\uDD25', beats: 'shadow' },
  wind: { name: 'Vent', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', icon: '\uD83D\uDCA8', beats: 'earth' },
  earth: { name: 'Terre', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', icon: '\uD83E\uDEA8', beats: 'fire' },
};

const RARITY = {
  mythique: { stars: '\u2605\u2605\u2605', color: 'text-red-400', glow: 'drop-shadow(0 0 6px rgba(255,0,0,0.5))' },
  legendaire: { stars: '\u2605\u2605', color: 'text-orange-400', glow: 'drop-shadow(0 0 6px rgba(255,140,0,0.5))' },
  rare: { stars: '\u2605', color: 'text-blue-400', glow: 'drop-shadow(0 0 5px rgba(59,130,246,0.4))' },
};

// ─── Stat Point System ───────────────────────────────────────

const STAT_PER_POINT = { hp: 8, atk: 1.5, def: 1.5, spd: 1, crit: 0.8, res: 0.8 };
const STAT_ORDER = ['hp', 'atk', 'def', 'spd', 'crit', 'res'];
const STAT_META = {
  hp:   { name: 'PV',   icon: '\u2764\uFE0F', color: 'text-green-400',   desc: 'Points de Vie' },
  atk:  { name: 'ATK',  icon: '\u2694\uFE0F', color: 'text-red-400',     desc: "Puissance d'attaque" },
  def:  { name: 'DEF',  icon: '\uD83D\uDEE1\uFE0F', color: 'text-blue-400', desc: 'Resistance physique' },
  spd:  { name: 'SPD',  icon: '\uD83D\uDCA8', color: 'text-emerald-400', desc: 'Vitesse' },
  crit: { name: 'CRIT', icon: '\uD83C\uDFAF', color: 'text-yellow-400', desc: 'Chance de coup critique' },
  res:  { name: 'RES',  icon: '\uD83D\uDEE1\uFE0F', color: 'text-cyan-400',    desc: 'Reduction des degats' },
};
const POINTS_PER_LEVEL = 2;

// ─── Skill Tree System ───────────────────────────────────────

const TIER_NAMES_SKILL = ['Eveil', 'Maitrise', 'Transcendance'];
const TIER_COSTS = [1, 1, 2]; // SP cost for each tier
const SP_INTERVAL = 5; // 1 SP every 5 levels (max 6 at lv30)

// ─── Chibi Battle Stats ─────────────────────────────────────

const CHIBIS = {
  kaisel: {
    name: 'Kaisel', rarity: 'mythique', element: 'wind',
    base: { hp: 160, atk: 42, def: 28, spd: 55, crit: 15, res: 5 },
    growth: { hp: 10, atk: 3, def: 1.8, spd: 3.2, crit: 0.3, res: 0.15 },
    skills: [
      { name: 'Griffes du Vent', power: 100, cdMax: 0, desc: 'Laceration aerienne' },
      { name: 'Plongeon Celeste', power: 180, cdMax: 2, desc: 'Attaque plongeante devastatrice' },
      { name: 'Tempete Draconique', power: 260, cdMax: 4, desc: 'Tempete de vent ultime' },
    ],
  },
  tank: {
    name: 'Tank', rarity: 'legendaire', element: 'earth',
    base: { hp: 250, atk: 25, def: 50, spd: 18, crit: 5, res: 15 },
    growth: { hp: 16, atk: 1.5, def: 3.5, spd: 0.8, crit: 0.1, res: 0.5 },
    skills: [
      { name: 'Coup de Bouclier', power: 90, cdMax: 0, desc: 'Frappe defensive' },
      { name: 'Forteresse', power: 0, cdMax: 3, desc: 'DEF +80% pendant 3 tours', buffDef: 80, buffDur: 3 },
      { name: 'Rempart Absolu', power: 0, cdMax: 4, desc: 'Recupere 40% PV max', healSelf: 40 },
    ],
  },
  nyarthulu: {
    name: 'Nyarthulu', rarity: 'legendaire', element: 'shadow',
    base: { hp: 200, atk: 38, def: 22, spd: 30, crit: 10, res: 6 },
    growth: { hp: 12, atk: 2.8, def: 1.5, spd: 1.8, crit: 0.25, res: 0.2 },
    skills: [
      { name: 'Tentacule', power: 100, cdMax: 0, desc: 'Frappe de tentacule' },
      { name: 'Maree Noire', power: 160, cdMax: 2, desc: 'Degats + DEF ennemi -30%', debuffDef: 30, debuffDur: 2 },
      { name: 'Abysse Eternel', power: 240, cdMax: 4, desc: 'Devastation abyssale' },
    ],
  },
  raven: {
    name: 'Shadow-Raven', rarity: 'rare', element: 'wind',
    base: { hp: 120, atk: 30, def: 18, spd: 45, crit: 12, res: 4 },
    growth: { hp: 8, atk: 2, def: 1.2, spd: 2.8, crit: 0.3, res: 0.1 },
    skills: [
      { name: "Bec d'Ombre", power: 95, cdMax: 0, desc: 'Coup de bec rapide' },
      { name: 'Vol Rasant', power: 155, cdMax: 2, desc: 'Attaque en rase-mottes' },
      { name: 'Tempete de Plumes', power: 210, cdMax: 3, desc: 'Pluie de plumes tranchantes' },
    ],
  },
  lil_kaisel: {
    name: "Lil' Kaisel", rarity: 'rare', element: 'wind',
    base: { hp: 110, atk: 25, def: 15, spd: 38, crit: 8, res: 5 },
    growth: { hp: 7, atk: 1.8, def: 1, spd: 2.5, crit: 0.2, res: 0.15 },
    skills: [
      { name: 'Mini Griffes', power: 90, cdMax: 0, desc: 'Petites griffes rapides' },
      { name: 'Petit Plongeon', power: 140, cdMax: 2, desc: 'Mini plongeon aerien' },
      { name: 'Cri Percant', power: 0, cdMax: 3, desc: 'ATK +60% pendant 3 tours', buffAtk: 60, buffDur: 3 },
    ],
  },
  pingsu: {
    name: 'Pingsu', rarity: 'rare', element: 'fire',
    base: { hp: 140, atk: 28, def: 20, spd: 22, crit: 7, res: 8 },
    growth: { hp: 9, atk: 2, def: 1.5, spd: 1.2, crit: 0.15, res: 0.25 },
    skills: [
      { name: 'Marteau Enflamme', power: 95, cdMax: 0, desc: "Frappe de forge ardente" },
      { name: 'Forge Ardente', power: 0, cdMax: 3, desc: 'ATK +50% pendant 3 tours', buffAtk: 50, buffDur: 3 },
      { name: 'Eruption', power: 220, cdMax: 4, desc: 'Explosion de lave' },
    ],
  },
  okami: {
    name: 'Okami', rarity: 'mythique', element: 'shadow',
    base: { hp: 140, atk: 50, def: 20, spd: 52, crit: 18, res: 3 },
    growth: { hp: 8, atk: 3.5, def: 1.2, spd: 3, crit: 0.4, res: 0.1 },
    skills: [
      { name: "Crocs d'Ombre", power: 110, cdMax: 0, desc: 'Morsure des tenebres' },
      { name: 'Charge Lupine', power: 190, cdMax: 2, desc: 'Charge sauvage' },
      { name: 'Hurlement du Monarque', power: 280, cdMax: 5, desc: 'Hurlement devastateur' },
    ],
  },
  alecto: {
    name: 'Alecto', rarity: 'mythique', element: 'fire',
    base: { hp: 180, atk: 44, def: 25, spd: 40, crit: 14, res: 7 },
    growth: { hp: 11, atk: 3, def: 1.8, spd: 2.5, crit: 0.3, res: 0.2 },
    skills: [
      { name: "Flamme d'Ombre", power: 100, cdMax: 0, desc: 'Feu des tenebres' },
      { name: 'Metamorphose', power: 0, cdMax: 3, desc: 'ATK +40% pendant 3 tours', buffAtk: 40, buffDur: 3 },
      { name: 'Phoenix Noir', power: 250, cdMax: 4, desc: 'Explosion phenix + soin 20%', healSelf: 20 },
    ],
  },
};

// ─── Stages ──────────────────────────────────────────────────

const STAGES = [
  // Tier 1 — Donjon des Ombres
  { id: 'goblin', name: 'Gobelin des Ombres', tier: 1, element: 'shadow', emoji: '\uD83D\uDC79',
    hp: 120, atk: 18, def: 12, spd: 15, crit: 5, res: 0, xp: 25, coins: 40,
    skills: [{ name: 'Griffure', power: 100, cdMax: 0 }, { name: 'Rage', power: 0, cdMax: 3, buffAtk: 40, buffDur: 3 }] },
  { id: 'wolf', name: 'Loup Corrompu', tier: 1, element: 'shadow', emoji: '\uD83D\uDC3A',
    hp: 100, atk: 22, def: 8, spd: 25, crit: 10, res: 0, xp: 30, coins: 50,
    skills: [{ name: 'Morsure', power: 110, cdMax: 0 }, { name: 'Morsure Sauvage', power: 170, cdMax: 3 }] },
  { id: 'golem', name: 'Golem de Pierre', tier: 1, element: 'earth', emoji: '\uD83E\uDEA8',
    hp: 200, atk: 15, def: 30, spd: 8, crit: 3, res: 12, xp: 35, coins: 55,
    skills: [{ name: 'Ecrasement', power: 95, cdMax: 0 }, { name: 'Seisme', power: 155, cdMax: 3 }] },
  { id: 'knight', name: 'Chevalier Dechu', tier: 1, element: 'shadow', emoji: '\u2694\uFE0F', isBoss: true,
    hp: 320, atk: 28, def: 22, spd: 22, crit: 8, res: 5, xp: 60, coins: 100,
    skills: [{ name: 'Epee Maudite', power: 100, cdMax: 0 }, { name: 'Charge Sombre', power: 170, cdMax: 2 }, { name: 'Frappe Fatale', power: 240, cdMax: 4 }] },
  // Tier 2 — Ruines Ancestrales
  { id: 'spectre', name: 'Spectre Ancestral', tier: 2, element: 'shadow', emoji: '\uD83D\uDC7B',
    hp: 200, atk: 32, def: 15, spd: 30, crit: 12, res: 8, xp: 45, coins: 70,
    skills: [{ name: 'Drain', power: 100, cdMax: 0, healSelf: 15 }, { name: 'Malediction', power: 0, cdMax: 3, debuffDef: 35, debuffDur: 2 }] },
  { id: 'salamandre', name: 'Salamandre', tier: 2, element: 'fire', emoji: '\uD83E\uDD8E',
    hp: 250, atk: 35, def: 20, spd: 22, crit: 8, res: 5, xp: 50, coins: 80,
    skills: [{ name: 'Crache-Feu', power: 105, cdMax: 0 }, { name: 'Inferno', power: 185, cdMax: 3 }] },
  { id: 'griffon', name: 'Griffon', tier: 2, element: 'wind', emoji: '\uD83E\uDD85',
    hp: 220, atk: 30, def: 18, spd: 35, crit: 15, res: 3, xp: 55, coins: 85,
    skills: [{ name: 'Serres', power: 100, cdMax: 0 }, { name: 'Tempete', power: 175, cdMax: 2 }] },
  { id: 'guardian', name: 'Gardien du Portail', tier: 2, element: 'earth', emoji: '\uD83D\uDDFF', isBoss: true,
    hp: 550, atk: 38, def: 35, spd: 16, crit: 5, res: 15, xp: 100, coins: 180,
    skills: [{ name: 'Poing de Pierre', power: 100, cdMax: 0 }, { name: 'Mur de Roche', power: 0, cdMax: 3, buffDef: 80, buffDur: 3 }, { name: 'Avalanche', power: 200, cdMax: 4 }] },
  // Tier 3 — Les Abysses
  { id: 'chimera', name: 'Chimere des Abysses', tier: 3, element: 'fire', emoji: '\uD83D\uDC09',
    hp: 380, atk: 45, def: 28, spd: 30, crit: 12, res: 10, xp: 80, coins: 120,
    skills: [{ name: 'Souffle', power: 110, cdMax: 0 }, { name: 'Triple Frappe', power: 200, cdMax: 3 }] },
  { id: 'phoenix', name: 'Phenix Noir', tier: 3, element: 'fire', emoji: '\uD83D\uDD3B',
    hp: 320, atk: 50, def: 22, spd: 38, crit: 15, res: 8, xp: 90, coins: 140,
    skills: [{ name: 'Flamme Noire', power: 110, cdMax: 0 }, { name: 'Renaissance', power: 0, cdMax: 4, healSelf: 35 }, { name: 'Explosion Solaire', power: 250, cdMax: 4 }] },
  { id: 'titan', name: 'Titan de Glace', tier: 3, element: 'earth', emoji: '\u2744\uFE0F',
    hp: 650, atk: 38, def: 48, spd: 12, crit: 5, res: 20, xp: 100, coins: 160,
    skills: [{ name: 'Ecrasement Glacial', power: 100, cdMax: 0 }, { name: 'Cuirasse', power: 0, cdMax: 3, buffDef: 100, buffDur: 3 }, { name: 'Avalanche', power: 220, cdMax: 5 }] },
  { id: 'monarch', name: 'Monarque Mineure', tier: 3, element: 'shadow', emoji: '\uD83D\uDC51', isBoss: true,
    hp: 900, atk: 55, def: 38, spd: 32, crit: 18, res: 12, xp: 180, coins: 300,
    skills: [{ name: 'Ombre Royale', power: 110, cdMax: 0 }, { name: 'Domination', power: 0, cdMax: 3, buffAtk: 60, buffDur: 3 }, { name: 'Jugement Final', power: 280, cdMax: 5 }] },
  // Tier 4 — Citadelle Maudite
  { id: 'wraith', name: 'Wraith', tier: 4, element: 'shadow', emoji: '\uD83D\uDC7B',
    hp: 600, atk: 65, def: 30, spd: 40, crit: 18, res: 12, xp: 130, coins: 220,
    skills: [{ name: 'Drain Vital', power: 100, cdMax: 0, healSelf: 15 }, { name: 'Hurlement Spectral', power: 200, cdMax: 3, debuffDef: 30, debuffDur: 2 }] },
  { id: 'ifrit', name: 'Ifrit', tier: 4, element: 'fire', emoji: '\uD83D\uDD25',
    hp: 550, atk: 75, def: 25, spd: 35, crit: 20, res: 8, xp: 140, coins: 240,
    skills: [{ name: 'Flamme Infernale', power: 115, cdMax: 0 }, { name: 'Nova de Feu', power: 230, cdMax: 3 }] },
  { id: 'wyvern', name: 'Wyverne', tier: 4, element: 'wind', emoji: '\uD83D\uDC32',
    hp: 500, atk: 60, def: 28, spd: 50, crit: 22, res: 6, xp: 150, coins: 250,
    skills: [{ name: 'Souffle Tempete', power: 105, cdMax: 0 }, { name: 'Tornade', power: 210, cdMax: 2 }] },
  { id: 'lich_king', name: 'Roi Liche', tier: 4, element: 'earth', emoji: '\uD83D\uDC80', isBoss: true,
    hp: 1400, atk: 70, def: 50, spd: 25, crit: 12, res: 20, xp: 250, coins: 450,
    skills: [{ name: 'Frappe Glaciale', power: 100, cdMax: 0 }, { name: 'Armure d\'Os', power: 0, cdMax: 3, buffDef: 90, buffDur: 3 }, { name: 'Apocalypse Noire', power: 280, cdMax: 5 }] },
  // Tier 5 — Throne des Anciens
  { id: 'banshee', name: 'Banshee', tier: 5, element: 'shadow', emoji: '\uD83D\uDE31',
    hp: 700, atk: 85, def: 32, spd: 45, crit: 22, res: 15, xp: 200, coins: 350,
    skills: [{ name: 'Cri Mortel', power: 110, cdMax: 0 }, { name: 'Lamentation', power: 240, cdMax: 3, debuffDef: 40, debuffDur: 2 }] },
  { id: 'dragon_rouge', name: 'Dragon Rouge', tier: 5, element: 'fire', emoji: '\uD83D\uDC09',
    hp: 900, atk: 95, def: 40, spd: 32, crit: 18, res: 12, xp: 220, coins: 380,
    skills: [{ name: 'Crache-Flamme', power: 115, cdMax: 0 }, { name: 'Souffle de Dragon', power: 260, cdMax: 3 }, { name: 'Inferno Total', power: 320, cdMax: 5 }] },
  { id: 'tempestaire', name: 'Tempestaire', tier: 5, element: 'wind', emoji: '\uD83C\uDF2A\uFE0F',
    hp: 650, atk: 80, def: 30, spd: 55, crit: 25, res: 10, xp: 210, coins: 360,
    skills: [{ name: 'Lame de Vent', power: 105, cdMax: 0 }, { name: 'Cyclone', power: 250, cdMax: 3 }] },
  { id: 'colossus', name: 'Colossus', tier: 5, element: 'earth', emoji: '\uD83D\uDDFF', isBoss: true,
    hp: 2200, atk: 85, def: 65, spd: 18, crit: 8, res: 25, xp: 380, coins: 650,
    skills: [{ name: 'Poing Titanesque', power: 110, cdMax: 0 }, { name: 'Bouclier Ancestral', power: 0, cdMax: 3, buffDef: 100, buffDur: 3 }, { name: 'Seisme Supreme', power: 300, cdMax: 5 }] },
  // Tier 6 — Domaine du Monarque
  { id: 'archdemon', name: 'Archdemon', tier: 6, element: 'shadow', emoji: '\uD83D\uDE08',
    hp: 1100, atk: 110, def: 45, spd: 42, crit: 25, res: 18, xp: 300, coins: 500,
    skills: [{ name: 'Griffe Demoniaque', power: 115, cdMax: 0 }, { name: 'Pluie de Tenebres', power: 280, cdMax: 3 }] },
  { id: 'ragnarok', name: 'Ragnarok', tier: 6, element: 'fire', emoji: '\u2604\uFE0F',
    hp: 1000, atk: 120, def: 38, spd: 38, crit: 22, res: 12, xp: 320, coins: 550,
    skills: [{ name: 'Extinction', power: 120, cdMax: 0 }, { name: 'Jugement de Feu', power: 300, cdMax: 3 }, { name: 'Apocalypse', power: 380, cdMax: 5 }] },
  { id: 'zephyr', name: 'Zephyr Ultime', tier: 6, element: 'wind', emoji: '\uD83C\uDF2C\uFE0F',
    hp: 850, atk: 100, def: 35, spd: 60, crit: 30, res: 10, xp: 310, coins: 520,
    skills: [{ name: 'Tranchant Celeste', power: 110, cdMax: 0 }, { name: 'Tornade Divine', power: 290, cdMax: 3 }] },
  { id: 'supreme_monarch', name: 'Monarque Supreme', tier: 6, element: 'shadow', emoji: '\uD83D\uDC51', isBoss: true,
    hp: 3500, atk: 115, def: 70, spd: 35, crit: 20, res: 22, xp: 600, coins: 1000,
    skills: [{ name: 'Jugement Royal', power: 120, cdMax: 0 }, { name: 'Domination Absolue', power: 0, cdMax: 3, buffAtk: 80, buffDur: 3 }, { name: 'Aneantissement', power: 400, cdMax: 5 }] },
];

const TIER_NAMES = { 1: 'Donjon des Ombres', 2: 'Ruines Ancestrales', 3: 'Les Abysses', 4: 'Citadelle Maudite', 5: 'Throne des Anciens', 6: 'Domaine du Monarque' };
const TIER_COOLDOWN_MIN = { 1: 15, 2: 30, 3: 60, 4: 60, 5: 90, 6: 120 };

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const MAX_LEVEL = 60;

const statsAt = (base, growth, level, allocated = {}, tb = {}) => {
  const raw = {
    hp: base.hp + growth.hp * (level - 1) + (allocated.hp || 0) * STAT_PER_POINT.hp,
    atk: base.atk + growth.atk * (level - 1) + (allocated.atk || 0) * STAT_PER_POINT.atk,
    def: base.def + growth.def * (level - 1) + (allocated.def || 0) * STAT_PER_POINT.def,
    spd: base.spd + growth.spd * (level - 1) + (allocated.spd || 0) * STAT_PER_POINT.spd,
    crit: base.crit + growth.crit * (level - 1) + (allocated.crit || 0) * STAT_PER_POINT.crit,
    res: base.res + growth.res * (level - 1) + (allocated.res || 0) * STAT_PER_POINT.res,
  };
  return {
    hp: Math.floor(raw.hp * (1 + (tb.hpPercent || 0) / 100)),
    atk: Math.floor(raw.atk * (1 + (tb.atkPercent || 0) / 100)),
    def: Math.floor(raw.def * (1 + (tb.defPercent || 0) / 100)),
    spd: Math.floor(raw.spd * (1 + (tb.spdPercent || 0) / 100)),
    crit: +(raw.crit + (tb.critRate || 0)).toFixed(1),
    res: +(raw.res + (tb.resFlat || 0)).toFixed(1),
  };
};

const xpForLevel = (level) => level <= 30 ? level * 20 : 600 + (level - 30) * 35;

const getElementMult = (atkElem, defElem) => {
  if (ELEMENTS[atkElem]?.beats === defElem) return 1.3;
  if (ELEMENTS[defElem]?.beats === atkElem) return 0.7;
  return 1.0;
};

const getEffStat = (base, buffs, stat) => {
  const mult = buffs.filter(b => b.stat === stat).reduce((s, b) => s + b.value, 0);
  return Math.max(1, Math.floor(base * (1 + mult)));
};

const applySkillUpgrades = (skill, upgradeLevel) => {
  const s = { ...skill };
  if (upgradeLevel >= 1) {
    // Eveil: +30% power / +25% effects
    if (s.power > 0) s.power = Math.floor(s.power * 1.3);
    if (s.buffAtk) s.buffAtk = Math.floor(s.buffAtk * 1.25);
    if (s.buffDef) s.buffDef = Math.floor(s.buffDef * 1.25);
    if (s.healSelf) s.healSelf = Math.floor(s.healSelf * 1.25);
    if (s.debuffDef) s.debuffDef = Math.floor(s.debuffDef * 1.2);
  }
  if (upgradeLevel >= 2) {
    // Maitrise: cooldown -1
    s.cdMax = Math.max(0, s.cdMax - 1);
  }
  if (upgradeLevel >= 3) {
    // Transcendance: +25% power / +30% effects
    if (s.power > 0) s.power = Math.floor(s.power * 1.25);
    if (s.buffAtk) s.buffAtk = Math.floor(s.buffAtk * 1.3);
    if (s.buffDef) s.buffDef = Math.floor(s.buffDef * 1.3);
    if (s.healSelf) s.healSelf = Math.floor(s.healSelf * 1.3);
    if (s.debuffDef) s.debuffDef = Math.floor(s.debuffDef * 1.3);
  }
  return s;
};

const getUpgradeDesc = (skill, tierIdx) => {
  if (tierIdx === 1) return 'Cooldown -1';
  if (skill.power > 0) return tierIdx === 0 ? 'DMG +30%' : 'DMG +25%';
  if (skill.healSelf) return tierIdx === 0 ? 'Soin +25%' : 'Soin +30%';
  if (skill.buffAtk || skill.buffDef) return tierIdx === 0 ? 'Buff +25%' : 'Buff +30%';
  if (skill.debuffDef) return tierIdx === 0 ? 'Debuff +20%' : 'Debuff +30%';
  return tierIdx === 0 ? 'Effet +25%' : 'Effet +30%';
};

const computeAttack = (attacker, skill, defender, tb = {}) => {
  const res = { damage: 0, isCrit: false, healed: 0, buff: null, debuff: null, text: '' };
  let effAtk = getEffStat(attacker.atk, attacker.buffs, 'atk');
  const effDef = getEffStat(defender.def, defender.buffs, 'def');

  // Berserk: ATK +40% when HP < 30%
  if (tb.hasBerserk && attacker.hp < attacker.maxHp * 0.3) {
    effAtk = Math.floor(effAtk * 1.4);
  }

  if (skill.power > 0) {
    const raw = effAtk * (skill.power / 100);
    let elemMult = getElementMult(attacker.element, defender.element);
    // Transcendance: elemental advantage 1.3x → 1.6x
    if (tb.hasTranscendance && elemMult > 1) elemMult = 1.6;
    // Elemental advantage bonus (stacks)
    if (elemMult > 1 && tb.elementalAdvantageBonus) elemMult += tb.elementalAdvantageBonus / 100;
    const defFactor = 100 / (100 + Math.max(0, effDef));
    // Crit
    const critChance = Math.min(80, attacker.crit || 0);
    res.isCrit = Math.random() * 100 < critChance;
    const critMult = res.isCrit ? 1.5 + (tb.critDamage || 0) / 100 : 1;
    // RES
    const resFactor = Math.max(0.3, 1 - Math.min(70, defender.res || 0) / 100);
    // Damage type multipliers
    const physMult = 1 + (tb.physicalDamage || 0) / 100;
    const elemDmgMult = 1 + (tb.elementalDamage || 0) / 100;
    // Boss damage
    const bossMult = defender.isBoss ? 1 + (tb.bossDamage || 0) / 100 : 1;
    const variance = 0.9 + Math.random() * 0.2;
    res.damage = Math.max(1, Math.floor(raw * elemMult * defFactor * resFactor * critMult * physMult * elemDmgMult * bossMult * variance));
  }
  if (skill.healSelf) res.healed = Math.floor(attacker.maxHp * skill.healSelf / 100);
  if (skill.buffAtk) res.buff = { stat: 'atk', value: skill.buffAtk / 100, turns: skill.buffDur || 3 };
  if (skill.buffDef) res.buff = { stat: 'def', value: skill.buffDef / 100, turns: skill.buffDur || 3 };
  if (skill.debuffDef) res.debuff = { stat: 'def', value: -(skill.debuffDef / 100), turns: skill.debuffDur || 2 };

  const parts = [];
  if (res.isCrit) parts.push('CRITIQUE !');
  parts.push(`${attacker.name} utilise ${skill.name} !`);
  if (res.damage > 0) parts.push(`-${res.damage} PV`);
  if (res.healed > 0) parts.push(`+${res.healed} soins`);
  if (res.buff) parts.push(`${res.buff.stat.toUpperCase()} +${Math.round(res.buff.value * 100)}%`);
  if (res.debuff) parts.push(`DEF ennemi ${Math.round(res.debuff.value * 100)}%`);
  res.text = parts.join(' ');
  return res;
};

const aiPickSkill = (entity) => {
  const avail = entity.skills.filter(s => s.cd === 0);
  if (entity.hp < entity.maxHp * 0.35) {
    const heal = avail.find(s => s.healSelf);
    if (heal) return heal;
  }
  if (entity.buffs.length === 0) {
    const buff = avail.find(s => s.buffAtk || s.buffDef);
    if (buff && Math.random() < 0.5) return buff;
  }
  const attacks = avail.filter(s => s.power > 0).sort((a, b) => b.power - a.power);
  if (attacks.length > 0 && Math.random() < 0.7) return attacks[0];
  return avail[Math.floor(Math.random() * avail.length)] || entity.skills[0];
};

// ═══════════════════════════════════════════════════════════════
// PERSISTENCE
// ═══════════════════════════════════════════════════════════════

const SAVE_KEY = 'shadow_colosseum_data';
const defaultData = () => ({ chibiLevels: {}, statPoints: {}, skillTree: {}, talentTree: {}, respecCount: {}, cooldowns: {}, stagesCleared: [], stats: { battles: 0, wins: 0 } });
const loadData = () => { try { return { ...defaultData(), ...JSON.parse(localStorage.getItem(SAVE_KEY)) }; } catch { return defaultData(); } };
const saveData = (d) => localStorage.setItem(SAVE_KEY, JSON.stringify(d));

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ShadowColosseum() {
  const [view, setView] = useState('hub'); // hub, stats, skilltree, talents, battle, result
  const [data, setData] = useState(loadData);
  const [selChibi, setSelChibi] = useState(null);
  const [selStage, setSelStage] = useState(null);
  const [battle, setBattle] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [dmgPopup, setDmgPopup] = useState(null);
  const [result, setResult] = useState(null);
  const [manageTarget, setManageTarget] = useState(null); // chibi ID for stats/skilltree views
  const [activeTree, setActiveTree] = useState('fury'); // talent tree tab
  const [chibiRage, setChibiRage] = useState(null); // { id, level, text, anim }
  const clickCountRef = useRef({});
  const clickTimerRef = useRef({});
  const phaseRef = useRef('idle');

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => {
    document.title = 'Shadow Colosseum - Chibi Battle RPG | BuilderBeru';
    let meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content = 'Shadow Colosseum - Chibi Battle RPG pour Solo Leveling Arise. Fais combattre tes chibis, monte de niveaux, debloque des competences et bats des boss !';
    }
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { message: "Le Colisee des Ombres ! Que le combat commence !", mood: 'excited' },
    }));
  }, []);

  // Collection from mascot system
  const collection = (() => { try { return JSON.parse(localStorage.getItem('beru_chibi_collection') || '{}'); } catch { return {}; } })();
  const ownedIds = Object.keys(collection).filter(k => collection[k] > 0 && CHIBIS[k]);

  const getChibiLevel = (id) => data.chibiLevels[id] || { level: 1, xp: 0 };
  const isCooldown = (id) => data.cooldowns[id] && Date.now() < data.cooldowns[id];
  const cooldownMin = (id) => {
    if (!isCooldown(id)) return 0;
    return Math.ceil((data.cooldowns[id] - Date.now()) / 60000);
  };
  const isStageUnlocked = (idx) => idx === 0 || data.stagesCleared.includes(STAGES[idx - 1].id);

  // ─── Stat Points Logic ─────────────────────────────────────

  const getTotalStatPts = (level) => (level - 1) * POINTS_PER_LEVEL;
  const getSpentStatPts = (id) => {
    const alloc = data.statPoints[id] || {};
    return Object.values(alloc).reduce((s, v) => s + v, 0);
  };
  const getAvailStatPts = (id) => getTotalStatPts(getChibiLevel(id).level) - getSpentStatPts(id);

  const allocateStat = (id, stat, delta) => {
    setData(prev => {
      const alloc = { ...(prev.statPoints[id] || { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 }) };
      const newVal = (alloc[stat] || 0) + delta;
      if (newVal < 0) return prev;
      if (delta > 0) {
        const total = getTotalStatPts(getChibiLevel(id).level);
        const spent = Object.values(alloc).reduce((s, v) => s + v, 0);
        if (spent >= total) return prev;
      }
      alloc[stat] = newVal;
      return { ...prev, statPoints: { ...prev.statPoints, [id]: alloc } };
    });
  };

  const resetStats = (id) => {
    setData(prev => ({
      ...prev,
      statPoints: { ...prev.statPoints, [id]: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 } },
    }));
  };

  // ─── Skill Tree Logic ──────────────────────────────────────

  const getTotalSP = (level) => Math.floor(level / SP_INTERVAL);
  const getSpentSP = (id) => {
    const tree = data.skillTree[id] || {};
    let total = 0;
    for (const idx in tree) {
      for (let i = 0; i < tree[idx]; i++) total += TIER_COSTS[i];
    }
    return total;
  };
  const getAvailSP = (id) => getTotalSP(getChibiLevel(id).level) - getSpentSP(id);

  const upgradeSkill = (id, skillIdx) => {
    setData(prev => {
      const tree = { ...(prev.skillTree[id] || { 0: 0, 1: 0, 2: 0 }) };
      const cur = tree[skillIdx] || 0;
      if (cur >= 3) return prev;
      const cost = TIER_COSTS[cur];
      if (getAvailSP(id) < cost) return prev;
      tree[skillIdx] = cur + 1;
      return { ...prev, skillTree: { ...prev.skillTree, [id]: tree } };
    });
  };

  const resetSkillTree = (id) => {
    setData(prev => ({
      ...prev,
      skillTree: { ...prev.skillTree, [id]: { 0: 0, 1: 0, 2: 0 } },
    }));
  };

  // ─── Talent Tree Logic ─────────────────────────────────────

  const getTotalTalentPts = (level) => Math.max(0, level - 9);
  const getSpentTalentPts = (id) => {
    const alloc = data.talentTree[id] || {};
    let total = 0;
    for (const treeId of Object.keys(TALENT_TREES)) {
      const tree = alloc[treeId] || {};
      total += Object.values(tree).reduce((s, v) => s + v, 0);
    }
    return total;
  };
  const getAvailTalentPts = (id) => getTotalTalentPts(getChibiLevel(id).level) - getSpentTalentPts(id);
  const getTreePoints = (id, treeId) => {
    const tree = (data.talentTree[id] || {})[treeId] || {};
    return Object.values(tree).reduce((s, v) => s + v, 0);
  };

  const getChibiTalentBonuses = (id) => computeTalentBonuses(data.talentTree[id]);

  const canRankUpNode = (id, treeId, nodeId) => {
    if (getAvailTalentPts(id) <= 0) return false;
    const tree = TALENT_TREES[treeId];
    if (!tree) return false;
    const treePts = getTreePoints(id, treeId);
    const alloc = (data.talentTree[id] || {})[treeId] || {};
    for (const row of tree.rows) {
      const node = row.nodes.find(n => n.id === nodeId);
      if (node) {
        if (treePts < row.requiredPoints) return false;
        return (alloc[nodeId] || 0) < node.maxRank;
      }
    }
    return false;
  };

  const allocateTalentPoint = (id, treeId, nodeId) => {
    if (!canRankUpNode(id, treeId, nodeId)) return;
    setData(prev => {
      const chibiAlloc = { ...(prev.talentTree[id] || {}) };
      const treeAlloc = { ...(chibiAlloc[treeId] || {}) };
      treeAlloc[nodeId] = (treeAlloc[nodeId] || 0) + 1;
      chibiAlloc[treeId] = treeAlloc;
      return { ...prev, talentTree: { ...prev.talentTree, [id]: chibiAlloc } };
    });
  };

  const resetTalents = (id) => {
    const respecN = data.respecCount[id] || 0;
    const cost = respecN === 0 ? 0 : 100 * Math.pow(2, respecN - 1);
    const coins = shadowCoinManager.getBalance();
    if (cost > 0 && coins < cost) return false;
    if (cost > 0) shadowCoinManager.spendCoins(cost);
    setData(prev => ({
      ...prev,
      talentTree: { ...prev.talentTree, [id]: {} },
      respecCount: { ...prev.respecCount, [id]: respecN + 1 },
    }));
    return true;
  };
  const getRespecCost = (id) => {
    const n = data.respecCount[id] || 0;
    return n === 0 ? 0 : 100 * Math.pow(2, n - 1);
  };

  // ─── Start Battle ──────────────────────────────────────────

  const startBattle = () => {
    if (!selChibi || selStage === null || isCooldown(selChibi)) return;
    const chibi = CHIBIS[selChibi];
    const stage = STAGES[selStage];
    const { level } = getChibiLevel(selChibi);
    const alloc = data.statPoints[selChibi] || {};
    const tb = getChibiTalentBonuses(selChibi);
    const s = statsAt(chibi.base, chibi.growth, level, alloc, tb);
    const tree = data.skillTree[selChibi] || {};

    // Apply cooldown reduction from talents
    const cdReduction = Math.floor(tb.cooldownReduction || 0);

    setBattle({
      player: {
        id: selChibi, name: chibi.name, level, element: chibi.element,
        hp: s.hp, maxHp: s.hp, atk: s.atk, def: s.def, spd: s.spd,
        crit: Math.min(80, s.crit), res: Math.min(70, s.res),
        skills: chibi.skills.map((sk, i) => {
          const upgraded = applySkillUpgrades(sk, tree[i] || 0);
          return { ...upgraded, cdMax: Math.max(0, upgraded.cdMax - cdReduction), cd: 0 };
        }),
        buffs: [],
      },
      enemy: {
        id: stage.id, name: stage.name, element: stage.element, isBoss: !!stage.isBoss,
        hp: stage.hp, maxHp: stage.hp, atk: stage.atk, def: stage.def, spd: stage.spd,
        crit: stage.crit, res: stage.res,
        skills: stage.skills.map(sk => ({ ...sk, cd: 0 })),
        buffs: [],
      },
      talentBonuses: tb,
      immortelUsed: false,
      turn: 1, log: [],
    });
    setPhase('idle');
    setDmgPopup(null);
    setResult(null);
    setView('battle');
  };

  // ─── Execute Round ─────────────────────────────────────────

  const executeRound = useCallback((skillIdx) => {
    if (phaseRef.current !== 'idle' || !battle) return;
    const player = JSON.parse(JSON.stringify(battle.player));
    const enemy = JSON.parse(JSON.stringify(battle.enemy));
    const tb = battle.talentBonuses || {};
    let immortelUsed = battle.immortelUsed || false;
    const log = [...battle.log];
    const playerSkill = player.skills[skillIdx];

    setPhase('player_atk');
    const pRes = computeAttack(player, playerSkill, enemy, tb);

    enemy.hp = Math.max(0, enemy.hp - pRes.damage);
    if (pRes.healed) player.hp = Math.min(player.maxHp, player.hp + pRes.healed);
    if (pRes.buff) player.buffs.push({ ...pRes.buff });
    if (pRes.debuff) enemy.buffs.push({ ...pRes.debuff });
    playerSkill.cd = playerSkill.cdMax;
    log.push({ text: pRes.text, type: 'player', id: Date.now() });

    // Regen per turn (after player action)
    if (tb.regenPerTurn > 0) {
      const regen = Math.floor(player.maxHp * tb.regenPerTurn / 100);
      if (regen > 0 && player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + regen);
        log.push({ text: `${player.name} regenere +${regen} PV`, type: 'info', id: Date.now() + 0.1 });
      }
    }

    setDmgPopup(pRes.damage > 0 ? { target: 'enemy', value: pRes.damage, isCrit: pRes.isCrit } : null);
    setBattle(prev => ({ ...prev, player: { ...player }, enemy: { ...enemy }, log: log.slice(-10) }));

    if (enemy.hp <= 0) {
      setTimeout(() => handleVictory(), 1200);
      return;
    }

    setTimeout(() => {
      setPhase('enemy_atk');
      const eSkill = aiPickSkill(enemy);
      const eRes = computeAttack(enemy, eSkill, player);

      player.hp = Math.max(0, player.hp - eRes.damage);

      // Immortel: survive one fatal blow with 1 HP
      if (player.hp <= 0 && tb.hasImmortel && !immortelUsed) {
        player.hp = 1;
        immortelUsed = true;
        log.push({ text: `${player.name} survit au coup fatal ! (Immortel)`, type: 'info', id: Date.now() + 0.2 });
      }

      if (eRes.healed) enemy.hp = Math.min(enemy.maxHp, enemy.hp + eRes.healed);
      if (eRes.buff) enemy.buffs.push({ ...eRes.buff });
      if (eRes.debuff) player.buffs.push({ ...eRes.debuff });
      eSkill.cd = eSkill.cdMax;
      log.push({ text: eRes.text, type: 'enemy', id: Date.now() + 1 });

      // Riposte: chance to counter-attack after enemy hit
      if (tb.counterChance > 0 && eRes.damage > 0 && player.hp > 0) {
        if (Math.random() * 100 < tb.counterChance) {
          const riposteDmg = Math.max(1, Math.floor(getEffStat(player.atk, player.buffs, 'atk') * 0.5));
          enemy.hp = Math.max(0, enemy.hp - riposteDmg);
          log.push({ text: `${player.name} contre-attaque ! -${riposteDmg} PV`, type: 'player', id: Date.now() + 1.1 });
        }
      }

      player.skills.forEach(s => { if (s.cd > 0) s.cd--; });
      enemy.skills.forEach(s => { if (s.cd > 0) s.cd--; });
      player.buffs = player.buffs.map(b => ({ ...b, turns: b.turns - 1 })).filter(b => b.turns > 0);
      enemy.buffs = enemy.buffs.map(b => ({ ...b, turns: b.turns - 1 })).filter(b => b.turns > 0);

      setDmgPopup(eRes.damage > 0 ? { target: 'player', value: eRes.damage, isCrit: eRes.isCrit } : null);
      setBattle(prev => ({ ...prev, player: { ...player }, enemy: { ...enemy }, immortelUsed, turn: prev.turn + 1, log: log.slice(-10) }));

      if (enemy.hp <= 0) {
        setTimeout(() => handleVictory(), 1200);
        return;
      }
      if (player.hp <= 0) {
        setTimeout(() => handleDefeat(), 1200);
        return;
      }
      setTimeout(() => { setPhase('idle'); setDmgPopup(null); }, 800);
    }, 1200);
  }, [battle]);

  // ─── Victory ───────────────────────────────────────────────

  const handleVictory = useCallback(() => {
    setPhase('done');
    const stage = STAGES[selStage];
    const { level, xp } = getChibiLevel(selChibi);
    let newXp = xp + stage.xp;
    let newLevel = level;
    let leveled = false;
    let newStatPts = 0;
    let newSP = 0;
    let newTP = 0;
    while (newLevel < MAX_LEVEL && newXp >= xpForLevel(newLevel)) {
      newXp -= xpForLevel(newLevel);
      newLevel++;
      leveled = true;
      newStatPts += POINTS_PER_LEVEL;
      if (newLevel % SP_INTERVAL === 0) newSP++;
      if (newLevel >= 10) newTP++; // 1 talent point per level from 10+
    }
    if (newLevel >= MAX_LEVEL) newXp = 0;

    shadowCoinManager.addCoins(stage.coins, 'colosseum_victory');
    setData(prev => ({
      ...prev,
      chibiLevels: { ...prev.chibiLevels, [selChibi]: { level: newLevel, xp: newXp } },
      stagesCleared: prev.stagesCleared.includes(stage.id) ? prev.stagesCleared : [...prev.stagesCleared, stage.id],
      stats: { battles: prev.stats.battles + 1, wins: prev.stats.wins + 1 },
    }));
    setResult({ won: true, xp: stage.xp, coins: stage.coins, leveled, newLevel, oldLevel: level, newStatPts, newSP, newTP });
    setView('result');
  }, [selChibi, selStage, data]);

  // ─── Defeat ────────────────────────────────────────────────

  const handleDefeat = useCallback(() => {
    setPhase('done');
    const stage = STAGES[selStage];
    const cooldownMs = TIER_COOLDOWN_MIN[stage.tier] * 60 * 1000;
    setData(prev => ({
      ...prev,
      cooldowns: { ...prev.cooldowns, [selChibi]: Date.now() + cooldownMs },
      stats: { ...prev.stats, battles: prev.stats.battles + 1 },
    }));
    setResult({ won: false, cooldownMin: TIER_COOLDOWN_MIN[stage.tier] });
    setView('result');
  }, [selChibi, selStage]);

  // ─── Flee ──────────────────────────────────────────────────

  const flee = () => {
    setData(prev => ({
      ...prev,
      cooldowns: { ...prev.cooldowns, [selChibi]: Date.now() + 5 * 60 * 1000 },
    }));
    setBattle(null);
    setView('hub');
  };

  // ─── HP Bar ────────────────────────────────────────────────

  const HpBar = ({ hp, maxHp }) => {
    const pct = Math.max(0, (hp / maxHp) * 100);
    const color = pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pb-20">
      <style>{`
        @keyframes hitShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes dmgFloat { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-40px) scale(1.4)} }
        @keyframes victoryPulse { 0%,100%{text-shadow:0 0 10px gold} 50%{text-shadow:0 0 30px gold,0 0 60px orange} }
        @keyframes defeatPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes nodePulse { 0%,100%{box-shadow:0 0 4px rgba(251,191,36,0.3)} 50%{box-shadow:0 0 12px rgba(251,191,36,0.6)} }
        @keyframes statGlow { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>

      {/* ═══ HUB VIEW ═══ */}
      {view === 'hub' && (
        <div className="max-w-lg mx-auto px-3 pt-4">
          {/* Header */}
          <div className="text-center mb-5">
            <Link to="/" className="text-gray-500 text-xs hover:text-white transition-colors">&larr; Retour</Link>
            <h1 className="text-2xl md:text-3xl font-black mt-1 bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">
              Shadow Colosseum
            </h1>
            <p className="text-[10px] text-gray-500 mt-1">Le Colisee des Ombres — Fais combattre tes chibis !</p>
            <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-400">
              <span>{data.stats.battles} combats</span>
              <span>{data.stats.wins} victoires</span>
            </div>
          </div>

          {/* No chibis warning */}
          {ownedIds.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              <div className="text-4xl mb-3">{'\uD83D\uDC1C'}</div>
              <p>Tu n'as aucun chibi !</p>
              <p className="text-xs mt-1">Attrape-les quand ils passent sur l'ecran.</p>
            </div>
          )}

          {/* Your Chibis */}
          {ownedIds.length > 0 && (
            <>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Tes Chibis</div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {ownedIds.map(id => {
                  const c = CHIBIS[id];
                  const { level, xp } = getChibiLevel(id);
                  const alloc = data.statPoints[id] || {};
                  const tb = getChibiTalentBonuses(id);
                  const s = statsAt(c.base, c.growth, level, alloc, tb);
                  const onCd = isCooldown(id);
                  const selected = selChibi === id;
                  const availPts = getAvailStatPts(id);
                  const availSP = getAvailSP(id);
                  const availTP = getAvailTalentPts(id);
                  const hasUnspent = availPts > 0 || availSP > 0 || availTP > 0;
                  return (
                    <button
                      key={id}
                      onClick={() => !onCd && setSelChibi(selected ? null : id)}
                      disabled={onCd}
                      className={`relative p-2 rounded-xl border transition-all text-left ${
                        selected ? 'border-purple-400 bg-purple-500/15 ring-1 ring-purple-400/50' :
                        onCd ? 'border-red-500/30 bg-red-900/10 opacity-60' :
                        'border-gray-700/40 bg-gray-800/30 hover:border-purple-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={SPRITES[id]} alt={c.name} className="w-10 h-10 object-contain" style={{ filter: RARITY[c.rarity].glow, imageRendering: 'auto' }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate">{c.name}</div>
                          <div className="flex items-center gap-1 text-[9px]">
                            <span className={RARITY[c.rarity].color}>{RARITY[c.rarity].stars}</span>
                            <span className={ELEMENTS[c.element].color}>{ELEMENTS[c.element].icon}</span>
                            <span className="text-gray-400">Lv{level}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-1.5 grid grid-cols-3 gap-x-2 gap-y-0.5 text-[8px] text-gray-400">
                        <span>PV:{s.hp}</span><span>ATK:{s.atk}</span><span>DEF:{s.def}</span>
                        <span>SPD:{s.spd}</span><span>CRT:{s.crit}%</span><span>RES:{s.res}%</span>
                      </div>
                      {level < MAX_LEVEL && (
                        <div className="mt-1 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500/60 rounded-full" style={{ width: `${(xp / xpForLevel(level)) * 100}%` }} />
                        </div>
                      )}
                      {hasUnspent && !onCd && (
                        <div className="absolute -top-1 -right-1 flex gap-0.5">
                          {availPts > 0 && (
                            <span className="px-1 py-0.5 rounded text-[7px] font-bold bg-amber-500/80 text-black" style={{ animation: 'statGlow 2s ease-in-out infinite' }}>
                              {availPts} PTS
                            </span>
                          )}
                          {availSP > 0 && (
                            <span className="px-1 py-0.5 rounded text-[7px] font-bold bg-purple-500/80 text-white" style={{ animation: 'statGlow 2s ease-in-out infinite' }}>
                              {availSP} SP
                            </span>
                          )}
                          {availTP > 0 && (
                            <span className="px-1 py-0.5 rounded text-[7px] font-bold bg-green-500/80 text-black" style={{ animation: 'statGlow 2s ease-in-out infinite' }}>
                              {availTP} TP
                            </span>
                          )}
                        </div>
                      )}
                      {onCd && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                          <span className="text-red-400 text-[10px] font-bold">{'\u23F3'} {cooldownMin(id)}min</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Chibi Detail Panel */}
              <AnimatePresence>
                {selChibi && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={SPRITES[selChibi]} alt="" className="w-12 h-12 object-contain" style={{ filter: RARITY[CHIBIS[selChibi].rarity].glow }} />
                        <div className="flex-1">
                          <div className="text-sm font-bold">{CHIBIS[selChibi].name}</div>
                          <div className="text-[10px] text-gray-400">
                            Lv{getChibiLevel(selChibi).level} {RARITY[CHIBIS[selChibi].rarity].stars} {ELEMENTS[CHIBIS[selChibi].element].icon}
                          </div>
                        </div>
                      </div>
                      {/* 6 Stats */}
                      {(() => {
                        const alloc = data.statPoints[selChibi] || {};
                        const tbDetail = getChibiTalentBonuses(selChibi);
                        const s = statsAt(CHIBIS[selChibi].base, CHIBIS[selChibi].growth, getChibiLevel(selChibi).level, alloc, tbDetail);
                        return (
                          <div className="grid grid-cols-3 gap-1.5 mb-3">
                            {STAT_ORDER.map(stat => {
                              const isPct = stat === 'crit' || stat === 'res';
                              const m = STAT_META[stat];
                              return (
                                <div key={stat} className="flex items-center gap-1 bg-gray-800/30 rounded-md px-1.5 py-1">
                                  <span className="text-[10px]">{m.icon}</span>
                                  <span className={`text-[9px] font-bold ${m.color}`}>{m.name}</span>
                                  <span className="text-[10px] text-white ml-auto font-bold">{s[stat]}{isPct ? '%' : ''}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setManageTarget(selChibi); setView('stats'); }}
                          className="flex-1 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors"
                        >
                          {'\uD83D\uDCCA'} Stats {getAvailStatPts(selChibi) > 0 && <span className="ml-1 px-1 rounded bg-amber-500/30 text-[9px]">{getAvailStatPts(selChibi)}</span>}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setManageTarget(selChibi); setView('skilltree'); }}
                          className="flex-1 py-2 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition-colors"
                        >
                          {'\uD83C\uDF33'} Skills {getAvailSP(selChibi) > 0 && <span className="ml-1 px-1 rounded bg-purple-500/30 text-[9px]">{getAvailSP(selChibi)}</span>}
                        </button>
                        {getChibiLevel(selChibi).level >= 10 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setManageTarget(selChibi); setView('talents'); }}
                            className="flex-1 py-2 rounded-lg border border-green-500/40 bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors"
                          >
                            {'\u2728'} Talents {getAvailTalentPts(selChibi) > 0 && <span className="ml-1 px-1 rounded bg-green-500/30 text-[9px]">{getAvailTalentPts(selChibi)}</span>}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Stages */}
          {ownedIds.length > 0 && [1, 2, 3, 4, 5, 6].map(tier => (
            <div key={tier} className="mb-4">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">
                Tier {tier} — {TIER_NAMES[tier]}
              </div>
              <div className="space-y-1.5">
                {STAGES.filter(s => s.tier === tier).map((stage) => {
                  const globalIdx = STAGES.indexOf(stage);
                  const unlocked = isStageUnlocked(globalIdx);
                  const cleared = data.stagesCleared.includes(stage.id);
                  const selected = selStage === globalIdx;
                  const elemAdv = selChibi ? getElementMult(CHIBIS[selChibi].element, stage.element) : 1;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => unlocked && setSelStage(selected ? null : globalIdx)}
                      disabled={!unlocked}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                        selected ? 'border-purple-400 bg-purple-500/15' :
                        !unlocked ? 'border-gray-800/40 bg-gray-900/20 opacity-40' :
                        cleared ? 'border-green-600/30 bg-green-900/10 hover:border-purple-500/40' :
                        'border-gray-700/40 bg-gray-800/30 hover:border-purple-500/40'
                      }`}
                    >
                      <span className="text-xl w-8 text-center">{unlocked ? stage.emoji : '\uD83D\uDD12'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate">{stage.name}</span>
                          {stage.isBoss && <span className="text-[8px] bg-red-500/30 text-red-300 px-1 rounded">BOSS</span>}
                          {cleared && <span className="text-green-400 text-[10px]">{'\u2705'}</span>}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-gray-400 mt-0.5">
                          <span className={ELEMENTS[stage.element].color}>{ELEMENTS[stage.element].icon} {ELEMENTS[stage.element].name}</span>
                          <span>PV:{stage.hp}</span>
                          <span>RES:{stage.res}%</span>
                          <span>XP:{stage.xp}</span>
                          <span>{'\uD83D\uDCB0'}{stage.coins}</span>
                          {selChibi && elemAdv !== 1 && (
                            <span className={elemAdv > 1 ? 'text-green-400' : 'text-red-400'}>
                              {elemAdv > 1 ? '\u25B2' : '\u25BC'}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Fight Button */}
          {selChibi && selStage !== null && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
              <button
                onClick={startBattle}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-red-600 rounded-xl font-black text-lg shadow-xl shadow-purple-900/40 hover:scale-105 transition-transform active:scale-95"
              >
                {'\u2694\uFE0F'} COMBAT !
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* ═══ STATS VIEW ═══ */}
      {view === 'stats' && manageTarget && (() => {
        const id = manageTarget;
        const c = CHIBIS[id];
        const { level } = getChibiLevel(id);
        const alloc = data.statPoints[id] || {};
        const available = getAvailStatPts(id);
        const total = getTotalStatPts(level);
        const spent = getSpentStatPts(id);

        return (
          <div className="max-w-lg mx-auto px-3 pt-4">
            <button onClick={() => setView('hub')} className="text-gray-500 text-xs hover:text-white transition-colors mb-3 block">&larr; Retour</button>

            {/* Header */}
            <div className="text-center mb-5">
              <img src={SPRITES[id]} alt={c.name} className="w-16 h-16 mx-auto object-contain" style={{ filter: RARITY[c.rarity].glow }} />
              <h2 className="text-lg font-black mt-2">{c.name}</h2>
              <div className="text-[10px] text-gray-400">
                Lv{level} {RARITY[c.rarity].stars} {ELEMENTS[c.element].icon} {ELEMENTS[c.element].name}
              </div>
            </div>

            {/* Points Summary */}
            <div className="text-center mb-4 p-2 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="text-sm font-bold text-amber-400">
                {available} <span className="text-xs text-gray-400 font-normal">points disponibles</span>
              </div>
              <div className="text-[9px] text-gray-500">{spent}/{total} utilises ({POINTS_PER_LEVEL} par niveau)</div>
            </div>

            {/* Stats Allocation */}
            <div className="space-y-2 mb-4">
              {STAT_ORDER.map(stat => {
                const m = STAT_META[stat];
                const isPct = stat === 'crit' || stat === 'res';
                const baseVal = isPct
                  ? +(c.base[stat] + c.growth[stat] * (level - 1)).toFixed(1)
                  : Math.floor(c.base[stat] + c.growth[stat] * (level - 1));
                const bonusVal = (alloc[stat] || 0) * STAT_PER_POINT[stat];
                const totalVal = isPct ? +(baseVal + bonusVal).toFixed(1) : Math.floor(baseVal + bonusVal);
                const allocated = alloc[stat] || 0;

                return (
                  <div key={stat} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/30">
                    <span className="text-base w-6 text-center">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${m.color}`}>{m.name}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-white">{totalVal}{isPct ? '%' : ''}</span>
                          {bonusVal > 0 && (
                            <span className="text-[9px] text-green-400 ml-1">
                              (+{isPct ? bonusVal.toFixed(1) : Math.floor(bonusVal)})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-[8px] text-gray-500 mt-0.5">{m.desc}</div>
                      {/* Allocation bar */}
                      <div className="mt-1 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${m.color.replace('text-', 'bg-')}`}
                          style={{ width: `${Math.min(100, (allocated / 30) * 100)}%`, opacity: 0.6 }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => allocateStat(id, stat, -1)}
                        disabled={allocated <= 0}
                        className="w-7 h-7 rounded-lg bg-gray-700/50 text-gray-300 text-sm font-bold hover:bg-red-500/30 disabled:opacity-20 transition-colors flex items-center justify-center"
                      >-</button>
                      <span className="text-[10px] text-gray-400 w-5 text-center font-mono">{allocated}</span>
                      <button
                        onClick={() => allocateStat(id, stat, 1)}
                        disabled={available <= 0}
                        className="w-7 h-7 rounded-lg bg-gray-700/50 text-gray-300 text-sm font-bold hover:bg-green-500/30 disabled:opacity-20 transition-colors flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Per-point info */}
            <div className="text-center mb-3 p-2 rounded-lg bg-gray-800/20 border border-gray-700/20">
              <div className="text-[8px] text-gray-500 mb-1">Valeur par point :</div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[9px] text-gray-400">
                {STAT_ORDER.map(stat => (
                  <span key={stat}>
                    <span className={STAT_META[stat].color}>{STAT_META[stat].name}</span> +{STAT_PER_POINT[stat]}{(stat === 'crit' || stat === 'res') ? '%' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => resetStats(id)}
              disabled={spent === 0}
              className="w-full text-center text-xs text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors py-2"
            >
              Reinitialiser les points (gratuit)
            </button>
          </div>
        );
      })()}

      {/* ═══ SKILL TREE VIEW ═══ */}
      {view === 'skilltree' && manageTarget && (() => {
        const id = manageTarget;
        const c = CHIBIS[id];
        const { level } = getChibiLevel(id);
        const tree = data.skillTree[id] || {};
        const availSP = getAvailSP(id);
        const totalSP = getTotalSP(level);
        const spentSP = getSpentSP(id);

        return (
          <div className="max-w-lg mx-auto px-3 pt-4">
            <button onClick={() => setView('hub')} className="text-gray-500 text-xs hover:text-white transition-colors mb-3 block">&larr; Retour</button>

            {/* Header */}
            <div className="text-center mb-5">
              <img src={SPRITES[id]} alt={c.name} className="w-16 h-16 mx-auto object-contain" style={{ filter: RARITY[c.rarity].glow }} />
              <h2 className="text-lg font-black mt-2">{c.name}</h2>
              <div className="text-[10px] text-gray-400">
                Lv{level} {RARITY[c.rarity].stars} {ELEMENTS[c.element].icon} {ELEMENTS[c.element].name}
              </div>
            </div>

            {/* SP Summary */}
            <div className="text-center mb-5 p-2 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <div className="text-sm font-bold text-purple-400">
                {availSP} <span className="text-xs text-gray-400 font-normal">SP disponibles</span>
              </div>
              <div className="text-[9px] text-gray-500">{spentSP}/{totalSP} utilises (1 SP tous les {SP_INTERVAL} niveaux)</div>
            </div>

            {/* 3 Skill Columns */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {c.skills.map((skill, skillIdx) => {
                const curLevel = tree[skillIdx] || 0;
                // Show upgraded values preview
                const upgraded = applySkillUpgrades(skill, curLevel);

                return (
                  <div key={skillIdx} className="text-center">
                    {/* Skill Name */}
                    <div className="p-1.5 rounded-t-lg bg-gray-800/40 border border-gray-700/30 border-b-0">
                      <div className="text-[9px] font-bold text-white truncate">{skill.name}</div>
                      <div className="text-[7px] text-gray-500 mt-0.5">
                        {upgraded.power > 0 ? `DMG: ${upgraded.power}%` : ''}
                        {upgraded.buffAtk ? `ATK +${upgraded.buffAtk}%` : ''}
                        {upgraded.buffDef ? `DEF +${upgraded.buffDef}%` : ''}
                        {upgraded.healSelf ? `Soin ${upgraded.healSelf}%` : ''}
                        {upgraded.debuffDef ? `Debuff -${upgraded.debuffDef}%` : ''}
                        {upgraded.cdMax > 0 ? ` | CD:${upgraded.cdMax}` : ''}
                      </div>
                    </div>

                    {/* 3 Tier Nodes */}
                    {[0, 1, 2].map(tierIdx => {
                      const isUnlocked = curLevel > tierIdx;
                      const isAvailable = curLevel === tierIdx && availSP >= TIER_COSTS[tierIdx];
                      const isLocked = !isUnlocked && !isAvailable;
                      const desc = getUpgradeDesc(skill, tierIdx);

                      return (
                        <React.Fragment key={tierIdx}>
                          {/* Connecting line */}
                          <div className={`w-0.5 h-2 mx-auto ${isUnlocked || (tierIdx === 0 && isAvailable) ? 'bg-purple-400/60' : 'bg-gray-700/40'}`} />

                          {/* Node */}
                          <button
                            onClick={() => isAvailable && upgradeSkill(id, skillIdx)}
                            disabled={!isAvailable}
                            className={`w-full p-1.5 rounded-lg border transition-all ${
                              isUnlocked ? 'border-purple-400/50 bg-purple-500/15' :
                              isAvailable ? 'border-amber-400/60 bg-amber-500/5 hover:bg-amber-500/15 cursor-pointer' :
                              'border-gray-700/20 bg-gray-800/15 opacity-40'
                            }`}
                            style={isAvailable ? { animation: 'nodePulse 2s ease-in-out infinite' } : {}}
                          >
                            <div className={`text-[8px] font-bold ${
                              isUnlocked ? 'text-purple-300' : isAvailable ? 'text-amber-400' : 'text-gray-600'
                            }`}>
                              {isUnlocked ? '\u2713 ' : ''}{TIER_NAMES_SKILL[tierIdx]}
                            </div>
                            <div className="text-[7px] text-gray-400 mt-0.5">{desc}</div>
                            {!isUnlocked && (
                              <div className={`text-[7px] mt-0.5 ${isAvailable ? 'text-amber-400' : 'text-gray-600'}`}>
                                {TIER_COSTS[tierIdx]} SP
                              </div>
                            )}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Upgrade descriptions */}
            <div className="p-2 rounded-lg bg-gray-800/20 border border-gray-700/20 mb-3">
              <div className="text-[8px] text-gray-500 mb-1">Tiers de competence :</div>
              <div className="space-y-0.5 text-[8px] text-gray-400">
                <div><span className="text-purple-400 font-bold">Eveil</span> — DMG/Effet +30/25% (1 SP)</div>
                <div><span className="text-purple-400 font-bold">Maitrise</span> — Cooldown -1 tour (1 SP)</div>
                <div><span className="text-purple-400 font-bold">Transcendance</span> — DMG/Effet +25/30% (2 SP)</div>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => resetSkillTree(id)}
              disabled={spentSP === 0}
              className="w-full text-center text-xs text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors py-2"
            >
              Reinitialiser les competences (gratuit)
            </button>
          </div>
        );
      })()}

      {/* ═══ TALENTS VIEW ═══ */}
      {view === 'talents' && manageTarget && (() => {
        const id = manageTarget;
        const c = CHIBIS[id];
        const { level } = getChibiLevel(id);
        const totalTP = getTotalTalentPts(level);
        const spentTP = getSpentTalentPts(id);
        const availTP = totalTP - spentTP;
        const chibiAlloc = data.talentTree[id] || {};
        const treeIds = Object.keys(TALENT_TREES);
        const tree = TALENT_TREES[activeTree];
        const treePts = getTreePoints(id, activeTree);
        const treeMax = getTreeMaxPoints(activeTree);

        return (
          <div className="max-w-lg mx-auto px-3 pt-4">
            <button onClick={() => setView('hub')} className="text-gray-500 text-xs hover:text-white transition-colors mb-3 block">&larr; Retour</button>

            {/* Header */}
            <div className="text-center mb-4">
              <img src={SPRITES[id]} alt={c.name} className="w-14 h-14 mx-auto object-contain" style={{ filter: RARITY[c.rarity].glow }} />
              <h2 className="text-lg font-black mt-2">{c.name}</h2>
              <div className="text-[10px] text-gray-400">
                Lv{level} {RARITY[c.rarity].stars} {ELEMENTS[c.element].icon}
              </div>
              <div className="mt-2 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/20 inline-block">
                <span className="text-sm font-bold text-green-400">{availTP}</span>
                <span className="text-xs text-gray-400 ml-1">points de talent disponibles</span>
                <span className="text-[9px] text-gray-500 ml-1">({spentTP}/{totalTP})</span>
              </div>
            </div>

            {/* Tree Tabs */}
            <div className="flex gap-1.5 mb-4">
              {treeIds.map(tid => {
                const t = TALENT_TREES[tid];
                const pts = getTreePoints(id, tid);
                const max = getTreeMaxPoints(tid);
                const isActive = activeTree === tid;
                return (
                  <button
                    key={tid}
                    onClick={() => setActiveTree(tid)}
                    className={`flex-1 py-2 rounded-lg border text-center transition-all ${
                      isActive
                        ? `border-${t.color}-500/60 bg-${t.color}-500/15`
                        : 'border-gray-700/40 bg-gray-800/20 hover:border-gray-600/60'
                    }`}
                    style={isActive ? { borderColor: t.accent + '60', backgroundColor: t.accent + '15' } : {}}
                  >
                    <div className="text-base">{t.icon}</div>
                    <div className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>{t.name}</div>
                    <div className="text-[8px] text-gray-500">{pts}/{max}</div>
                  </button>
                );
              })}
            </div>

            {/* Tree Description */}
            <div className="text-center text-[10px] text-gray-500 mb-3" style={{ color: tree.accent + 'aa' }}>
              {tree.desc}
            </div>

            {/* Talent Nodes — WoW-style vertical layout */}
            <div className="relative pb-4">
              {tree.rows.map((row, rowIdx) => {
                const locked = treePts < row.requiredPoints;
                const treeAlloc = chibiAlloc[activeTree] || {};

                return (
                  <div key={rowIdx}>
                    {/* Tier gate label */}
                    {row.requiredPoints > 0 && (
                      <div className="flex items-center gap-2 my-2">
                        <div className="flex-1 h-px bg-gray-700/40" />
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                          locked ? 'text-gray-600 bg-gray-800/30' : 'bg-gray-800/40'
                        }`} style={!locked ? { color: tree.accent } : {}}>
                          {row.requiredPoints} pts requis
                        </span>
                        <div className="flex-1 h-px bg-gray-700/40" />
                      </div>
                    )}

                    {/* SVG connecting lines */}
                    {rowIdx > 0 && (
                      <div className="flex justify-center mb-1">
                        <div className={`w-0.5 h-4 ${locked ? 'bg-gray-700/30' : 'bg-gray-600/40'}`}
                          style={!locked ? { backgroundColor: tree.accent + '40' } : {}} />
                      </div>
                    )}

                    {/* Nodes Row */}
                    <div className="flex justify-center gap-3">
                      {row.nodes.map(node => {
                        const rank = treeAlloc[node.id] || 0;
                        const isMaxed = rank >= node.maxRank;
                        const canUpgrade = !locked && rank < node.maxRank && availTP > 0 && treePts >= row.requiredPoints;
                        const isCapstone = node.capstone;
                        const desc = rank > 0 ? getNodeDesc(node, rank) : getNodeDesc(node, 1);

                        return (
                          <button
                            key={node.id}
                            onClick={() => canUpgrade && allocateTalentPoint(id, activeTree, node.id)}
                            disabled={!canUpgrade}
                            className={`relative w-full max-w-[140px] p-2 rounded-xl border transition-all text-center ${
                              isMaxed ? 'border-yellow-500/50 bg-yellow-500/5' :
                              canUpgrade ? 'border-amber-400/50 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer' :
                              locked ? 'border-gray-800/30 bg-gray-900/20 opacity-30' :
                              'border-gray-700/30 bg-gray-800/20 opacity-50'
                            }`}
                            style={
                              isMaxed ? { borderColor: tree.accent + '60', boxShadow: `0 0 12px ${tree.accent}30` } :
                              canUpgrade ? { animation: 'nodePulse 2s ease-in-out infinite' } : {}
                            }
                          >
                            {/* Capstone special border */}
                            {isCapstone && isMaxed && (
                              <div className="absolute inset-0 rounded-xl border-2 pointer-events-none"
                                style={{ borderColor: tree.accent + '80', boxShadow: `0 0 20px ${tree.accent}40, inset 0 0 12px ${tree.accent}15` }} />
                            )}

                            <div className="text-xl mb-0.5">{node.icon}</div>
                            <div className={`text-[10px] font-bold ${isMaxed ? 'text-white' : locked ? 'text-gray-600' : 'text-gray-300'}`}>
                              {node.name}
                            </div>

                            {/* Rank dots */}
                            <div className="flex justify-center gap-0.5 mt-1">
                              {Array.from({ length: node.maxRank }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 rounded-full ${i < rank ? 'bg-yellow-400' : 'bg-gray-700'}`}
                                  style={i < rank ? { backgroundColor: tree.accent, boxShadow: `0 0 4px ${tree.accent}60` } : {}}
                                />
                              ))}
                            </div>

                            <div className="text-[8px] mt-1" style={{ color: isMaxed ? tree.accent : rank > 0 ? '#9CA3AF' : '#6B7280' }}>
                              {rank}/{node.maxRank}
                            </div>

                            {/* Description */}
                            <div className={`text-[7px] mt-0.5 ${rank > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                              {desc}
                            </div>

                            {/* Locked icon */}
                            {locked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                                <span className="text-lg">{'\uD83D\uDD12'}</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Bonuses Summary */}
            {spentTP > 0 && (() => {
              const tb = getChibiTalentBonuses(id);
              const bonuses = [];
              if (tb.atkPercent > 0) bonuses.push({ label: 'ATK', value: `+${tb.atkPercent}%`, color: 'text-red-400' });
              if (tb.hpPercent > 0) bonuses.push({ label: 'PV', value: `+${tb.hpPercent}%`, color: 'text-green-400' });
              if (tb.defPercent > 0) bonuses.push({ label: 'DEF', value: `+${tb.defPercent}%`, color: 'text-blue-400' });
              if (tb.spdPercent > 0) bonuses.push({ label: 'SPD', value: `+${tb.spdPercent}%`, color: 'text-emerald-400' });
              if (tb.critRate > 0) bonuses.push({ label: 'Crit Rate', value: `+${tb.critRate}%`, color: 'text-yellow-400' });
              if (tb.critDamage > 0) bonuses.push({ label: 'Crit DMG', value: `+${tb.critDamage}%`, color: 'text-orange-400' });
              if (tb.resFlat > 0) bonuses.push({ label: 'RES', value: `+${tb.resFlat}%`, color: 'text-cyan-400' });
              if (tb.physicalDamage > 0) bonuses.push({ label: 'DMG Phys', value: `+${tb.physicalDamage}%`, color: 'text-red-300' });
              if (tb.elementalDamage > 0) bonuses.push({ label: 'DMG Elem', value: `+${tb.elementalDamage}%`, color: 'text-blue-300' });
              if (tb.elementalAdvantageBonus > 0) bonuses.push({ label: 'Bonus Elem', value: `+${tb.elementalAdvantageBonus}%`, color: 'text-purple-300' });
              if (tb.bossDamage > 0) bonuses.push({ label: 'DMG Boss', value: `+${tb.bossDamage}%`, color: 'text-red-500' });
              if (tb.cooldownReduction > 0) bonuses.push({ label: 'CD', value: `-${tb.cooldownReduction}`, color: 'text-sky-400' });
              if (tb.regenPerTurn > 0) bonuses.push({ label: 'Regen', value: `+${tb.regenPerTurn}%/t`, color: 'text-green-300' });
              if (tb.counterChance > 0) bonuses.push({ label: 'Riposte', value: `${tb.counterChance}%`, color: 'text-amber-400' });
              if (tb.hasBerserk) bonuses.push({ label: 'Berserk', value: '\u2713', color: 'text-red-400' });
              if (tb.hasTranscendance) bonuses.push({ label: 'Transcendance', value: '\u2713', color: 'text-blue-400' });
              if (tb.hasImmortel) bonuses.push({ label: 'Immortel', value: '\u2713', color: 'text-green-400' });

              if (bonuses.length === 0) return null;
              return (
                <div className="mt-2 p-2 rounded-lg bg-gray-800/20 border border-gray-700/20">
                  <div className="text-[8px] text-gray-500 mb-1.5 text-center">Bonus actifs</div>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[9px]">
                    {bonuses.map(b => (
                      <span key={b.label}>
                        <span className={b.color}>{b.label}</span> <span className="text-white">{b.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Respec Button */}
            <div className="mt-4 text-center">
              <button
                onClick={() => resetTalents(id)}
                disabled={spentTP === 0}
                className="text-xs text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors py-2"
              >
                Reinitialiser les talents {getRespecCost(id) > 0 ? `(${getRespecCost(id)} coins)` : '(gratuit)'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* ═══ BATTLE VIEW ═══ */}
      {view === 'battle' && battle && (
        <div className="max-w-md mx-auto px-3 pt-3">
          <div className="text-center text-[10px] text-gray-500 mb-2">Tour {battle.turn}</div>

          {/* Enemy */}
          <div className={`relative p-3 rounded-xl border ${ELEMENTS[battle.enemy.element].border} ${ELEMENTS[battle.enemy.element].bg} mb-3`}
            style={{ animation: phase === 'enemy_atk' ? 'none' : dmgPopup?.target === 'enemy' ? 'hitShake 0.4s ease-out' : 'none' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{STAGES[selStage].emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{battle.enemy.name}</span>
                  <span className={`text-[9px] ${ELEMENTS[battle.enemy.element].color}`}>{ELEMENTS[battle.enemy.element].icon}</span>
                </div>
                <HpBar hp={battle.enemy.hp} maxHp={battle.enemy.maxHp} />
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[9px] text-gray-400">{battle.enemy.hp}/{battle.enemy.maxHp} PV</span>
                  <span className="text-[8px] text-gray-500">CRT:{battle.enemy.crit}% RES:{battle.enemy.res}%</span>
                </div>
                {battle.enemy.buffs.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {battle.enemy.buffs.map((b, i) => (
                      <span key={i} className={`text-[8px] px-1 rounded ${b.value > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {b.stat.toUpperCase()} {b.value > 0 ? '+' : ''}{Math.round(b.value * 100)}% ({b.turns}t)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <AnimatePresence>
              {dmgPopup?.target === 'enemy' && (
                <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -30 }} transition={{ duration: 0.8 }}
                  className={`absolute top-1 right-4 font-black text-lg ${dmgPopup.isCrit ? 'text-yellow-400' : 'text-green-400'}`}>
                  -{dmgPopup.value}{dmgPopup.isCrit ? ' CRIT!' : ''}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* VS */}
          <div className="text-center text-gray-600 text-xs font-bold my-1">VS</div>

          {/* Player */}
          <div className={`relative p-3 rounded-xl border border-purple-500/40 bg-purple-500/10 mb-3`}
            style={{ animation: phase === 'player_atk' ? 'none' : dmgPopup?.target === 'player' ? 'hitShake 0.4s ease-out' : 'none' }}
          >
            <div className="flex items-center gap-3">
              <img src={SPRITES[battle.player.id]} alt={battle.player.name} className="w-12 h-12 object-contain" style={{ filter: RARITY[CHIBIS[battle.player.id].rarity].glow, imageRendering: 'auto' }} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{battle.player.name} <span className="text-gray-400 text-[10px]">Lv{battle.player.level}</span></span>
                  <span className={`text-[9px] ${ELEMENTS[battle.player.element].color}`}>{ELEMENTS[battle.player.element].icon}</span>
                </div>
                <HpBar hp={battle.player.hp} maxHp={battle.player.maxHp} />
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[9px] text-gray-400">{battle.player.hp}/{battle.player.maxHp} PV</span>
                  <span className="text-[8px] text-gray-500">CRT:{battle.player.crit}% RES:{battle.player.res}%</span>
                </div>
                {battle.player.buffs.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {battle.player.buffs.map((b, i) => (
                      <span key={i} className={`text-[8px] px-1 rounded ${b.value > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {b.stat.toUpperCase()} {b.value > 0 ? '+' : ''}{Math.round(b.value * 100)}% ({b.turns}t)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <AnimatePresence>
              {dmgPopup?.target === 'player' && (
                <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -30 }} transition={{ duration: 0.8 }}
                  className={`absolute top-1 right-4 font-black text-lg ${dmgPopup.isCrit ? 'text-yellow-400' : 'text-red-400'}`}>
                  -{dmgPopup.value}{dmgPopup.isCrit ? ' CRIT!' : ''}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Battle Log */}
          <div className="bg-gray-900/50 rounded-lg p-2 mb-3 max-h-24 overflow-y-auto border border-gray-800/50">
            {battle.log.length === 0 && <div className="text-[10px] text-gray-600 text-center">Le combat commence...</div>}
            {battle.log.map((entry, i) => (
              <div key={entry.id} className={`text-[10px] leading-relaxed ${
                i === battle.log.length - 1 ? 'text-white font-medium' :
                entry.type === 'player' ? 'text-green-400/70' : 'text-red-400/70'
              }`}>
                {entry.text}
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {battle.player.skills.map((skill, i) => {
              const onCd = skill.cd > 0;
              return (
                <button
                  key={i}
                  onClick={() => !onCd && phase === 'idle' && executeRound(i)}
                  disabled={onCd || phase !== 'idle'}
                  className={`relative p-2 rounded-lg border text-center transition-all ${
                    onCd ? 'border-gray-700/30 bg-gray-800/20 opacity-40' :
                    phase !== 'idle' ? 'border-gray-700/30 bg-gray-800/20 opacity-60' :
                    'border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 active:scale-95'
                  }`}
                >
                  <div className="text-[10px] font-bold truncate">{skill.name}</div>
                  <div className="text-[8px] text-gray-400 mt-0.5">{skill.desc}</div>
                  {skill.power > 0 && <div className="text-[8px] text-red-400 mt-0.5">DMG: {skill.power}%</div>}
                  {(skill.healSelf || skill.buffAtk || skill.buffDef) && (
                    <div className="text-[8px] text-cyan-400 mt-0.5">
                      {skill.healSelf ? `Soin ${skill.healSelf}%` : skill.buffAtk ? `ATK +${skill.buffAtk}%` : `DEF +${skill.buffDef}%`}
                    </div>
                  )}
                  {skill.debuffDef && <div className="text-[8px] text-orange-400 mt-0.5">DEF ennemi -{skill.debuffDef}%</div>}
                  {onCd && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                      <span className="text-gray-400 text-xs font-bold">{skill.cd}t</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Flee */}
          <button onClick={flee} className="w-full text-center text-[10px] text-gray-500 hover:text-red-400 transition-colors py-1">
            Fuir (cooldown 5min)
          </button>
        </div>
      )}

      {/* ═══ RESULT VIEW ═══ */}
      {view === 'result' && result && (
        <div className="max-w-md mx-auto px-4 pt-12 text-center">
          {result.won ? (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <div className="text-6xl mb-4" style={{ animation: 'victoryPulse 2s ease-in-out infinite' }}>{'\uD83C\uDFC6'}</div>
              <h2 className="text-3xl font-black text-yellow-400 mb-2">VICTOIRE !</h2>
              <p className="text-gray-300 text-sm mb-6">{CHIBIS[selChibi]?.name} a triomphe !</p>
              <div className="flex justify-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-400">+{result.xp}</div>
                  <div className="text-[10px] text-gray-500">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-yellow-400">+{result.coins}</div>
                  <div className="text-[10px] text-gray-500">Coins</div>
                </div>
              </div>
              {result.leveled && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/40 rounded-xl p-3 mb-4">
                  <div className="text-yellow-400 font-black text-lg">{'\u2B06\uFE0F'} LEVEL UP !</div>
                  <div className="text-white text-sm">Lv {result.oldLevel} {'\u2192'} Lv {result.newLevel}</div>
                </motion.div>
              )}
              {(result.newStatPts > 0 || result.newSP > 0 || result.newTP > 0) && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
                  className="bg-gradient-to-r from-amber-600/15 to-purple-600/15 border border-amber-500/30 rounded-xl p-3 mb-6">
                  <div className="text-[11px] font-bold text-amber-300 mb-1">Nouveaux points !</div>
                  <div className="flex justify-center gap-4 text-xs">
                    {result.newStatPts > 0 && (
                      <span className="text-amber-400">+{result.newStatPts} points de stats</span>
                    )}
                    {result.newSP > 0 && (
                      <span className="text-purple-400">+{result.newSP} SP</span>
                    )}
                    {result.newTP > 0 && (
                      <span className="text-green-400">+{result.newTP} Talent Points</span>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-6xl mb-4" style={{ animation: 'defeatPulse 2s ease-in-out infinite' }}>{'\uD83D\uDC80'}</div>
              <h2 className="text-3xl font-black text-red-400 mb-2">DEFAITE...</h2>
              <p className="text-gray-300 text-sm mb-4">{CHIBIS[selChibi]?.name} est KO.</p>
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 mb-6">
                <div className="text-red-400 text-sm font-bold">{'\u23F3'} Cooldown : {result.cooldownMin} minutes</div>
                <div className="text-gray-400 text-[10px] mt-1">
                  {CHIBIS[selChibi]?.name} ne peut plus combattre pendant {result.cooldownMin}min.
                </div>
              </div>
            </motion.div>
          )}
          <button
            onClick={() => { setView('hub'); setBattle(null); setResult(null); }}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform"
          >
            Retour au Colisee
          </button>
        </div>
      )}
    </div>
  );
}
