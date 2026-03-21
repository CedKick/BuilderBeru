// ── AudioManager ─────────────────────────────────────────
// Lightweight audio system for game-feel SFX.
// Supports procedural sounds (Web Audio API synthesis) AND
// file-based sounds (preload URL → AudioBuffer).
//
// Usage:
//   AudioManager.play('auto_impact', 0.6);
//   AudioManager.preload('custom_sfx', '/sfx/custom.mp3');
//   AudioManager.play('custom_sfx', 0.8);

const AudioManager = (() => {
  const cache = {};       // id → AudioBuffer (file-based)
  const synths = {};      // id → generator function (procedural)
  const sources = {};     // id → currently playing source (for loops/stop)
  let ctx = null;         // AudioContext (lazy init on first interaction)
  let masterGain = null;
  let sfxGain = null;
  let masterVol = 0.8;
  let sfxVol = 1.0;
  let muted = false;
  let initialized = false;

  function init() {
    if (initialized) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      sfxGain = ctx.createGain();
      sfxGain.connect(masterGain);
      masterGain.connect(ctx.destination);
      masterGain.gain.value = masterVol;
      sfxGain.gain.value = sfxVol;
      initialized = true;
    } catch (e) {
      console.warn('[AudioManager] Web Audio API unavailable:', e);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (!masterGain) return;
    muted = document.hidden;
    masterGain.gain.value = muted ? 0 : masterVol;
  });

  // ── Procedural sound generators ──────────────────────────
  // Each returns { nodes: [...], duration } or { nodes: [...], loop: true }
  // nodes are already connected to output; caller just needs to start them.

  function makeGain(vol, dest) {
    const g = ctx.createGain();
    g.gain.value = vol;
    g.connect(dest || sfxGain);
    return g;
  }

  function noiseBuffer(duration) {
    const len = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function registerSynths() {
    // ── auto_charge: rising frequency 80→400Hz, 0.15s ──
    synths['auto_charge'] = (vol) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.15);
      const g = makeGain(0);
      g.gain.setValueAtTime(vol * 0.3, t);
      g.gain.linearRampToValueAtTime(vol * 0.6, t + 0.1);
      g.gain.linearRampToValueAtTime(0, t + 0.15);
      osc.connect(g);
      osc.start(t);
      osc.stop(t + 0.16);
      return { duration: 0.16 };
    };

    // ── auto_impact: white noise + decay + sine 200→50Hz ──
    synths['auto_impact'] = (vol) => {
      const t = ctx.currentTime;
      // Noise burst
      const nSrc = ctx.createBufferSource();
      nSrc.buffer = noiseBuffer(0.12);
      const nGain = makeGain(0);
      nGain.gain.setValueAtTime(vol * 0.5, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      nSrc.connect(nGain);
      nSrc.start(t);
      // Sine thud
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
      const oGain = makeGain(0);
      oGain.gain.setValueAtTime(vol * 0.7, t);
      oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(oGain);
      osc.start(t);
      osc.stop(t + 0.13);
      return { duration: 0.13 };
    };

    // ── pattern_telegraph: slow rising 100→300Hz, 0.8s, quiet ──
    synths['pattern_telegraph'] = (vol) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.8);
      const g = makeGain(0);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol * 0.25, t + 0.6);
      g.gain.linearRampToValueAtTime(vol * 0.35, t + 0.75);
      g.gain.linearRampToValueAtTime(0, t + 0.8);
      osc.connect(g);
      osc.start(t);
      osc.stop(t + 0.82);
      return { duration: 0.82 };
    };

    // ── pattern_impact_wave: filtered noise 0.3s + bass 80Hz decay ──
    synths['pattern_impact_wave'] = (vol) => {
      const t = ctx.currentTime;
      // Filtered noise whoosh
      const nSrc = ctx.createBufferSource();
      nSrc.buffer = noiseBuffer(0.35);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(2000, t);
      bp.frequency.exponentialRampToValueAtTime(200, t + 0.3);
      bp.Q.value = 2;
      const nGain = makeGain(0);
      nGain.gain.setValueAtTime(vol * 0.5, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      nSrc.connect(bp);
      bp.connect(nGain);
      nSrc.start(t);
      // Bass thud
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
      const oGain = makeGain(0);
      oGain.gain.setValueAtTime(vol * 0.6, t);
      oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(oGain);
      osc.start(t);
      osc.stop(t + 0.36);
      return { duration: 0.36 };
    };

    // ── pattern_impact_donut: sine 150→60Hz + harmonic, 0.4s ──
    synths['pattern_impact_donut'] = (vol) => {
      const t = ctx.currentTime;
      // Fundamental
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(150, t);
      osc1.frequency.exponentialRampToValueAtTime(60, t + 0.4);
      const g1 = makeGain(0);
      g1.gain.setValueAtTime(vol * 0.6, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc1.connect(g1);
      osc1.start(t);
      osc1.stop(t + 0.42);
      // 3rd harmonic
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(450, t);
      osc2.frequency.exponentialRampToValueAtTime(180, t + 0.35);
      const g2 = makeGain(0);
      g2.gain.setValueAtTime(vol * 0.2, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc2.connect(g2);
      osc2.start(t);
      osc2.stop(t + 0.37);
      return { duration: 0.42 };
    };

    // ── pattern_impact_laser: high-pass noise crackle, loopable ──
    synths['pattern_impact_laser'] = (vol) => {
      const t = ctx.currentTime;
      const nSrc = ctx.createBufferSource();
      nSrc.buffer = noiseBuffer(2.0);
      nSrc.loop = true;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 3000;
      hp.Q.value = 3;
      // Crackle LFO modulating gain
      const lfo = ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 15 + Math.random() * 10;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = vol * 0.15;
      lfo.connect(lfoGain);
      const g = makeGain(vol * 0.2);
      lfoGain.connect(g.gain);
      nSrc.connect(hp);
      hp.connect(g);
      nSrc.start(t);
      lfo.start(t);
      sources['pattern_impact_laser'] = { source: nSrc, gain: g, extra: [lfo] };
      return { loop: true };
    };

    // ── pattern_impact_zone: low drone 60Hz, very quiet, loopable ──
    synths['pattern_impact_zone'] = (vol) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 60;
      // Subtle wobble
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 2;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      const g = makeGain(vol * 0.12);
      osc.connect(g);
      osc.start(t);
      lfo.start(t);
      sources['pattern_impact_zone'] = { source: osc, gain: g, extra: [lfo] };
      return { loop: true };
    };

    // ── pattern_impact_generic: noise + sine 0.2s ──
    synths['pattern_impact_generic'] = (vol) => {
      const t = ctx.currentTime;
      const nSrc = ctx.createBufferSource();
      nSrc.buffer = noiseBuffer(0.2);
      const nGain = makeGain(0);
      nGain.gain.setValueAtTime(vol * 0.35, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      nSrc.connect(nGain);
      nSrc.start(t);
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);
      const oGain = makeGain(0);
      oGain.gain.setValueAtTime(vol * 0.5, t);
      oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(oGain);
      osc.start(t);
      osc.stop(t + 0.22);
      return { duration: 0.22 };
    };
  }

  // ── Public API ──────────────────────────────────────────
  return {
    // Preload a sound from URL (overrides procedural synth for that id)
    async preload(id, url) {
      if (cache[id]) return;
      try {
        init();
        if (!ctx) return;
        const resp = await fetch(url);
        const buf = await resp.arrayBuffer();
        cache[id] = await ctx.decodeAudioData(buf);
      } catch (e) {
        console.warn(`[AudioManager] Failed to preload "${id}":`, e.message);
      }
    },

    // Play a sound — file-based if preloaded, else procedural synth
    play(id, volume = 1.0, loop = false) {
      init();
      if (!ctx || muted) return null;

      // File-based sound takes priority
      if (cache[id]) {
        const source = ctx.createBufferSource();
        source.buffer = cache[id];
        source.loop = loop;
        const gain = ctx.createGain();
        gain.gain.value = volume;
        source.connect(gain);
        gain.connect(sfxGain);
        source.start(0);
        if (loop) sources[id] = { source, gain };
        source.onended = () => { if (sources[id]?.source === source) delete sources[id]; };
        return source;
      }

      // Procedural synth fallback
      if (synths[id]) {
        return synths[id](volume);
      }

      return null;
    },

    // Stop a looping sound
    stop(id) {
      if (sources[id]) {
        try { sources[id].source.stop(); } catch {}
        if (sources[id].extra) sources[id].extra.forEach(n => { try { n.stop(); } catch {} });
        delete sources[id];
      }
    },

    setMasterVolume(v) { masterVol = v; if (masterGain && !muted) masterGain.gain.value = v; },
    setSfxVolume(v) { sfxVol = v; if (sfxGain) sfxGain.gain.value = v; },
    has(id) { return !!(cache[id] || synths[id]); },

    init() {
      init();
      if (ctx && !Object.keys(synths).length) registerSynths();
    },
  };
})();
