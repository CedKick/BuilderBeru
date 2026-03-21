// ── AudioManager ─────────────────────────────────────────
// Lightweight audio system for game-feel SFX.
// Usage:
//   audio.preload('auto_impact', '/sfx/auto_impact.mp3');
//   audio.play('auto_impact', 0.6);
//
// Supports: volume master/sfx, tab visibility muting, caching.

const AudioManager = (() => {
  const cache = {};       // id → AudioBuffer
  const sources = {};     // id → currently playing source (for loops/stop)
  let ctx = null;         // AudioContext (lazy init on first interaction)
  let masterGain = null;
  let sfxGain = null;
  let masterVol = 0.8;
  let sfxVol = 1.0;
  let muted = false;
  let initialized = false;

  // Lazy init AudioContext (must be triggered by user gesture)
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

  // Page Visibility: mute when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (!masterGain) return;
    muted = document.hidden;
    masterGain.gain.value = muted ? 0 : masterVol;
  });

  return {
    // Preload a sound from URL
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

    // Play a sound (returns source node for stop/loop control)
    play(id, volume = 1.0, loop = false) {
      init();
      if (!ctx || !cache[id] || muted) return null;
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
    },

    // Stop a looping sound
    stop(id) {
      if (sources[id]) {
        try { sources[id].source.stop(); } catch {}
        delete sources[id];
      }
    },

    // Volume controls
    setMasterVolume(v) { masterVol = v; if (masterGain && !muted) masterGain.gain.value = v; },
    setSfxVolume(v) { sfxVol = v; if (sfxGain) sfxGain.gain.value = v; },

    // Check if a sound is loaded
    has(id) { return !!cache[id]; },

    // Init (call on first user click/touch)
    init,
  };
})();

// Sound IDs — URLs to be configured when assets are ready
// AudioManager.preload('auto_charge', '/sfx/auto_charge.mp3');
// AudioManager.preload('auto_impact', '/sfx/auto_impact.mp3');
// AudioManager.preload('pattern_telegraph', '/sfx/pattern_telegraph.mp3');
// AudioManager.preload('pattern_impact_wave', '/sfx/pattern_impact_wave.mp3');
// AudioManager.preload('pattern_impact_donut', '/sfx/pattern_impact_donut.mp3');
// AudioManager.preload('pattern_impact_laser', '/sfx/pattern_impact_laser.mp3');
// AudioManager.preload('pattern_impact_zone', '/sfx/pattern_impact_zone.mp3');
// AudioManager.preload('pattern_impact_generic', '/sfx/pattern_impact_generic.mp3');
