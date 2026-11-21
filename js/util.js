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
  const Art = {
    probe(paths, onLoad) {
      if (!window.GAME_CONFIG.tryImages) return;
      paths.forEach((p) => {
        if (!p || tried.has(p)) return;
        tried.add(p);
        const img = new Image();
        img.onload = () => { loaded.add(p); onLoad && onLoad(); };
        img.src = p;
      });
    },
    html(icon, emoji, cls) {
      cls = cls ? " " + cls : "";
      if (icon && loaded.has(icon)) return `<img class="art${cls}" src="${U.esc(icon)}" alt="" draggable="false">`;
      return `<span class="emoji${cls}">${emoji || "❔"}</span>`;
    },
    allPaths() {
      const out = [window.GAME_CONFIG.talisman.icon];
      Object.values(window.CHAINS).forEach((c) => {
        out.push(c.generator.icon);
        c.items.forEach((it) => out.push(it.icon));
      });
      Object.values(window.CHARACTERS).forEach((c) => {
        out.push(c.portrait, c.avatar);
        if (c.body) (window.POSES || []).forEach((p) => out.push(c.body + p + ".png"));
      });
      out.push(window.GAME_CONFIG.scene.background);
      window.GAME_CONFIG.domeParts.forEach((p) => out.push(p.ruined, p.restored));
      return out;
    },
    has(path) {
      return !!path && loaded.has(path);
    },
  };

  window.U = U;
  window.Art = Art;
})();
