// BattleVFX.jsx — Animation system for Shadow Colosseum battles
// Pure CSS + Framer Motion VFX — zero new image assets

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ELEMENTS, RARITY } from './colosseumCore';
import { SUNG_SKILLS, RAID_DURATION_SEC } from './raidData';

// ═══════════════════════════════════════════════════════════════
// ELEMENT VFX CONFIG
// ═══════════════════════════════════════════════════════════════

const ELEMENT_VFX = {
  shadow: { colors: ['#a855f7', '#7c3aed', '#581c87'], count: 5, shape: 'wisp', animation: 'shadowWisp', impactColor: 'rgba(168,85,247,0.4)' },
  fire:   { colors: ['#ef4444', '#f97316', '#fbbf24'], count: 7, shape: 'circle', animation: 'fireRise', impactColor: 'rgba(239,68,68,0.4)' },
  wind:   { colors: ['#10b981', '#34d399', '#6ee7b7'], count: 4, shape: 'crescent', animation: 'windSwirl', impactColor: 'rgba(16,185,129,0.4)' },
  earth:  { colors: ['#f59e0b', '#d97706', '#92400e'], count: 5, shape: 'square', animation: 'earthQuake', impactColor: 'rgba(245,158,11,0.4)' },
  water:  { colors: ['#3b82f6', '#06b6d4', '#67e8f9'], count: 6, shape: 'circle', animation: 'waterSplash', impactColor: 'rgba(59,130,246,0.4)' },
  light:  { colors: ['#fbbf24', '#fef08a', '#ffffff'], count: 6, shape: 'star', animation: 'healSparkle', impactColor: 'rgba(251,191,36,0.4)' },
};
const ELEMENT_COLORS_RAW = {
  shadow: '#a855f7', fire: '#ef4444', wind: '#10b981', earth: '#f59e0b', water: '#3b82f6', light: '#fbbf24',
};

// ═══════════════════════════════════════════════════════════════
// BATTLE STYLES — CSS Keyframes (render once)
// ═══════════════════════════════════════════════════════════════

export function BattleStyles() {
  return (
    <style>{`
      @keyframes dashRight { 0%{transform:translateX(0) scaleX(-1)} 30%{transform:translateX(60px) scaleX(-1) scale(1.1)} 50%{transform:translateX(60px) scaleX(-1) scale(1.1)} 100%{transform:translateX(0) scaleX(-1)} }
      @keyframes dashLeft { 0%{transform:translateX(0)} 30%{transform:translateX(-60px) scale(1.1)} 50%{transform:translateX(-60px) scale(1.1)} 100%{transform:translateX(0)} }
      @keyframes idleBreathe { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
      @keyframes idleBreatheFlip { 0%,100%{transform:translateY(0) scaleX(-1)} 50%{transform:translateY(-3px) scaleX(-1)} }
      @keyframes koFade { 0%{filter:grayscale(0) brightness(1);transform:scale(1)} 30%{filter:grayscale(0) brightness(2);transform:scale(1.05)} 100%{filter:grayscale(1) brightness(0.5);transform:scale(0.85) rotate(8deg)} }
      @keyframes hitShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
      @keyframes impactBurst { 0%{opacity:1;transform:scale(0.3)} 50%{opacity:0.7;transform:scale(1.4)} 100%{opacity:0;transform:scale(2)} }
      @keyframes slashLine { 0%{transform:scaleX(0);opacity:1} 40%{transform:scaleX(1);opacity:1} 100%{transform:scaleX(1);opacity:0} }
      @keyframes fireRise { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-35px) scale(0.4)} }
      @keyframes shadowWisp { 0%{opacity:0.8;transform:scale(1) rotate(0deg)} 50%{opacity:0.4;transform:scale(1.4) rotate(180deg)} 100%{opacity:0;transform:scale(1.8) rotate(360deg)} }
      @keyframes waterSplash { 0%{opacity:1;transform:scaleY(0.3) scaleX(1)} 50%{opacity:0.7;transform:scaleY(1.2) scaleX(1.5)} 100%{opacity:0;transform:scaleY(0.2) scaleX(2)} }
      @keyframes windSwirl { 0%{opacity:1;transform:rotate(0deg) scale(0.5)} 100%{opacity:0;transform:rotate(720deg) scale(1.5)} }
      @keyframes earthQuake { 0%,100%{transform:translateY(0)} 10%{transform:translateY(-5px)} 20%{transform:translateY(5px)} 30%{transform:translateY(-3px)} 40%{transform:translateY(3px)} 50%{transform:translateY(-1px)} }
      @keyframes healSparkle { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-30px) scale(0.3)} }
      @keyframes critFlash { 0%{opacity:0.6} 100%{opacity:0} }
      @keyframes buffAura { 0%,100%{box-shadow:0 0 6px rgba(255,215,0,0.2)} 50%{box-shadow:0 0 18px rgba(255,215,0,0.5),0 0 35px rgba(255,215,0,0.15)} }
      @keyframes barBreakExplode { 0%{opacity:1;transform:scale(0.5)} 50%{opacity:0.8;transform:scale(2)} 100%{opacity:0;transform:scale(3.5)} }
      @keyframes phaseBanner { 0%{transform:scaleX(0);opacity:0} 15%{transform:scaleX(1);opacity:1} 85%{transform:scaleX(1);opacity:1} 100%{transform:scaleX(0);opacity:0} }
      @keyframes sungGlow { 0%{opacity:0} 15%{opacity:0.35} 85%{opacity:0.35} 100%{opacity:0} }
      @keyframes victoryPulse { 0%,100%{text-shadow:0 0 10px gold} 50%{text-shadow:0 0 30px gold,0 0 60px orange} }
      @keyframes defeatPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
      @keyframes nodePulse { 0%,100%{box-shadow:0 0 4px rgba(251,191,36,0.3)} 50%{box-shadow:0 0 12px rgba(251,191,36,0.6)} }
      @keyframes statGlow { 0%,100%{opacity:0.5} 50%{opacity:1} }
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      @keyframes raidChibiFlash { 0%{box-shadow:0 0 0 rgba(255,255,255,0)} 30%{box-shadow:0 0 15px rgba(255,255,255,0.6)} 100%{box-shadow:0 0 0 rgba(255,255,255,0)} }
      @keyframes raidBossHit { 0%{box-shadow:0 0 0 rgba(255,0,0,0)} 30%{box-shadow:0 0 20px rgba(255,0,0,0.5)} 100%{box-shadow:0 0 0 rgba(255,0,0,0)} }
      @keyframes dmgFloatUp { 0%{opacity:1;transform:translateY(0) scale(0.6)} 20%{opacity:1;transform:translateY(-8px) scale(1.1)} 100%{opacity:0;transform:translateY(-40px) scale(0.9)} }
      @keyframes dmgFloatCrit { 0%{opacity:1;transform:translateY(0) scale(0.5)} 15%{opacity:1;transform:translateY(-10px) scale(1.5)} 100%{opacity:0;transform:translateY(-55px) scale(1)} }
      @keyframes arenaIdleChib { 0%,100%{transform:translateY(0) scaleX(-1)} 50%{transform:translateY(-4px) scaleX(-1)} }
      @keyframes arenaIdleBoss { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      @keyframes arenaDashRight { 0%{transform:translateX(0) scaleX(-1)} 25%{transform:translateX(40px) scaleX(-1) scale(1.15)} 50%{transform:translateX(40px) scaleX(-1) scale(1.15)} 100%{transform:translateX(0) scaleX(-1)} }
      @keyframes arenaDashLeft { 0%{transform:translateX(0)} 25%{transform:translateX(-30px) scale(1.2)} 50%{transform:translateX(-30px) scale(1.2)} 100%{transform:translateX(0)} }
      @keyframes arenaHitChib { 0%,100%{transform:translateX(0) scaleX(-1)} 15%{transform:translateX(-6px) scaleX(-1)} 30%{transform:translateX(6px) scaleX(-1)} 50%{transform:translateX(-3px) scaleX(-1)} 70%{transform:translateX(3px) scaleX(-1)} }
      @keyframes arenaHitBoss { 0%,100%{transform:translateX(0)} 15%{transform:translateX(6px)} 30%{transform:translateX(-6px)} 50%{transform:translateX(3px)} 70%{transform:translateX(-3px)} }
      @keyframes arenaKO { 0%{opacity:1;filter:brightness(1)} 30%{opacity:0.8;filter:brightness(2)} 100%{opacity:0.25;filter:brightness(0.4) grayscale(1)} }
      @keyframes arenaShadow { 0%,100%{transform:scaleX(1);opacity:0.25} 50%{transform:scaleX(0.85);opacity:0.15} }
      @keyframes projectileFly { 0%{transform:translateX(0) translateY(0) scale(0.6);opacity:0} 8%{opacity:1;transform:translateX(15px) translateY(-5px) scale(1)} 85%{opacity:1;transform:translateX(calc(var(--proj-dist,140px) - 20px)) translateY(-8px) scale(1)} 100%{opacity:0;transform:translateX(var(--proj-dist,140px)) translateY(0) scale(1.3)} }
      @keyframes projectileImpact { 0%{opacity:1;transform:scale(0.3)} 40%{opacity:0.8;transform:scale(1.8)} 100%{opacity:0;transform:scale(2.5)} }
      @keyframes projectileTrail { 0%{opacity:0.6;width:30px} 100%{opacity:0;width:0} }
      @keyframes projectileSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(720deg)} }
      @keyframes projectileWobble { 0%{transform:rotate(20deg)} 20%{transform:rotate(34deg)} 40%{transform:rotate(10deg)} 60%{transform:rotate(32deg)} 80%{transform:rotate(12deg)} 100%{transform:rotate(20deg)} }
      @keyframes explosionGrow { 0%{transform:scale(0);opacity:0} 10%{transform:scale(1.2);opacity:1} 30%{transform:scale(2);opacity:0.9} 60%{transform:scale(2.5);opacity:0.6} 100%{transform:scale(3);opacity:0} }
      @keyframes explosionFlash { 0%{opacity:0} 8%{opacity:0.6} 25%{opacity:0.3} 100%{opacity:0} }
      @keyframes screenShake { 0%,100%{transform:translate(0)} 10%{transform:translate(-8px,4px)} 20%{transform:translate(6px,-6px)} 30%{transform:translate(-4px,2px)} 40%{transform:translate(4px,-4px)} 50%{transform:translate(-2px,3px)} 60%{transform:translate(5px,-2px)} 70%{transform:translate(-3px,5px)} 80%{transform:translate(2px,-3px)} }
      @keyframes meguminCast { 0%{filter:brightness(1) drop-shadow(0 0 0 transparent)} 20%{filter:brightness(1.8) drop-shadow(0 0 20px rgba(239,68,68,0.8))} 50%{filter:brightness(1.5) drop-shadow(0 0 30px rgba(249,115,22,0.9))} 100%{filter:brightness(1) drop-shadow(0 0 0 transparent)} }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════
// VFX LAYER — Elemental Particles
// ═══════════════════════════════════════════════════════════════

function VFXLayer({ element, active, onDone }) {
  const vfx = ELEMENT_VFX[element] || ELEMENT_VFX.shadow;
  const particles = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: vfx.count }, (_, i) => ({
      id: i,
      color: vfx.colors[i % vfx.colors.length],
      size: 4 + Math.random() * 6,
      x: (Math.random() - 0.5) * 50,
      y: (Math.random() - 0.5) * 30,
      delay: Math.random() * 0.12,
      borderRadius: vfx.shape === 'square' ? '2px' : vfx.shape === 'wisp' ? '40% 60% 30% 70%' : '50%',
    }));
  }, [active, vfx]);

  useEffect(() => {
    if (active && onDone) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
  }, [active, onDone]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* Impact burst */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full"
        style={{ background: `radial-gradient(circle, ${vfx.impactColor}, transparent)`, animation: 'impactBurst 0.4s ease-out forwards' }} />
      {/* Slash line */}
      <div className="absolute left-1/4 top-1/2 w-1/2 h-0.5 origin-left"
        style={{ background: `linear-gradient(90deg, transparent, ${vfx.colors[0]}, transparent)`, animation: 'slashLine 0.35s ease-out forwards', transform: 'rotate(-15deg)' }} />
      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} className="absolute left-1/2 top-1/2"
          style={{
            width: p.size, height: p.size, backgroundColor: p.color, borderRadius: p.borderRadius,
            marginLeft: p.x, marginTop: p.y,
            animation: `${vfx.animation} 0.5s ${p.delay}s ease-out forwards`,
            opacity: 0, animationFillMode: 'both',
          }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DAMAGE NUMBER
// ═══════════════════════════════════════════════════════════════

function DamageNumber({ value, isCrit, isHeal, element }) {
  if (!value && value !== 0) return null;
  const color = isHeal ? '#22c55e' : isCrit ? '#fbbf24' : '#ffffff';
  const anim = isCrit ? 'dmgFloatCrit 0.9s ease-out forwards' : 'dmgFloatUp 0.8s ease-out forwards';
  const prefix = isHeal ? '+' : '-';
  return (
    <div className="absolute left-1/2 top-1/3 -translate-x-1/2 pointer-events-none z-30 whitespace-nowrap"
      style={{ animation: anim, color, fontWeight: 900, fontSize: isCrit ? '1.5rem' : '1.1rem',
        textShadow: `0 0 8px ${color}80, 0 2px 4px rgba(0,0,0,0.8)` }}>
      {prefix}{value}{isCrit ? ' CRIT!' : ''}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN FLASH
// ═══════════════════════════════════════════════════════════════

function ScreenFlash({ color, active }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50"
      style={{ backgroundColor: color, animation: 'critFlash 0.2s ease-out forwards' }} />
  );
}

// ═══════════════════════════════════════════════════════════════
// WEAPON PROJECTILE — Animated sprite flying from attacker to target
// ═══════════════════════════════════════════════════════════════

const WEAPON_PROJECTILES = {
  shadow_silence: {
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771529868/flecheMurmure_a88leg.png',
    width: 40, height: 40,
    trailColor: 'rgba(168,85,247,0.5)',
    impactColor: 'rgba(168,85,247,0.6)',
    rotation: 20,
    duration: 0.45,
  },
  sulfuras_fury: {
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771531420/braiseSulfuras_i44osa.png',
    width: 38, height: 38,
    trailColor: 'rgba(239,68,68,0.6)',
    impactColor: 'rgba(249,115,22,0.7)',
    rotation: 0,
    duration: 0.5,
    spin: true,
  },
  guldan_halo: {
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771638364/projectileGuldan_ii184b.png',
    width: 36, height: 36,
    trailColor: 'rgba(34,197,94,0.5)',
    impactColor: 'rgba(74,222,128,0.6)',
    rotation: 0,
    duration: 0.5,
    spin: true,
  },
};

function WeaponProjectile({ weaponPassive, active, distance, reversed }) {
  const config = WEAPON_PROJECTILES[weaponPassive];
  if (!config || !active) return null;

  const dir = reversed ? -1 : 1;
  const dist = (distance || 140) * dir;
  const kf = `projFlyArc_${weaponPassive}`;

  return (
    <div className="absolute inset-0 pointer-events-none z-25 overflow-visible">
      <style>{`@keyframes ${kf}{0%{transform:translateX(0) translateY(0) scale(0.7);opacity:0}8%{opacity:1;transform:translateX(${15*dir}px) translateY(-5px) scale(1)}85%{opacity:1;transform:translateX(${dist-20*dir}px) translateY(-8px) scale(1)}100%{opacity:0;transform:translateX(${dist}px) translateY(0) scale(1.2)}}`}</style>
      {/* Projectile sprite */}
      <div className="absolute" style={{
        left: reversed ? 'auto' : '15%',
        right: reversed ? '15%' : 'auto',
        top: '52%',
        animation: `${kf} ${config.duration}s ease-in forwards`,
      }}>
        <img loading="lazy" src={config.sprite} alt=""
          className="pointer-events-none"
          style={{
            width: config.width, height: config.height,
            filter: `drop-shadow(0 0 8px ${config.trailColor})`,
            animation: config.spin
              ? `projectileSpin ${config.duration}s linear forwards`
              : `projectileWobble ${config.duration}s ease-in-out forwards`,
          }} />
      </div>
      {/* Impact flash at target */}
      <div className="absolute" style={{
        left: reversed ? '15%' : 'auto',
        right: reversed ? 'auto' : '15%',
        top: '38%',
        width: 50, height: 50,
        background: `radial-gradient(circle, ${config.impactColor}, transparent)`,
        animation: `projectileImpact ${config.duration + 0.15}s ease-out ${config.duration * 0.7}s forwards`,
        opacity: 0,
      }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HP BAR (shared)
// ═══════════════════════════════════════════════════════════════

function HpBar({ hp, maxHp, height = 'h-2', showText = false }) {
  const pct = Math.max(0, maxHp > 0 ? (hp / maxHp) * 100 : 0);
  const color = pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className={`w-full ${height} bg-gray-800 rounded-full overflow-hidden`}>
      <div className={`h-full ${color} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
      {showText && (
        <div className="text-[8px] text-gray-400 text-center mt-0.5">{hp}/{maxHp}</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BATTLE ARENA — Turn-Based Stage Combat (Animated)
// ═══════════════════════════════════════════════════════════════

export function BattleArena({ battle, phase, dmgPopup, stageEmoji, stageSprite, stageSpriteSize, stageElement, onSkillUse, onFlee, getChibiSprite, getChibiData, weaponPassive }) {
  if (!battle) return null;
  const { player, enemy } = battle;
  const playerData = getChibiData(player.id);
  const playerSprite = getChibiSprite(player.id);
  const [showVFX, setShowVFX] = useState(null); // 'player' | 'enemy'
  const [flashColor, setFlashColor] = useState(null);

  // Trigger VFX on phase changes
  useEffect(() => {
    if (phase === 'player_atk') {
      const t1 = setTimeout(() => setShowVFX('enemy'), 250);
      const t2 = setTimeout(() => {
        if (dmgPopup?.isCrit) setFlashColor('rgba(251,191,36,0.25)');
      }, 300);
      const t3 = setTimeout(() => { setShowVFX(null); setFlashColor(null); }, 800);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
    if (phase === 'enemy_atk') {
      const t1 = setTimeout(() => setShowVFX('player'), 250);
      const t2 = setTimeout(() => setFlashColor('rgba(239,68,68,0.15)'), 300);
      const t3 = setTimeout(() => { setShowVFX(null); setFlashColor(null); }, 800);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [phase, dmgPopup?.isCrit]);

  const playerElement = player.element || 'shadow';
  const enemyElement = stageElement || enemy.element || 'shadow';

  return (
    <div className="max-w-md mx-auto px-3 pt-3">
      <ScreenFlash color={flashColor} active={!!flashColor} />

      {/* Header: Turn + Flee */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-gray-500">Tour {battle.turn}</span>
        <button onClick={onFlee} className="text-[10px] text-gray-600 hover:text-red-400 transition-colors">Fuir</button>
      </div>

      {/* ─── ARENA ─── */}
      <div className="relative rounded-2xl overflow-hidden mb-3"
        style={{ background: 'linear-gradient(to bottom, #0a0a1a 0%, #1a1030 50%, #251540 100%)', minHeight: 220 }}>

        {/* Ground line */}
        <div className="absolute bottom-[30%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

        {/* Weapon projectile — player attacks */}
        {weaponPassive && WEAPON_PROJECTILES[weaponPassive] && (
          <WeaponProjectile weaponPassive={weaponPassive} active={phase === 'player_atk'} distance={160} reversed={false} />
        )}

        {/* Player Side (Left) */}
        <div className="absolute left-[12%] bottom-[30%] flex flex-col items-center" style={{ transform: 'translateY(50%)' }}>
          {/* Buffs */}
          {player.buffs.length > 0 && (
            <div className="flex gap-0.5 mb-1">
              {player.buffs.map((b, i) => (
                <span key={i} className="w-3 h-3 rounded-full text-[6px] flex items-center justify-center"
                  style={{ backgroundColor: b.value > 0 ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {b.turns}
                </span>
              ))}
            </div>
          )}
          {/* Sprite */}
          <div className="relative">
            <img loading="lazy" src={playerSprite} alt={player.name}
              className="w-16 h-16 object-contain"
              style={{
                filter: playerData ? RARITY[playerData.rarity]?.glow : '',
                imageRendering: 'auto',
                animation: phase === 'player_atk' ? 'dashRight 0.6s ease-in-out' :
                  phase === 'enemy_atk' && dmgPopup?.target === 'player' ? 'hitShake 0.4s ease-out' :
                  'idleBreatheFlip 3s ease-in-out infinite',
                transformOrigin: 'center bottom',
              }} />
            {/* Player damage taken */}
            {dmgPopup?.target === 'player' && phase === 'enemy_atk' && (
              <DamageNumber value={dmgPopup.value} isCrit={dmgPopup.isCrit}
                isHeal={false} element={enemyElement} />
            )}
            {/* VFX on player when enemy attacks */}
            <VFXLayer element={enemyElement} active={showVFX === 'player'} onDone={() => {}} />
          </div>
          {/* HP + Mana Bars */}
          <div className="w-20 mt-1">
            <HpBar hp={player.hp} maxHp={player.maxHp} height="h-1.5" />
            {player.maxMana > 0 && (
              <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-0.5">
                <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (player.mana / player.maxMana) * 100)}%` }} />
              </div>
            )}
            <div className="text-[8px] text-center text-gray-400 mt-0.5">{player.name} Lv{player.level}</div>
            {player.maxMana > 0 && <div className="text-[7px] text-center text-violet-400">{player.mana}/{player.maxMana} MP</div>}
          </div>
        </div>

        {/* Enemy Side (Right) */}
        <div className="absolute right-[12%] bottom-[30%] flex flex-col items-center" style={{ transform: 'translateY(50%)' }}>
          {/* Buffs */}
          {enemy.buffs.length > 0 && (
            <div className="flex gap-0.5 mb-1">
              {enemy.buffs.map((b, i) => (
                <span key={i} className="w-3 h-3 rounded-full text-[6px] flex items-center justify-center"
                  style={{ backgroundColor: b.value > 0 ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {b.turns}
                </span>
              ))}
            </div>
          )}
          {/* Enemy sprite/emoji */}
          <div className="relative">
            <div className={`w-16 h-16 flex items-center justify-center rounded-xl border-2 ${enemy.isBoss ? 'border-red-500/60' : 'border-gray-600/40'}`}
              style={{
                background: `radial-gradient(circle, ${(ELEMENT_VFX[enemyElement] || ELEMENT_VFX.shadow).impactColor}, transparent)`,
                animation: phase === 'enemy_atk' ? 'dashLeft 0.6s ease-in-out' :
                  phase === 'player_atk' && dmgPopup?.target === 'enemy' ? 'hitShake 0.4s ease-out' :
                  'idleBreathe 3s ease-in-out infinite',
                boxShadow: enemy.isBoss ? `0 0 20px ${ELEMENT_COLORS_RAW[enemyElement] || '#a855f7'}40` : 'none',
              }}>
              {stageSprite ? (
                <img loading="lazy" src={stageSprite} alt={enemy.name} className={`${stageSpriteSize === 'lg' ? 'w-20 h-20' : 'w-12 h-12'} object-contain`}
                  style={{ filter: enemy.isBoss ? `drop-shadow(0 0 8px ${ELEMENT_COLORS_RAW[enemyElement] || '#a855f7'})` : '' }} />
              ) : (
                <span className="text-3xl" style={{ filter: enemy.isBoss ? `drop-shadow(0 0 8px ${ELEMENT_COLORS_RAW[enemyElement] || '#a855f7'})` : '' }}>
                  {stageEmoji}
                </span>
              )}
            </div>
            {/* Enemy damage taken */}
            {dmgPopup?.target === 'enemy' && phase === 'player_atk' && (
              <DamageNumber value={dmgPopup.value} isCrit={dmgPopup.isCrit}
                isHeal={false} element={playerElement} />
            )}
            {/* VFX on enemy when player attacks */}
            <VFXLayer element={playerElement} active={showVFX === 'enemy'} onDone={() => {}} />
          </div>
          {/* HP Bar */}
          <div className="w-20 mt-1">
            <HpBar hp={enemy.hp} maxHp={enemy.maxHp} height="h-1.5" />
            <div className="text-[8px] text-center text-gray-400 mt-0.5">
              {enemy.name}
              {enemy.isBoss && <span className="text-red-400 ml-1">BOSS</span>}
            </div>
          </div>
        </div>

        {/* VS Center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-700/40 font-black text-2xl select-none">
          VS
        </div>

        {/* Element indicators */}
        <div className="absolute top-2 left-3 text-[10px]">
          <span className={ELEMENTS[playerElement]?.color || 'text-gray-400'}>{ELEMENTS[playerElement]?.icon} {ELEMENTS[playerElement]?.name}</span>
        </div>
        <div className="absolute top-2 right-3 text-[10px]">
          <span className={ELEMENTS[enemyElement]?.color || 'text-gray-400'}>{ELEMENTS[enemyElement]?.icon} {ELEMENTS[enemyElement]?.name}</span>
        </div>
      </div>

      {/* ─── COMBAT LOG (compact) ─── */}
      <div className="bg-gray-900/50 rounded-lg p-2 mb-3 max-h-16 overflow-y-auto border border-gray-800/50">
        {battle.log.length === 0 && <div className="text-[10px] text-gray-600 text-center">Le combat commence...</div>}
        {battle.log.slice(-3).map((entry, i) => (
          <div key={entry.id} className={`text-[10px] leading-relaxed ${
            i === Math.min(2, battle.log.length - 1) ? 'text-white font-medium' :
            entry.type === 'player' ? 'text-green-400/70' : 'text-red-400/70'
          }`}>
            {entry.text}
          </div>
        ))}
      </div>

      {/* ─── Passive Stacks indicator ─── */}
      {battle.passiveState?.flammeStacks > 0 && (
        <div className="flex items-center justify-center gap-1 mb-1">
          <span className="text-[9px] text-amber-400">{'\uD83D\uDD25'} Flamme x{battle.passiveState.flammeStacks}</span>
          {battle.passiveState.echoFreeMana && <span className="text-[9px] text-teal-400">{'\u23F3'} Sort gratuit !</span>}
        </div>
      )}
      {battle.passiveState?.echoFreeMana && !battle.passiveState?.flammeStacks && (
        <div className="flex items-center justify-center gap-1 mb-1">
          <span className="text-[9px] text-teal-400">{'\u23F3'} Prochain sort gratuit !</span>
        </div>
      )}

      {/* ─── SKILLS ─── */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {player.skills.map((skill, i) => {
          const onCd = skill.cd > 0;
          const noMana = (skill.manaCost || 0) > 0 && player.mana < skill.manaCost && !battle.passiveState?.echoFreeMana;
          const blocked = onCd || noMana || phase !== 'idle';
          return (
            <button key={i}
              onClick={() => !blocked && onSkillUse(i)}
              disabled={blocked}
              className={`relative p-2 rounded-lg border text-center transition-all ${
                onCd ? 'border-gray-700/30 bg-gray-800/20 opacity-40' :
                noMana ? 'border-violet-700/30 bg-violet-900/20 opacity-50' :
                phase !== 'idle' ? 'border-gray-700/30 bg-gray-800/20 opacity-60' :
                'border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 active:scale-95'
              }`}>
              <div className="text-[10px] font-bold truncate">{skill.name}</div>
              <div className="text-[8px] text-gray-400 mt-0.5">
                {skill.power > 0 ? `DMG: ${skill.power}%` : ''}
                {skill.buffAtk ? `ATK +${skill.buffAtk}%` : ''}
                {skill.buffDef ? `DEF +${skill.buffDef}%` : ''}
                {skill.healSelf ? `Soin ${skill.healSelf}%` : ''}
                {skill.debuffDef ? `DEF -${skill.debuffDef}%` : ''}
              </div>
              {(skill.manaCost || 0) > 0 && (
                <div className={`text-[7px] mt-0.5 ${noMana ? 'text-red-400' : 'text-violet-400'}`}>
                  {battle.passiveState?.echoFreeMana ? <s>{skill.manaCost}</s> : skill.manaCost} MP
                </div>
              )}
              {onCd && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                  <span className="text-gray-400 text-xs font-bold">{skill.cd}t</span>
                </div>
              )}
              {!onCd && noMana && (
                <div className="absolute inset-0 flex items-center justify-center bg-violet-900/40 rounded-lg">
                  <span className="text-violet-300 text-[9px] font-bold">Mana</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {/* Pass turn button when all skills are blocked */}
      {phase === 'idle' && player.skills.every(sk => sk.cd > 0 || ((sk.manaCost || 0) > 0 && player.mana < sk.manaCost && !battle.passiveState?.echoFreeMana)) && (
        <button
          onClick={() => onSkillUse(-1)}
          className="w-full py-2 mb-2 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 transition-all text-center">
          <div className="text-[10px] font-bold text-amber-400">Passer le tour</div>
          <div className="text-[8px] text-amber-400/60">MP +{player.manaRegen || 5}</div>
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RAID ARENA — Real-Time Raid Combat (Animated)
// ═══════════════════════════════════════════════════════════════

const BAR_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-cyan-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500',
];
const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(Math.floor(n));

// ═══════════════════════════════════════════════════════════════
// ARENA CHIBI SPRITE — positioned on the battlefield
// ═══════════════════════════════════════════════════════════════

const CHIBI_POSITIONS = [
  // Team 1 (left-front column)
  { left: '8%', top: '18%' },
  { left: '5%', top: '42%' },
  { left: '8%', top: '66%' },
  // Team 2 (left-back column)
  { left: '22%', top: '10%' },
  { left: '19%', top: '38%' },
  { left: '22%', top: '62%' },
];

const MEGUMIN_CAST_SPRITE = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771534768/SkillExplosionMegumin_dio1zw.png';

function ArenaChibiSprite({ chibi, pos, isAttacking, isHit, isHealing, dmg, dps, weaponPassive, attackInterval, isCasting }) {
  const hpPct = chibi.maxHp > 0 ? chibi.hp / chibi.maxHp : 0;
  const hpColor = hpPct > 0.5 ? '#22c55e' : hpPct > 0.2 ? '#eab308' : '#ef4444';

  // Dash speed scales with attackInterval: fast chibis dash faster
  // Base: 0.5s dash for 1500ms interval. Clamp between 0.2s and 0.6s
  const dashDur = Math.max(0.2, Math.min(0.6, (attackInterval || 1500) / 3000));
  // Idle breathing speed: fast chibis breathe faster
  const idleDur = Math.max(1.5, Math.min(3, (attackInterval || 1500) / 600));

  const anim = !chibi.alive ? 'arenaKO 0.6s ease-out forwards' :
    isAttacking ? `arenaDashRight ${dashDur}s ease-in-out` :
    isHit ? 'arenaHitChib 0.35s ease-out' :
    `arenaIdleChib ${idleDur}s ease-in-out infinite`;

  return (
    <div className="absolute flex flex-col items-center pointer-events-none" style={{ left: pos.left, top: pos.top, zIndex: isAttacking ? 20 : 10 }}>
      {/* Name tag */}
      <div className="text-[9px] font-bold text-white/80 whitespace-nowrap drop-shadow-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
        {chibi.name}
      </div>
      {/* Live DPS */}
      {dps > 0 && (
        <div className="text-[8px] font-bold text-yellow-400/90 whitespace-nowrap mb-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
          {dps >= 1e9 ? `${(dps / 1e9).toFixed(1)}B` : dps >= 1e6 ? `${(dps / 1e6).toFixed(1)}M` : dps >= 1e3 ? `${(dps / 1e3).toFixed(1)}K` : Math.floor(dps)}/s
        </div>
      )}
      {/* Sprite */}
      <div className="relative">
        <img loading="lazy" src={isCasting ? MEGUMIN_CAST_SPRITE : chibi.sprite} alt={chibi.name}
          className="w-12 h-12 object-contain"
          style={{
            animation: isCasting ? 'meguminCast 2s ease-out forwards' : anim,
            filter: !chibi.alive ? 'grayscale(1) brightness(0.3)' :
              isHealing ? 'brightness(1.4) drop-shadow(0 0 6px rgba(34,197,94,0.7))' :
              chibi.rarity ? (RARITY[chibi.rarity]?.glow || '') : '',
            imageRendering: 'auto',
          }} />
        {/* Heal sparkle */}
        {isHealing && chibi.alive && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-green-400 text-sm font-black"
            style={{ animation: 'dmgFloatUp 0.6s ease-out forwards', textShadow: '0 0 6px rgba(34,197,94,0.8)' }}>
            +
          </div>
        )}
        {/* Floating dmg taken */}
        {dmg && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
            style={{
              color: '#ef4444', fontWeight: 900, fontSize: '0.75rem',
              textShadow: '0 1px 4px rgba(0,0,0,0.9)',
              animation: 'dmgFloatUp 0.6s ease-out forwards',
            }}>
            -{dmg}
          </div>
        )}
        {/* Weapon projectile rendered at arena level — see RaidArena */}
        {/* Ground shadow */}
        {chibi.alive && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-black/30"
            style={{ animation: 'arenaShadow 2.5s ease-in-out infinite', filter: 'blur(2px)' }} />
        )}
      </div>
      {/* HP bar */}
      <div className="w-12 h-1 bg-gray-900/80 rounded-full overflow-hidden mt-0.5">
        <div className="h-full rounded-full transition-all duration-200" style={{ width: `${hpPct * 100}%`, backgroundColor: hpColor }} />
      </div>
      {/* Mana bar */}
      {chibi.maxMana > 0 && chibi.alive && (
        <div className="w-12 h-[2px] bg-gray-900/60 rounded-full overflow-hidden mt-[1px]">
          <div className="h-full rounded-full transition-all duration-200 bg-blue-400" style={{ width: `${Math.max(0, (chibi.mana || 0) / chibi.maxMana * 100)}%` }} />
        </div>
      )}
      {!chibi.alive && <div className="text-[8px] text-red-500 font-bold mt-0.5">K.O.</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RAID ARENA — Visual Battle Arena (Animated)
// ═══════════════════════════════════════════════════════════════

export function RaidArena({ battleState, vfxQueue, timer, isPaused, sungCooldowns, activeSungBuffs, combatLog, onTogglePause, onSungSkill, phase, dpsData, chibiWeapons }) {
  if (!battleState) return null;
  const { chibis, boss: b } = battleState;
  const barPct = b.maxHp > 0 ? (b.hp / b.maxHp * 100) : 0;
  const barColor = BAR_COLORS[b.barsDestroyed % BAR_COLORS.length];
  const timerMin = Math.floor(timer / 60);
  const timerSec = Math.floor(timer % 60);
  const now = Date.now();

  // ─── Refs ───
  const arenaRef = useRef(null);
  const projectilesRef = useRef([]);
  const seenVfxRef = useRef(new Set());

  // Derive VFX state from queue
  const recentVFX = vfxQueue.filter(v => now - v.timestamp < 500);

  // Build per-chibi attack interval map for animation speed
  const chibiIntervalMap = useMemo(() => {
    const map = {};
    chibis.forEach(c => { map[c.id] = c.attackInterval || 1500; });
    return map;
  }, [chibis]);

  const chibiAttacking = useMemo(() => {
    const set = new Set();
    recentVFX.filter(v => v.type === 'chibi_attack' && now - v.timestamp < 400).forEach(v => set.add(v.sourceId));
    return set;
  }, [recentVFX, now]);

  // Megumin EXPLOSION event (persists 1.5s for VFX)
  const meguminExplosion = vfxQueue.find(v => v.type === 'megumin_explosion' && now - v.timestamp < 1500);
  const meguminCasting = vfxQueue.find(v => v.type === 'megumin_explosion' && now - v.timestamp < 2000);

  // Spawn new projectiles from VFX events (each event creates one projectile)
  recentVFX.forEach(v => {
    if (v.type === 'chibi_attack' && !seenVfxRef.current.has(v.id)) {
      seenVfxRef.current.add(v.id);
      const wp = chibiWeapons?.[v.sourceId];
      if (wp && WEAPON_PROJECTILES[wp]) {
        const idx = chibis.findIndex(c => c.id === v.sourceId);
        if (idx >= 0) {
          projectilesRef.current.push({
            key: `${v.id}_${Math.random()}`,
            sourceId: v.sourceId,
            chibiIdx: idx,
            weapon: wp,
            spawnedAt: now,
          });
        }
      }
    }
  });
  // Cleanup old seen VFX IDs (keep last 2s)
  if (seenVfxRef.current.size > 200) {
    const cutoff = now - 2000;
    recentVFX.forEach(v => { if (v.timestamp < cutoff) seenVfxRef.current.delete(v.id); });
  }
  // Remove expired projectiles (lived longer than their flight duration + buffer)
  projectilesRef.current = projectilesRef.current.filter(p => {
    const config = WEAPON_PROJECTILES[p.weapon];
    const pos = CHIBI_POSITIONS[p.chibiIdx] || CHIBI_POSITIONS[0];
    const arenaW = arenaRef.current?.offsetWidth || 700;
    const startPct = parseFloat(pos.left) / 100;
    const dist = Math.round(arenaW * (0.88 - startPct));
    const dur = 0.5 + dist / 900;
    return now - p.spawnedAt < dur * 1000 + 200; // flight duration + 200ms buffer
  });
  const activeProjectiles = projectilesRef.current;
  const chibiHit = useMemo(() => {
    const map = new Map();
    recentVFX.filter(v => v.type === 'boss_attack' && now - v.timestamp < 400).forEach(v => {
      if (v.targetId && v.damage > 0) map.set(v.targetId, v.damage);
    });
    return map;
  }, [recentVFX, now]);
  const bossHit = recentVFX.some(v => v.type === 'chibi_attack' && now - v.timestamp < 300);
  const barBreak = recentVFX.some(v => v.type === 'bar_break' && now - v.timestamp < 800);
  const phaseChange = recentVFX.find(v => v.type === 'phase_change' && now - v.timestamp < 2000);
  const sungActive = recentVFX.find(v => v.type === 'sung_skill' && now - v.timestamp < 800);
  const bossAoe = recentVFX.some(v => v.type === 'boss_aoe' && now - v.timestamp < 400);

  const healEvents = useMemo(() => {
    const set = new Set();
    recentVFX.filter(v => v.type === 'heal' && now - v.timestamp < 500).forEach(v => set.add(v.targetId));
    return set;
  }, [recentVFX, now]);

  // Boss attack animation state
  const bossIsAttacking = recentVFX.some(v => (v.type === 'boss_attack' || v.type === 'boss_aoe') && now - v.timestamp < 400);

  // Floating damage numbers on boss
  const bossDmgNumbers = recentVFX.filter(v => v.type === 'chibi_attack' && v.damage > 0 && now - v.timestamp < 700);

  const bossAnim = !b.hp || b.hp <= 0 ? 'arenaKO 0.6s ease-out forwards' :
    bossIsAttacking ? 'arenaDashLeft 0.5s ease-in-out' :
    bossHit ? 'arenaHitBoss 0.35s ease-out' :
    'arenaIdleBoss 3s ease-in-out infinite';

  // Random arena background (picked once per mount)
  const arenaBgRef = useRef(null);
  if (!arenaBgRef.current) {
    const ARENA_MAPS = [
      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771328568/pvpArena2_hqeqzb.png',
      'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771328568/pvpArena1_wfxqmk.png',
    ];
    arenaBgRef.current = ARENA_MAPS[Math.floor(Math.random() * ARENA_MAPS.length)];
  }

  return (
    <div className="space-y-2 relative">
      {/* Sung skill full-screen glow */}
      {sungActive && (
        <div className="fixed inset-0 pointer-events-none z-40"
          style={{
            background: `radial-gradient(circle at center, ${sungActive.color || 'rgba(168,85,247,0.3)'}, transparent 70%)`,
            animation: 'sungGlow 0.8s ease-out forwards',
          }} />
      )}

      {/* Phase change banner */}
      <AnimatePresence>
        {phaseChange && (
          <div className="fixed inset-x-0 top-1/3 z-50 pointer-events-none flex justify-center">
            <div className="px-8 py-3 bg-gradient-to-r from-red-900/90 via-red-800/90 to-red-900/90 border-y-2 border-red-500/60"
              style={{ animation: 'phaseBanner 2s ease-in-out forwards' }}>
              <div className="text-center">
                <div className="text-red-300 text-xs font-bold uppercase tracking-widest">Phase</div>
                <div className="text-white font-black text-xl">{phaseChange.phaseName}</div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Boss red vignette on attack */}
      {(chibiHit.size > 0 || bossAoe) && (
        <div className="fixed inset-0 pointer-events-none z-30"
          style={{
            background: 'radial-gradient(circle at center, transparent 50%, rgba(239,68,68,0.15) 100%)',
            animation: 'critFlash 0.4s ease-out forwards',
          }} />
      )}

      {/* ─── BOSS HP HEADER ─── */}
      <div className="relative bg-gradient-to-r from-red-900/40 to-amber-900/40 border border-red-500/30 rounded-xl p-2.5 overflow-hidden"
        style={{ animation: bossHit ? 'raidBossHit 0.3s ease-out' : 'none' }}>

        {barBreak && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.8), rgba(239,68,68,0.4), transparent)', animation: 'barBreakExplode 0.8s ease-out forwards' }} />
          </div>
        )}

        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{b.emoji}</span>
            <span className="font-bold text-sm text-red-400">{b.name}</span>
            {b.phase && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">{b.phase.name}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">RC: {b.infiniteBars ? b.barsDestroyed : b.barsDestroyed * (b.rcPerBar || 1)}</span>
            <span className={`text-base font-mono font-bold ${timer < 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {timerMin}:{timerSec.toString().padStart(2, '0')}
            </span>
            <button onClick={onTogglePause} className="text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-white/20">
              {isPaused ? 'Play' : 'Pause'}
            </button>
          </div>
        </div>

        {/* Bar diamonds */}
        <div className="flex gap-1 mb-1 justify-center items-center">
          {b.infiniteBars ? (
            <>
              <span className="text-[10px] text-red-300 font-bold mr-1">{b.barsDestroyed}</span>
              {Array.from({ length: Math.min(10, Math.max(1, 10 - (b.barsDestroyed % 10))) }).map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rotate-45 border transition-all ${BAR_COLORS[(b.barsDestroyed + i) % BAR_COLORS.length]} border-white/30`} />
              ))}
              <span className="text-red-400 text-sm font-bold mx-0.5">{'\u221E'}</span>
            </>
          ) : (
            Array.from({ length: b.totalBars }).map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rotate-45 border transition-all ${
                i < b.barsDestroyed ? 'bg-gray-700 border-gray-600' : `${BAR_COLORS[i % BAR_COLORS.length]} border-white/30`
              }`} />
            ))
          )}
        </div>

        {/* HP bar */}
        <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
          <motion.div className={`h-full ${barColor} rounded-full`}
            animate={{ width: `${barPct}%` }} transition={{ duration: 0.15 }} />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
            {fmt(b.hp)} / {fmt(b.maxHp)} {b.infiniteBars ? `(Barre ${b.barsDestroyed + 1})` : `(Barre ${b.barsDestroyed + 1}/${b.totalBars})`}
          </div>
        </div>
      </div>

      {/* ═══════ VISUAL BATTLE ARENA ═══════ */}
      {/* Fullscreen explosion flash */}
      {meguminExplosion && (
        <div className="fixed inset-0 pointer-events-none z-50"
          style={{ background: 'radial-gradient(circle at 70% 50%, rgba(249,115,22,0.5), rgba(239,68,68,0.3), transparent 70%)', animation: 'explosionFlash 1.5s ease-out forwards' }} />
      )}
      <div ref={arenaRef} className="relative" style={{ height: 280, animation: meguminExplosion ? 'screenShake 0.6s ease-out' : 'none' }}>
      <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10">

        {/* Arena background image */}
        <img loading="lazy" src={arenaBgRef.current} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.6)' }} />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

        {/* ─── CHIBI SPRITES (left side) ─── */}
        {chibis.map((c, idx) => {
          const elapsed = Math.max(1, RAID_DURATION_SEC - timer);
          const totalDmg = dpsData?.[c.id] || 0;
          const dps = totalDmg / elapsed;
          return (
            <ArenaChibiSprite
              key={c.id}
              chibi={c}
              pos={CHIBI_POSITIONS[idx] || CHIBI_POSITIONS[0]}
              isAttacking={chibiAttacking.has(c.id)}
              isHit={chibiHit.has(c.id) || bossAoe}
              isHealing={healEvents.has(c.id)}
              dmg={chibiHit.get(c.id)}
              dps={dps}
              weaponPassive={chibiWeapons?.[c.id] || null}
              attackInterval={chibiIntervalMap[c.id]}
              isCasting={meguminCasting && meguminCasting.sourceId === c.id}
            />
          );
        })}

        {/* ─── BOSS SPRITE (right side) ─── */}
        <div className="absolute flex flex-col items-center" style={{ right: '8%', top: '15%', zIndex: bossIsAttacking ? 20 : 10 }}>
          {/* Boss name */}
          <div className="text-[10px] font-bold text-red-400 mb-1 whitespace-nowrap" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            {b.name} {b.phase?.name !== 'Normal' ? `[${b.phase?.name}]` : ''}
          </div>
          {/* Boss sprite */}
          <div className="relative">
            {b.sprite ? (
              <img loading="lazy" src={b.sprite} alt={b.name}
                className="w-28 h-28 object-contain"
                style={{
                  animation: bossAnim,
                  filter: `drop-shadow(0 0 12px ${ELEMENT_COLORS_RAW[b.element] || '#f59e0b'}60)`,
                  imageRendering: 'auto',
                }} />
            ) : (
              <span className="text-6xl" style={{ animation: bossAnim }}>
                {b.emoji}
              </span>
            )}
            {/* Boss ground shadow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full bg-black/30"
              style={{ animation: 'arenaShadow 3s ease-in-out infinite', filter: 'blur(4px)' }} />

            {/* Floating damage on boss */}
            {bossDmgNumbers.slice(-5).map(v => (
              <div key={v.id} className="absolute whitespace-nowrap pointer-events-none"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${-5 + Math.random() * 20}%`,
                  color: v.isCrit ? '#fbbf24' : ELEMENT_COLORS_RAW[v.element] || '#fff',
                  fontWeight: 900,
                  fontSize: v.isCrit ? '1rem' : '0.8rem',
                  textShadow: '0 1px 5px rgba(0,0,0,0.9)',
                  animation: v.isCrit ? 'dmgFloatCrit 0.7s ease-out forwards' : 'dmgFloatUp 0.6s ease-out forwards',
                }}>
                -{v.damage}{v.isCrit ? '!' : ''}
              </div>
            ))}

            {/* Bar break explosion on boss */}
            {barBreak && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-20 h-20 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.8), rgba(239,68,68,0.4), transparent)', animation: 'barBreakExplode 0.8s ease-out forwards' }} />
              </div>
            )}

            {/* MEGUMIN EXPLOSION on boss */}
            {meguminExplosion && (
              <div className="absolute pointer-events-none flex items-center justify-center" style={{ top: '-60%', left: '-50%', width: '200%', height: '200%', zIndex: 50 }}>
                <img loading="lazy" src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771534341/Explosion_cbnuhl.png" alt="EXPLOSION"
                  style={{ width: 180, height: 180, animation: 'explosionGrow 1.5s ease-out forwards', imageRendering: 'auto' }} />
              </div>
            )}
          </div>
        </div>

        {/* VS indicator */}
        <div className="absolute left-[45%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10 font-black text-3xl select-none pointer-events-none">
          VS
        </div>

        {/* Map overlay text (user will replace with background image) */}
        <div className="absolute bottom-2 right-3 text-[9px] text-gray-600/40 italic select-none pointer-events-none">
          Shadow Colosseum — Raid Zone
        </div>
      </div>{/* end overflow-hidden inner */}

      {/* ─── WEAPON PROJECTILES (persistent, outside overflow-hidden) ─── */}
      {activeProjectiles.map(p => {
        const config = WEAPON_PROJECTILES[p.weapon];
        if (!config) return null;
        const pos = CHIBI_POSITIONS[p.chibiIdx] || CHIBI_POSITIONS[0];
        const arenaW = arenaRef.current?.offsetWidth || 700;
        const startPct = parseFloat(pos.left) / 100;
        const dist = Math.round(arenaW * (0.88 - startPct));
        const dur = 0.5 + dist / 900;
        const kf = `pf_${p.key.replace(/[^a-zA-Z0-9]/g, '')}`;
        return (
          <div key={p.key} className="absolute pointer-events-none" style={{ left: pos.left, top: pos.top, zIndex: 40 }}>
            <style>{`@keyframes ${kf}{0%{transform:translateX(0) translateY(0) scale(0.7);opacity:0}8%{opacity:1;transform:translateX(20px) translateY(-5px) scale(1)}85%{opacity:1;transform:translateX(${dist-25}px) translateY(-10px) scale(1)}100%{opacity:0;transform:translateX(${dist}px) translateY(0) scale(1.2)}}`}</style>
            <div style={{
              animation: `${kf} ${dur}s ease-in forwards`,
              marginLeft: 48,
            }}>
              <img loading="lazy" src={config.sprite} alt=""
                style={{
                  width: config.width, height: config.height,
                  filter: `drop-shadow(0 0 8px ${config.trailColor})`,
                  animation: config.spin
                    ? `projectileSpin ${dur}s linear forwards`
                    : `projectileWobble ${dur}s ease-in-out forwards`,
                }} />
            </div>
          </div>
        );
      })}
      </div>{/* end arenaRef wrapper */}

      {/* ─── TEAM HP SUMMARY (compact bar under arena) ─── */}
      <div className="grid grid-cols-6 gap-1">
        {chibis.map(c => {
          const hpPct = c.maxHp > 0 ? c.hp / c.maxHp : 0;
          return (
            <div key={c.id} className="text-center">
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-200" style={{
                  width: `${hpPct * 100}%`,
                  backgroundColor: !c.alive ? '#374151' : hpPct > 0.5 ? '#22c55e' : hpPct > 0.2 ? '#eab308' : '#ef4444',
                }} />
              </div>
              {c.maxMana > 0 && (
                <div className="h-[2px] bg-gray-800 rounded-full overflow-hidden mt-[1px]">
                  <div className="h-full rounded-full transition-all duration-200 bg-blue-400" style={{ width: `${Math.max(0, (c.mana || 0) / c.maxMana * 100)}%` }} />
                </div>
              )}
              <div className={`text-[8px] mt-0.5 truncate ${!c.alive ? 'text-red-500' : 'text-gray-500'}`}>
                {c.name.split(' ')[0]}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── SUNG JINWOO SKILLS ─── */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/20 rounded-xl p-2.5">
        <div className="text-[10px] text-center text-purple-300 mb-1.5 font-bold">Sung Jinwoo — Skills</div>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {SUNG_SKILLS.map(skill => {
            const cdEnd = sungCooldowns[skill.id] || 0;
            const onCD = cdEnd > now;
            const cdRemain = onCD ? Math.ceil((cdEnd - now) / 1000) : 0;
            const isActive = activeSungBuffs.some(sb => sb.id === skill.id && sb.expiresAt > now);
            const eff = skill.effect;
            const tooltipLines = [skill.desc];
            if (eff.type === 'buff') {
              tooltipLines.push(`${eff.stat?.toUpperCase()} +${eff.value}%`);
              if (eff.stat2) tooltipLines.push(`${eff.stat2?.toUpperCase()} +${eff.value2}%`);
              tooltipLines.push(`Duree : ${skill.durationSec}s`);
            } else if (eff.type === 'debuff') {
              tooltipLines.push(`Boss ${eff.stat?.toUpperCase()} -${eff.value}%`);
              tooltipLines.push(`Duree : ${skill.durationSec}s`);
            } else if (eff.type === 'heal') {
              tooltipLines.push(`Soin : ${eff.value}% PV max`);
            }
            tooltipLines.push(`Cooldown : ${skill.cdSec}s`);

            return (
              <div key={skill.id} className="relative group">
                <button
                  onClick={() => !onCD && phase === 'battle' && onSungSkill(skill.key)}
                  disabled={onCD}
                  className={`relative flex flex-col items-center p-1.5 rounded-lg border transition-all min-w-[52px] ${
                    isActive ? 'border-yellow-400/60 bg-yellow-500/20 scale-105' :
                    onCD ? 'border-gray-600 bg-gray-800/50 opacity-60' :
                    'border-white/20 bg-white/5 hover:border-purple-400/60 hover:bg-purple-500/10'
                  }`}
                  style={isActive ? { animation: 'buffAura 2s ease-in-out infinite' } : {}}>
                  <span className="text-base">{skill.icon}</span>
                  <span className="text-[8px] text-white/80">{skill.name}</span>
                  <span className="text-[7px] text-gray-400">[{skill.key.toUpperCase()}{skill.altKey ? `/${skill.altKey.toUpperCase()}` : ''}]</span>
                  {onCD && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                      <span className="text-xs font-bold text-red-400">{cdRemain}s</span>
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  )}
                </button>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-gray-900/95 border border-purple-500/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 whitespace-nowrap"
                  style={{ minWidth: 160 }}>
                  <div className="text-[10px] font-bold text-white mb-1">{skill.icon} {skill.name}</div>
                  {tooltipLines.map((line, i) => (
                    <div key={i} className={`text-[9px] ${i === 0 ? 'text-gray-300 mb-1' : line.includes('+') ? 'text-green-400' : line.includes('-') ? 'text-red-400' : line.startsWith('Soin') ? 'text-green-400' : 'text-gray-400'}`}>
                      {line}
                    </div>
                  ))}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── COMBAT LOG ─── */}
      <div className="bg-black/40 rounded-xl p-2 border border-white/5 max-h-20 overflow-y-auto text-[10px] font-mono">
        {combatLog.slice(-6).map((entry, i) => (
          <div key={i} className={`py-0.5 ${
            entry.type === 'crit' ? 'text-yellow-400 font-bold' :
            entry.type === 'boss' ? 'text-red-400' :
            entry.type === 'sung' ? 'text-purple-400 font-bold' :
            entry.type === 'heal' ? 'text-green-400' :
            entry.type === 'bar_break' ? 'text-orange-400 font-bold text-xs' :
            entry.type === 'phase' ? 'text-red-300 font-bold text-xs' :
            entry.type === 'system' ? 'text-cyan-400' :
            'text-gray-400'
          }`}>
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
}
