// ═══════════════════════════════════════════════════════════════
// IGRIS VS BERU — Le Combat Legendaire
// Event rare sur Shadow Colosseum : Igris apparait et defie Beru.
// Beru gagne TOUJOURS. 5 phases, 330+ lignes de dialogue,
// projectiles, chaos, divs qui cassent, victoire epique.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import shadowCoinManager from '../ChibiSystem/ShadowCoinManager';
import {
  CONFRONTATION, PROJECTILE_BERU, PROJECTILE_IGRIS,
  DODGE_BERU, DODGE_IGRIS, CHAOS_BERU, CHAOS_IGRIS,
  VICTORY_BERU, DEFEAT_IGRIS, randomFrom, pickUnique,
} from './IgrisVsBeruDialogues';
import './IgrisVsBeru.css';

// ─── Sprites ─────────────────────────────────────────────────

const IGRIS_SPRITE = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570362/igris_face_xj5mqo.png';
const IGRIS_LEFT = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570544/igris_left_cw3w5g.png';
const IGRIS_RIGHT = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754570506/igris_right_jmyupb.png';
const BERU_SPRITE = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png';

const PROJECTILE_EMOJIS = ['⚔️', '🔥', '⚡', '💀', '🗡️', '🐜', '👊', '💥'];
const IMPACT_EMOJIS = ['💥', '✨', '🔥', '⚡'];

// ─── Helpers ─────────────────────────────────────────────────

const isMobile = () => window.innerWidth < 768;
const vw = (pct) => window.innerWidth * pct / 100;
const vh = (pct) => window.innerHeight * pct / 100;

// ═══════════════════════════════════════════════════════════════

export default function IgrisVsBeru() {
  const location = useLocation();
  const isColosseum = location.pathname.startsWith('/shadow-colosseum');

  // ─── Fight state ────────────────────────────────────────────
  const [phase, setPhase] = useState(null);
  // null | 'entrance' | 'confrontation' | 'projectiles' | 'chaos' | 'victory' | 'reward'

  const [beruPos, setBeruPos] = useState({ x: 0, y: 0 });
  const [igrisPos, setIgrisPos] = useState({ x: 0, y: 0 });
  const [beruFacing, setBeruFacing] = useState(1); // 1 = right, -1 = left
  const [igrisFacing, setIgrisFacing] = useState(-1);
  const [beruAnim, setBeruAnim] = useState('fightIdle 1.5s ease-in-out infinite');
  const [igrisAnim, setIgrisAnim] = useState('fightIdle 1.5s ease-in-out infinite');
  const [igrisSrc, setIgrisSrc] = useState(IGRIS_LEFT);

  const [beruBubble, setBeruBubble] = useState(null);
  const [igrisBubble, setIgrisBubble] = useState(null);
  const [projectiles, setProjectiles] = useState([]);
  const [impacts, setImpacts] = useState([]);
  const [cracks, setCracks] = useState([]);
  const [showVignette, setShowVignette] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [shakeClass, setShakeClass] = useState('');
  const [coinReward, setCoinReward] = useState(false);
  const [igrisFallen, setIgrisFallen] = useState(false);
  const [victoryGlow, setVictoryGlow] = useState(false);

  const fightTriggeredRef = useRef(false);
  const usedDialoguesRef = useRef(new Set());
  const timersRef = useRef([]);
  const chaosFrameRef = useRef(null);
  const tiltedElsRef = useRef([]);
  const projectileIdRef = useRef(0);

  // ─── Timer helpers ──────────────────────────────────────────

  const delay = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (chaosFrameRef.current) cancelAnimationFrame(chaosFrameRef.current);
  }, []);

  // ─── Bubble helpers ─────────────────────────────────────────

  const showBeruBubble = useCallback((msg, duration = 2500) => {
    setBeruBubble(msg);
    delay(() => setBeruBubble(null), duration);
  }, [delay]);

  const showIgrisBubble = useCallback((msg, duration = 2500) => {
    setIgrisBubble(msg);
    delay(() => setIgrisBubble(null), duration);
  }, [delay]);

  // ─── Projectile system ─────────────────────────────────────

  const launchProjectile = useCallback((from, to, emoji, sender) => {
    const id = ++projectileIdRef.current;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    setProjectiles(prev => [...prev, { id, emoji, x: from.x, y: from.y, dx, dy, sender }]);
    delay(() => {
      setProjectiles(prev => prev.filter(p => p.id !== id));
      // Impact
      const impactId = id + 10000;
      setImpacts(prev => [...prev, { id: impactId, x: to.x, y: to.y, emoji: randomFrom(IMPACT_EMOJIS) }]);
      delay(() => setImpacts(prev => prev.filter(i => i.id !== impactId)), 600);
    }, 800);
  }, [delay]);

  // ─── Crack system ──────────────────────────────────────────

  const spawnCrack = useCallback((x, y) => {
    const id = Date.now() + Math.random();
    setCracks(prev => [...prev, { id, x, y, rotation: -30 + Math.random() * 60 }]);
  }, []);

  // ─── Break page divs ──────────────────────────────────────

  const breakPageElements = useCallback(() => {
    const containers = document.querySelectorAll('[class*="rounded"], [class*="card"], [class*="section"]');
    const visible = Array.from(containers).filter(el => {
      const r = el.getBoundingClientRect();
      return r.top > 50 && r.bottom < window.innerHeight - 50 && r.width > 100;
    });
    const chosen = visible.sort(() => Math.random() - 0.5).slice(0, Math.min(4, visible.length));
    chosen.forEach((el, i) => {
      delay(() => {
        const tilt = -3 + Math.random() * 6;
        const shift = -2 + Math.random() * 4;
        el.style.transition = 'transform 0.4s ease-out, filter 0.4s';
        el.style.transform = `rotate(${tilt}deg) translateY(${shift}px)`;
        el.style.filter = 'brightness(0.8) contrast(1.1)';
        tiltedElsRef.current.push(el);
        const r = el.getBoundingClientRect();
        spawnCrack(r.left + r.width / 2, r.top + r.height / 2);
      }, i * 1200);
    });
  }, [delay, spawnCrack]);

  const repairPageElements = useCallback(() => {
    tiltedElsRef.current.forEach(el => {
      el.style.transition = 'transform 0.8s ease-out, filter 0.8s';
      el.style.transform = '';
      el.style.filter = '';
    });
    tiltedElsRef.current = [];
    // Fade out cracks
    delay(() => setCracks([]), 1000);
  }, [delay]);

  // ─── Notify Beru mascot ────────────────────────────────────

  const notifyBeru = useCallback((type, message) => {
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { type, message, mood: 'excited' }
    }));
  }, []);

  // ═══════════════════════════════════════════════════════════
  // FIGHT ORCHESTRATION
  // ═══════════════════════════════════════════════════════════

  const startFight = useCallback(() => {
    // Hide real Beru mascot
    notifyBeru('igris-fight-start', '');

    // Initial positions
    const beruX = isMobile() ? vw(15) : vw(20);
    const igrisX = window.innerWidth + 80;
    const centerY = vh(45);
    setBeruPos({ x: beruX, y: centerY });
    setIgrisPos({ x: igrisX, y: centerY });
    setBeruFacing(1);
    setIgrisFacing(-1);
    setIgrisSrc(IGRIS_LEFT);
    setIgrisFallen(false);
    setVictoryGlow(false);

    setPhase('entrance');
  }, [notifyBeru]);

  // ─── Phase: Entrance (~5s) ─────────────────────────────────

  useEffect(() => {
    if (phase !== 'entrance') return;
    setShowVignette(true);

    // Igris slides in
    const targetX = isMobile() ? vw(70) : vw(75);
    let startTime = null;
    const animateEntrance = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / 6000, 1);
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const x = (window.innerWidth + 80) + (targetX - (window.innerWidth + 80)) * ease;
      setIgrisPos(prev => ({ ...prev, x }));
      if (progress < 1) requestAnimationFrame(animateEntrance);
    };
    requestAnimationFrame(animateEntrance);

    // Beru reacts
    delay(() => showBeruBubble("KIIIEK ?! C'est... IGRIS ?!", 7500), 3000);
    delay(() => showIgrisBubble("Beru. On a un compte a regler.", 7500), 6000);

    delay(() => setPhase('confrontation'), 15000);
  }, [phase, delay, showBeruBubble, showIgrisBubble]);

  // ─── Phase: Confrontation (~12s, 6 exchanges) ─────────────

  useEffect(() => {
    if (phase !== 'confrontation') return;

    const exchanges = 6;
    for (let i = 0; i < exchanges; i++) {
      delay(() => {
        const pair = pickUnique(CONFRONTATION, usedDialoguesRef.current, 'confront');
        showBeruBubble(pair.beru, 6000);
        delay(() => showIgrisBubble(pair.igris, 6000), 3600);
      }, i * 9000);
    }

    delay(() => setPhase('projectiles'), exchanges * 9000 + 3000);
  }, [phase, delay, showBeruBubble, showIgrisBubble]);

  // ─── Phase: Projectiles (~15s) ─────────────────────────────

  useEffect(() => {
    if (phase !== 'projectiles') return;

    // Position apart
    const beruX = isMobile() ? vw(12) : vw(18);
    const igrisX = isMobile() ? vw(75) : vw(78);
    const centerY = vh(45);
    setBeruPos({ x: beruX, y: centerY });
    setIgrisPos({ x: igrisX, y: centerY });

    const interval = isMobile() ? 5400 : 3900;
    const count = isMobile() ? 8 : 12;

    for (let i = 0; i < count; i++) {
      delay(() => {
        const beruAttacks = i % 2 === 0;
        const dodges = Math.random() < 0.25;

        if (beruAttacks) {
          const emoji = randomFrom(PROJECTILE_EMOJIS);
          const bx = isMobile() ? vw(12) : vw(18);
          const ix = isMobile() ? vw(75) : vw(78);
          launchProjectile({ x: bx + 30, y: centerY }, { x: ix, y: centerY }, emoji, 'beru');
          showBeruBubble(pickUnique(PROJECTILE_BERU, usedDialoguesRef.current, 'proj_b'), 4500);

          if (dodges) {
            delay(() => {
              setIgrisAnim('dodgeUp 0.5s ease-out');
              delay(() => setIgrisAnim('fightIdle 1.5s ease-in-out infinite'), 1500);
              showIgrisBubble(pickUnique(DODGE_IGRIS, usedDialoguesRef.current, 'dodge_i'), 4500);
            }, 1200);
          } else {
            delay(() => {
              setIgrisAnim('hitShake 0.4s ease-out');
              delay(() => setIgrisAnim('fightIdle 1.5s ease-in-out infinite'), 1200);
            }, 2100);
          }
        } else {
          const emoji = randomFrom(['⚔️', '🗡️', '🔥', '⚡']);
          const bx = isMobile() ? vw(12) : vw(18);
          const ix = isMobile() ? vw(75) : vw(78);
          launchProjectile({ x: ix, y: centerY }, { x: bx + 30, y: centerY }, emoji, 'igris');
          showIgrisBubble(pickUnique(PROJECTILE_IGRIS, usedDialoguesRef.current, 'proj_i'), 4500);

          if (dodges) {
            delay(() => {
              setBeruAnim('dodgeDown 0.5s ease-out');
              delay(() => setBeruAnim('fightIdle 1.5s ease-in-out infinite'), 1500);
              showBeruBubble(pickUnique(DODGE_BERU, usedDialoguesRef.current, 'dodge_b'), 4500);
            }, 1200);
          } else {
            delay(() => {
              setBeruAnim('hitShake 0.4s ease-out');
              delay(() => setBeruAnim('fightIdle 1.5s ease-in-out infinite'), 1200);
            }, 2100);
          }
        }
      }, i * interval);
    }

    delay(() => setPhase('chaos'), count * interval + 4500);
  }, [phase, delay, launchProjectile, showBeruBubble, showIgrisBubble]);

  // ─── Phase: Chaos (~15s) ───────────────────────────────────

  useEffect(() => {
    if (phase !== 'chaos') return;

    // Screen shake
    setShakeClass('fightScreenShake 0.12s linear infinite');
    delay(() => setShakeClass('fightScreenShakeViolent 0.08s linear infinite'), 15000);

    // Break page elements
    delay(() => breakPageElements(), 4500);

    // Chase animation — characters zigzag across screen
    let elapsed = 0;
    let chaserIsBeru = true;
    let swapTimer = 0;
    const chaosStart = performance.now();
    const duration = 42000;

    const chaseStep = (time) => {
      elapsed = time - chaosStart;
      if (elapsed >= duration) {
        setShakeClass('');
        return;
      }

      swapTimer += 16;
      if (swapTimer > 10500) {
        chaserIsBeru = !chaserIsBeru;
        swapTimer = 0;
      }

      const t = elapsed / duration;
      // Figure-8 / zigzag path
      const cx = vw(50);
      const cy = vh(45);
      const rx = isMobile() ? vw(30) : vw(35);
      const ry = vh(15);
      const angle = t * Math.PI * 4; // 2 full loops

      if (chaserIsBeru) {
        const bx = cx + Math.cos(angle) * rx;
        const by = cy + Math.sin(angle * 2) * ry;
        const ix = cx + Math.cos(angle + Math.PI * 0.6) * rx;
        const iy = cy + Math.sin((angle + Math.PI * 0.6) * 2) * ry;
        setBeruPos({ x: bx, y: by });
        setIgrisPos({ x: ix, y: iy });
        setBeruFacing(ix > bx ? 1 : -1);
        setIgrisFacing(bx > ix ? 1 : -1);
        setIgrisSrc(bx > ix ? IGRIS_RIGHT : IGRIS_LEFT);
      } else {
        const ix = cx + Math.cos(angle) * rx;
        const iy = cy + Math.sin(angle * 2) * ry;
        const bx = cx + Math.cos(angle + Math.PI * 0.6) * rx;
        const by = cy + Math.sin((angle + Math.PI * 0.6) * 2) * ry;
        setBeruPos({ x: bx, y: by });
        setIgrisPos({ x: ix, y: iy });
        setBeruFacing(ix > bx ? 1 : -1);
        setIgrisFacing(bx > ix ? 1 : -1);
        setIgrisSrc(bx > ix ? IGRIS_RIGHT : IGRIS_LEFT);
      }

      chaosFrameRef.current = requestAnimationFrame(chaseStep);
    };
    chaosFrameRef.current = requestAnimationFrame(chaseStep);

    // Chaos dialogue
    const chaosLines = isMobile() ? 5 : 8;
    for (let i = 0; i < chaosLines; i++) {
      delay(() => {
        if (Math.random() < 0.5) {
          showBeruBubble(pickUnique(CHAOS_BERU, usedDialoguesRef.current, 'chaos_b'), 6000);
        } else {
          showIgrisBubble(pickUnique(CHAOS_IGRIS, usedDialoguesRef.current, 'chaos_i'), 6000);
        }
      }, 3000 + i * 5400);
    }

    delay(() => {
      if (chaosFrameRef.current) cancelAnimationFrame(chaosFrameRef.current);
      setShakeClass('');
      setPhase('victory');
    }, duration);
  }, [phase, delay, breakPageElements, showBeruBubble, showIgrisBubble]);

  // ─── Phase: Victory (~12s) ─────────────────────────────────

  useEffect(() => {
    if (phase !== 'victory') return;

    // Position for final blow
    const beruX = isMobile() ? vw(30) : vw(35);
    const igrisX = isMobile() ? vw(65) : vw(65);
    const centerY = vh(45);
    setBeruPos({ x: beruX, y: centerY });
    setIgrisPos({ x: igrisX, y: centerY });
    setBeruFacing(1);
    setIgrisFacing(-1);
    setIgrisSrc(IGRIS_LEFT);

    // Beru charges
    delay(() => showBeruBubble("ATTAQUE FINALE ! KIIIIIEEEEK !!!", 7500), 1500);

    // Mega projectile burst
    delay(() => {
      for (let i = 0; i < 6; i++) {
        delay(() => {
          launchProjectile(
            { x: beruX + 30, y: centerY + (Math.random() - 0.5) * 40 },
            { x: igrisX, y: centerY + (Math.random() - 0.5) * 40 },
            randomFrom(['💥', '🐜', '⚡', '🔥']),
            'beru'
          );
        }, i * 360);
      }
    }, 6000);

    // White flash
    delay(() => setShowFlash(true), 8400);
    delay(() => setShowFlash(false), 9600);

    // Igris falls
    delay(() => {
      setIgrisFallen(true);
      setIgrisAnim('igrisFall 1.5s ease-in forwards');
      showIgrisBubble(pickUnique(DEFEAT_IGRIS, usedDialoguesRef.current, 'defeat'), 9000);
    }, 9900);

    // Beru victory pose
    delay(() => {
      setVictoryGlow(true);
      setBeruAnim('victoryGlow 1.5s ease-in-out infinite');
      showBeruBubble(pickUnique(VICTORY_BERU, usedDialoguesRef.current, 'victory'), 10500);
    }, 12000);

    // Second victory line
    delay(() => {
      showBeruBubble(pickUnique(VICTORY_BERU, usedDialoguesRef.current, 'victory'), 9000);
    }, 21000);

    // Coin reward
    delay(() => {
      setCoinReward(true);
      try { shadowCoinManager.addCoins(1000, 'igris_vs_beru'); } catch (e) {}
    }, 25500);

    // Cleanup and end
    delay(() => {
      repairPageElements();
      setShowVignette(false);
      setCoinReward(false);
      setVictoryGlow(false);

      // Restore Beru mascot
      notifyBeru('igris-fight-end', 'VICTOIRE ! Le soldat N1 reste INVAINCU !');

      // Analytics
      try { if (window.umami) window.umami.track('igris-vs-beru-fight'); } catch (e) {}

      delay(() => setPhase(null), 1500);
    }, 33000);

  }, [phase, delay, launchProjectile, showBeruBubble, showIgrisBubble, repairPageElements, notifyBeru]);

  // ═══════════════════════════════════════════════════════════
  // TRIGGER SYSTEM
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    if (!isColosseum) return;
    if (fightTriggeredRef.current) return;
    if (sessionStorage.getItem('igris_vs_beru_done') === 'true') return;

    const checkInterval = 60000 + Math.random() * 60000;
    const timer = setInterval(() => {
      if (fightTriggeredRef.current) return;
      if (Math.random() < 0.04) {
        fightTriggeredRef.current = true;
        sessionStorage.setItem('igris_vs_beru_done', 'true');
        startFight();
      }
    }, checkInterval);

    return () => clearInterval(timer);
  }, [isColosseum, startFight]);

  // ─── Cleanup on unmount ────────────────────────────────────

  useEffect(() => {
    return () => {
      clearAllTimers();
      repairPageElements();
      if (phase) {
        notifyBeru('igris-fight-end', '');
      }
    };
  }, []);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  if (!phase) return null;

  const spriteSize = isMobile() ? 56 : 72;

  return createPortal(
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 99998,
        animation: shakeClass || undefined,
      }}
    >
      {/* Vignette overlay */}
      {showVignette && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
            animation: 'vignetteAppear 1s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* White flash */}
      {showFlash && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'white',
            animation: 'whiteFlash 0.4s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ─── BERU ──────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          left: beruPos.x - spriteSize / 2,
          top: beruPos.y - spriteSize / 2,
          width: spriteSize,
          height: spriteSize,
          transition: phase === 'chaos' ? 'none' : 'left 0.8s ease-out, top 0.8s ease-out',
        }}
      >
        {/* Bubble */}
        {beruBubble && (
          <div
            style={{
              position: 'absolute',
              bottom: spriteSize + 8,
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: isMobile() ? 180 : 250,
              background: 'rgba(17, 7, 40, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: 14,
              padding: '8px 14px',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)',
              color: 'white',
              fontSize: isMobile() ? 11 : 13,
              fontWeight: 600,
              lineHeight: 1.4,
              textAlign: 'center',
              whiteSpace: 'normal',
              animation: 'bubblePop 0.3s ease-out',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            <span style={{ color: '#a855f7', fontWeight: 800, fontSize: isMobile() ? 10 : 11 }}>BERU</span>
            <br />
            {beruBubble}
            <div style={{
              position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
              width: 10, height: 10, background: 'rgba(17, 7, 40, 0.95)', borderRight: '1px solid rgba(168, 85, 247, 0.5)', borderBottom: '1px solid rgba(168, 85, 247, 0.5)',
            }} />
          </div>
        )}

        {/* Sprite */}
        <img
          src={BERU_SPRITE}
          alt="Beru"
          style={{
            width: spriteSize,
            height: spriteSize,
            transform: `scaleX(${beruFacing})`,
            animation: beruAnim,
            filter: victoryGlow
              ? 'drop-shadow(0 0 20px rgba(255, 200, 0, 0.8)) drop-shadow(0 0 40px rgba(255, 150, 0, 0.4))'
              : 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))',
            imageRendering: 'pixelated',
            transition: 'filter 0.5s',
          }}
          draggable={false}
        />

        {/* Name tag */}
        <div style={{
          textAlign: 'center', color: '#a855f7', fontSize: 10, fontWeight: 800,
          textShadow: '0 0 6px rgba(168, 85, 247, 0.6)', marginTop: 2,
        }}>
          BERU
        </div>
      </div>

      {/* ─── IGRIS ─────────────────────────────────────────── */}
      {!igrisFallen || phase === 'victory' ? (
        <div
          style={{
            position: 'absolute',
            left: igrisPos.x - spriteSize / 2,
            top: igrisPos.y - spriteSize / 2,
            width: spriteSize,
            height: spriteSize,
            transition: phase === 'chaos' ? 'none' : 'left 0.8s ease-out, top 0.8s ease-out',
          }}
        >
          {/* Bubble */}
          {igrisBubble && (
            <div
              style={{
                position: 'absolute',
                bottom: spriteSize + 8,
                left: '50%',
                transform: 'translateX(-50%)',
                maxWidth: isMobile() ? 180 : 250,
                background: 'rgba(40, 7, 7, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: 14,
                padding: '8px 14px',
                border: '1px solid rgba(152, 8, 8, 0.5)',
                boxShadow: '0 4px 20px rgba(152, 8, 8, 0.2)',
                color: 'white',
                fontSize: isMobile() ? 11 : 13,
                fontWeight: 600,
                lineHeight: 1.4,
                textAlign: 'center',
                whiteSpace: 'normal',
                animation: 'bubblePop 0.3s ease-out',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            >
              <span style={{ color: '#dc2626', fontWeight: 800, fontSize: isMobile() ? 10 : 11 }}>IGRIS</span>
              <br />
              {igrisBubble}
              <div style={{
                position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                width: 10, height: 10, background: 'rgba(40, 7, 7, 0.95)', borderRight: '1px solid rgba(152, 8, 8, 0.5)', borderBottom: '1px solid rgba(152, 8, 8, 0.5)',
              }} />
            </div>
          )}

          {/* Sprite */}
          <img
            src={igrisSrc}
            alt="Igris"
            style={{
              width: spriteSize,
              height: spriteSize,
              animation: igrisAnim,
              filter: 'drop-shadow(0 0 8px rgba(152, 8, 8, 0.5))',
              imageRendering: 'pixelated',
            }}
            draggable={false}
          />

          {/* Name tag */}
          <div style={{
            textAlign: 'center', color: '#dc2626', fontSize: 10, fontWeight: 800,
            textShadow: '0 0 6px rgba(152, 8, 8, 0.6)', marginTop: 2,
          }}>
            IGRIS
          </div>
        </div>
      ) : null}

      {/* ─── PROJECTILES ───────────────────────────────────── */}
      {projectiles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            fontSize: isMobile() ? 20 : 28,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            animation: 'projectileFly 0.8s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 3,
            willChange: 'transform',
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* ─── IMPACTS ───────────────────────────────────────── */}
      {impacts.map(imp => (
        <div
          key={imp.id}
          style={{
            position: 'absolute',
            left: imp.x,
            top: imp.y,
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          {/* Center burst */}
          <div style={{
            position: 'absolute',
            width: 40, height: 40,
            left: -20, top: -20,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,200,0,0.6) 0%, transparent 70%)',
            animation: 'impactBurst 0.6s ease-out forwards',
          }} />
          {/* Scattered particles */}
          {Array.from({ length: 4 }, (_, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                fontSize: isMobile() ? 14 : 18,
                '--px': `${(Math.random() - 0.5) * 80}px`,
                '--py': `${(Math.random() - 0.5) * 80}px`,
                animation: 'impactParticle 0.8s ease-out forwards',
              }}
            >
              {randomFrom(IMPACT_EMOJIS)}
            </span>
          ))}
        </div>
      ))}

      {/* ─── CRACKS ────────────────────────────────────────── */}
      {cracks.map(crack => (
        <svg
          key={crack.id}
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={{
            position: 'fixed',
            left: crack.x - 60,
            top: crack.y - 60,
            pointerEvents: 'none',
            zIndex: 99997,
            '--crack-rot': `${crack.rotation}deg`,
            animation: 'crackAppear 0.5s ease-out forwards',
            opacity: 0.7,
          }}
        >
          <path
            d="M60,10 L55,40 L25,55 L48,58 L30,90 L58,68 L85,100 L65,62 L95,48 L68,54 L75,20 Z"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M40,25 L52,45 M70,30 L62,50 M35,70 L50,65 M75,75 L63,67"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      ))}

      {/* ─── COIN REWARD ───────────────────────────────────── */}
      {coinReward && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '40%',
            transform: 'translateX(-50%)',
            animation: 'coinRewardFloat 2.5s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 5,
            textAlign: 'center',
          }}
        >
          <div style={{
            fontSize: isMobile() ? 20 : 28,
            fontWeight: 900,
            color: '#fbbf24',
            textShadow: '0 0 20px rgba(251, 191, 36, 0.6), 0 2px 4px rgba(0,0,0,0.8)',
            whiteSpace: 'nowrap',
          }}>
            +1000 Shadow Coins! 🪙
          </div>
          <div style={{
            fontSize: isMobile() ? 11 : 14,
            color: 'rgba(255,255,255,0.8)',
            marginTop: 4,
          }}>
            Recompense du combat legendaire
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
