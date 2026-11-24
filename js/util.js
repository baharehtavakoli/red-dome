/* Small shared helpers + art loading with emoji fallback. */
(function () {
  const U = {
    item(chain, level) {
      const c = window.CHAINS[chain];
      return c ? c.items[level - 1] || null : null;
    },
    maxLevel(chain) {
      return window.CHAINS[chain].items.length;
    },
    key(chain, level) {
      return chain + ":" + level;
    },
    pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    esc(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    },
    /* CSS custom property pointing at a chain's slot frame image (or nothing). */
    slotVar(chain) {
      const f = window.CHAINS[chain] && window.CHAINS[chain].frame;
      // absolute URL: a relative url() inside a custom property resolves against the stylesheet in some browsers
      return f ? `--slot:url('${new URL(f, document.baseURI).href}')` : "";
    },
    fmtTime(sec) {
      sec = Math.max(0, Math.ceil(sec));
      const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
      if (h > 0) return `${h}h ${m}m`;
      return `${m}:${String(s).padStart(2, "0")}`;
    },
    debounce(fn, ms) {
      let t;
      return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
    },
  };

  /* Art: every icon path is probed once. Paths that load render as <img>,
     everything else renders the emoji. Dropping a PNG into assets/ and
     reloading is all it takes to swap in real art. */
  const loaded = new Set();
  const tried = new Set();
  /* Downloads go through a queue, a few at a time, in the order given, so what the player
     sees first (background, intro faces, board items) arrives first on a slow connection. */
  const queue = [];
  let active = 0;
  const PARALLEL = 6;
  function pump() {
    while (active < PARALLEL && queue.length) {
      const { p, onLoad } = queue.shift();
      active++;
      const img = new Image();
      img.decoding = "async";
      const done = (ok) => { active--; if (ok) { loaded.add(p); onLoad && onLoad(p); } pump(); };
      img.onload = () => done(true);
      img.onerror = () => done(false);
      img.src = p;
    }
  }
  const Art = {
    probe(paths, onLoad) {
      if (!window.GAME_CONFIG.tryImages) return;
      paths.forEach((p) => {
        if (!p || tried.has(p)) return;
        tried.add(p);
        queue.push({ p, onLoad });
      });
      pump();
    },
    html(icon, emoji, cls) {
      cls = cls ? " " + cls : "";
      if (icon && loaded.has(icon)) return `<img class="art${cls}" src="${U.esc(icon)}" alt="" draggable="false">`;
      return `<span class="emoji${cls}">${emoji || "❔"}</span>`;
    },
    /* Every art path, most urgent first. */
    allPaths() {
      const G = window.GAME_CONFIG, C = window.CHARACTERS, out = [];
      const intro = (window.STORY && STORY.intro && STORY.intro.cast) || [];
      const done = (window.State && State.d && State.d.dome) || [];
      const next = G.domeParts.findIndex((p, i) => !done[i]);
      // 1. what the first screen shows (the intro's sky pictures first, for new players)
      const firstTime = !(window.State && State.d && State.d.seenIntro);
      if (firstTime && G.scene.intro) Object.values(G.scene.intro).forEach((p) => out.push(p));
      out.push(G.scene.background);
      intro.forEach((w) => C[w] && out.push(C[w].portrait));
      (G.scene.residents || []).forEach((r) => C[r.who] && C[r.who].body && out.push(C[r.who].body + "neutral.webp"));
      // 2. parts already built, and the next one
      G.domeParts.forEach((p, i) => { if (done[i] || i === next) out.push(p.restored); if (p.icon) out.push(p.icon); });
      // 3. the merge board
      out.push(G.talisman.icon);
      Object.values(window.CHAINS).forEach((c) => {
        out.push(c.generator.icon);
        c.items.forEach((it) => out.push(it.icon));
      });
      Object.values(C).forEach((c) => out.push(c.avatar));
      // 4. the rest: other portraits, talking poses, later parts
      Object.values(C).forEach((c) => out.push(c.portrait));
      Object.values(C).forEach((c) => {
        if (c.body) (window.POSES || []).forEach((p) => out.push(c.body + p + ".webp"));
      });
      G.domeParts.forEach((p) => out.push(p.restored, p.ruined));
      if (G.scene.intro) Object.values(G.scene.intro).forEach((p) => out.push(p)); // for "Replay intro"
      if (G.taleBook) out.push(G.taleBook);
      Object.values(G.tales || {}).forEach((tl) => tl.pages.forEach((p) => out.push(p.img, p.fallback)));
      return out;
    },
    has(path) {
      return !!path && loaded.has(path);
    },
  };

  window.U = U;
  window.Art = Art;
})();
