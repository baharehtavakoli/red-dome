/* Sound effects, all made in code with the Web Audio API (no audio files, no licences).
   Melodic sounds use a plucked-string tone (close to a santur) on a Persian scale
   (Homayoun on D: D Eb F# G A Bb C), so merges climb the scale as items level up.

   Sfx.play("merge", level) etc. Turned on/off in Settings; remembered per device.
   Browsers only allow sound after the first tap, so the audio starts on the first pointerdown. */
(function () {
  const KEY = "reddome_audio_v1";
  const SCALE = [0, 1, 4, 5, 7, 8, 10]; // semitones above D
  const BASE = 293.66;                  // D4
  const note = (step, oct = 0) => {
    const o = Math.floor(step / 7) + oct, s = ((step % 7) + 7) % 7;
    return BASE * Math.pow(2, o + SCALE[s] / 12);
  };

  let ctx = null, master = null, verb = null;
  const pluckCache = new Map();
  let noiseBuf = null;

  const prefs = (() => {
    try { return Object.assign({ sfx: true, volume: 0.8 }, JSON.parse(localStorage.getItem(KEY) || "{}")); }
    catch (e) { return { sfx: true, volume: 0.8 }; }
  })();
  const savePrefs = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {} };

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = prefs.volume;
    // gentle compression so stacked sounds never clip
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    // small room reverb from decaying noise
    verb = ctx.createConvolver();
    const len = ctx.sampleRate * 1.6, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    verb.buffer = ir;
    const wet = ctx.createGain(); wet.gain.value = 0.22;
    verb.connect(wet).connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    return ctx;
  }

  /* Karplus-Strong plucked string, rendered once per pitch and cached. */
  function pluckBuffer(freq, bright = 0.5) {
    const k = Math.round(freq) + ":" + bright;
    if (pluckCache.has(k)) return pluckCache.get(k);
    const sr = ctx.sampleRate, dur = 1.6, n = Math.floor(sr * dur);
    const buf = ctx.createBuffer(1, n, sr), out = buf.getChannelData(0);
    const period = Math.max(2, Math.round(sr / freq));
    const line = new Float32Array(period);
    for (let i = 0; i < period; i++) line[i] = Math.random() * 2 - 1;
    const damp = 0.996 - (1 - bright) * 0.006;
    let p = 0, prev = 0;
    for (let i = 0; i < n; i++) {
      const cur = line[p];
      const next = line[(p + 1) % period];
      line[p] = damp * (bright * cur + (1 - bright) * 0.5 * (cur + next));
      out[i] = cur * 0.6 + prev * 0.4;
      prev = cur;
      p = (p + 1) % period;
    }
    pluckCache.set(k, buf);
    return buf;
  }

  function out(gain, t, { reverb = 0.5 } = {}) {
    const g = ctx.createGain();
    g.gain.value = gain;
    g.connect(master);
    if (reverb > 0) { const s = ctx.createGain(); s.gain.value = reverb; g.connect(s).connect(verb); }
    return g;
  }

  function pluck(freq, t, gain = 0.5, { bright = 0.55, reverb = 0.6, detune = true } = {}) {
    const dest = out(gain, t, { reverb });
    // two slightly detuned strings, like the paired strings of a santur
    [0, detune ? 4 : null].forEach((cents) => {
      if (cents === null) return;
      const s = ctx.createBufferSource();
      s.buffer = pluckBuffer(freq, bright);
      s.detune.value = cents;
      const env = ctx.createGain();
      env.gain.setValueAtTime(cents ? 0.6 : 1, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      s.connect(env).connect(dest);
      s.start(t);
      s.stop(t + 1.6);
    });
  }

  function tone(freq, t, dur, gain, { type = "sine", to = null, attack = 0.005, reverb = 0.3 } = {}) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(env).connect(out(1, t, { reverb }));
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function noise(t, dur, gain, { type = "bandpass", f = 1200, to = null, q = 1, attack = 0.005, reverb = 0.2 } = {}) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    const flt = ctx.createBiquadFilter();
    flt.type = type; flt.Q.value = q;
    flt.frequency.setValueAtTime(f, t);
    if (to) flt.frequency.exponentialRampToValueAtTime(to, t + dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(flt).connect(env).connect(out(1, t, { reverb }));
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.05);
  }

  const sparkle = (t, n = 4, from = 14, gain = 0.07) => {
    for (let i = 0; i < n; i++) tone(note(from + i * 2), t + i * 0.045, 0.35, gain, { type: "sine", reverb: 0.8 });
  };

  /* ---------- the sounds ---------- */
  const SOUNDS = {
    click(t) { noise(t, 0.05, 0.25, { f: 2400, q: 3, reverb: 0 }); tone(880, t, 0.05, 0.05, { type: "triangle", reverb: 0 }); },
    select(t) { tone(660, t, 0.07, 0.07, { type: "triangle", to: 760, reverb: 0.1 }); },
    lift(t) { tone(380, t, 0.12, 0.08, { type: "sine", to: 620, reverb: 0.1 }); },
    place(t) { noise(t, 0.09, 0.3, { type: "lowpass", f: 700, reverb: 0.05 }); tone(150, t, 0.1, 0.12, { to: 90, reverb: 0 }); },
    error(t) {
      tone(180, t, 0.12, 0.16, { type: "triangle", to: 140, reverb: 0 });
      tone(150, t + 0.13, 0.16, 0.16, { type: "triangle", to: 110, reverb: 0 });
    },
    produce(t) {
      tone(240, t, 0.12, 0.14, { type: "sine", to: 520, reverb: 0.1 }); // pop
      noise(t, 0.06, 0.18, { f: 3000, q: 2, reverb: 0 });
      pluck(note(4, 0), t + 0.07, 0.35);
    },
    merge(t, level = 1) {
      const top = Math.min(level, 8);
      noise(t, 0.08, 0.2, { type: "lowpass", f: 900, reverb: 0 });
      // rising pair of plucks, higher for higher levels
      pluck(note(top + 1), t + 0.01, 0.4);
      pluck(note(top + 3), t + 0.08, 0.4);
      if (level >= 4) pluck(note(top + 5), t + 0.15, 0.32);
      sparkle(t + 0.12, level >= 5 ? 5 : 3, 12 + top);
    },
    maxed(t) { [0, 2, 4, 7].forEach((s, i) => pluck(note(s + 7), t + i * 0.07, 0.35)); sparkle(t + 0.3, 6, 16); },
    shatter(t, n = 1) {
      noise(t, 0.45, 0.4, { type: "highpass", f: 2500, reverb: 0.5 });
      noise(t, 0.25, 0.3, { f: 600, to: 200, q: 0.8, reverb: 0.2 });
      for (let i = 0; i < 5 + n * 2; i++) tone(2000 + Math.random() * 3000, t + Math.random() * 0.25, 0.18, 0.035, { reverb: 0.6 });
    },
    charm(t) {
      tone(220, t, 1.2, 0.08, { type: "sawtooth", to: 880, attack: 0.2, reverb: 0.7 });
      [0, 2, 4, 6, 7, 9].forEach((s, i) => pluck(note(s + 7), t + 0.1 + i * 0.06, 0.28));
    },
    deliver(t) {
      [0, 2, 4, 7].forEach((s, i) => pluck(note(s + 7), t + i * 0.08, 0.38, { bright: 0.7 }));
      tone(note(14), t + 0.32, 0.8, 0.07, { type: "sine", reverb: 0.8 });
    },
    stars(t) { sparkle(t, 6, 14, 0.06); },
    arrive(t) { pluck(note(9), t, 0.22, { bright: 0.75 }); pluck(note(11), t + 0.06, 0.18, { bright: 0.75 }); },
    whoosh(t) { noise(t, 0.35, 0.22, { f: 400, to: 2400, q: 0.7, attack: 0.12, reverb: 0.2 }); },
    whooshBack(t) { noise(t, 0.35, 0.22, { f: 2400, to: 400, q: 0.7, attack: 0.12, reverb: 0.2 }); },
    open(t) { noise(t, 0.18, 0.12, { f: 1600, to: 900, q: 0.6, attack: 0.03, reverb: 0.2 }); pluck(note(7), t + 0.03, 0.18); },
    pop(t) { tone(500, t, 0.09, 0.12, { type: "sine", to: 900, reverb: 0.15 }); },
    blip(t, pitch = 0) { tone(note(pitch + 7) * (0.98 + Math.random() * 0.04), t, 0.045, 0.035, { type: "triangle", reverb: 0 }); },
    next(t) { tone(note(9), t, 0.08, 0.06, { type: "triangle", reverb: 0.1 }); },
    build(t) {
      // stone rumble while the part shakes, then the chime as it appears
      noise(t, 0.9, 0.35, { type: "lowpass", f: 260, attack: 0.15, reverb: 0.3 });
      for (let i = 0; i < 7; i++) noise(t + 0.08 + i * 0.1, 0.07, 0.25, { type: "bandpass", f: 500 + Math.random() * 600, q: 2, reverb: 0.1 });
      [0, 2, 4, 5, 7, 9, 11].forEach((s, i) => pluck(note(s + 7), t + 0.82 + i * 0.055, 0.32));
      tone(note(0, 1), t + 0.82, 1.6, 0.06, { type: "sine", attack: 0.05, reverb: 0.9 });
      sparkle(t + 1.1, 7, 14, 0.06);
    },
    fanfare(t) {
      const seq = [0, 4, 7, 9, 11, 14];
      seq.forEach((s, i) => pluck(note(s + 7), t + i * 0.11, 0.42, { bright: 0.7 }));
      [0, 4, 7].forEach((s) => pluck(note(s + 14), t + 0.75, 0.3));
      sparkle(t + 0.8, 8, 16, 0.06);
    },
    knock(t) { noise(t, 0.08, 0.35, { type: "lowpass", f: 320, reverb: 0.05 }); tone(120, t, 0.1, 0.14, { to: 70, reverb: 0 }); },
    drum(t, heat = 1) {
      // heat 1 = far (a faint thud), 2 = near, 3 = right next to the door (a deep, ringing boom)
      tone(95, t + 0.12, 0.25 + heat * 0.15, 0.03 + heat * 0.06, { to: 55, reverb: 0.2 + heat * 0.2 });
      noise(t + 0.12, 0.12 + heat * 0.05, 0.08 + heat * 0.08, { type: "lowpass", f: 180 + heat * 60, reverb: 0.3 });
    },
    energy(t) { tone(300, t, 0.4, 0.1, { type: "square", to: 1200, reverb: 0.3 }); sparkle(t + 0.25, 4, 16); },
  };

  // don't machine-gun the same sound
  const last = {};
  const MIN_GAP = { blip: 0.05, click: 0.04, select: 0.04, place: 0.04, pop: 0.08 };

  const Sfx = {
    play(name, arg) {
      if (!prefs.sfx || !ctx || ctx.state !== "running" || document.hidden) return;
      const fn = SOUNDS[name];
      if (!fn) return;
      const t = ctx.currentTime + 0.01;
      if (last[name] && t - last[name] < (MIN_GAP[name] || 0.025)) return;
      last[name] = t;
      try { fn(t, arg); } catch (e) { /* never let sound break the game */ }
    },
    get enabled() { return prefs.sfx; },
    set enabled(v) { prefs.sfx = !!v; savePrefs(); if (v) this.unlock(); },
    unlock() {
      if (!init()) return;
      if (ctx.state === "suspended") ctx.resume();
    },
  };

  // Audio may only start after a user gesture.
  const unlock = () => Sfx.unlock();
  ["pointerdown", "touchstart", "keydown"].forEach((ev) => window.addEventListener(ev, unlock, { passive: true, capture: true }));
  // A soft click on every button (specific sounds play on top of it).
  document.addEventListener("click", (e) => { if (e.target.closest("button")) Sfx.play("click"); }, true);
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (prefs.sfx) ctx.resume();
  });

  Sfx._sounds = SOUNDS; // for the debug panel / testing
  window.Sfx = Sfx;
})();
