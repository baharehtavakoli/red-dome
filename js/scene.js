/* The Dome Scene — the main screen.
   A fixed-size "world" (config.scene width x height) is scaled to cover the
   screen and moved by a simple camera (translate + scale). Each dome part is
   a positioned box with a ruined layer and a restored layer. */
(function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const cfg = () => GAME_CONFIG;
  const parts = () => GAME_CONFIG.domeParts;

  /* ---------- placeholder art ----------
     Drawn in a 320x290 sketch space; `vb` is the part's area in that space.
     Only used when the PNGs in config.js are missing. */
  const PH = {
    foundation: {
      vb: [30, 206, 260, 44],
      art: `<rect class="f-stone" x="46" y="214" width="228" height="20" rx="2"/>
            <rect class="f-stone2" x="34" y="232" width="252" height="14" rx="2"/>
            <path class="f-line" d="M70 214v20M110 214v20M150 214v20M190 214v20M230 214v20"/>`,
      rubble: [[70, 244, 9], [140, 246, 7], [205, 245, 10], [256, 247, 6]],
    },
    walls: {
      vb: [62, 34, 196, 182],
      art: `<rect class="f-brick" x="72" y="128" width="176" height="86"/>
            <path class="f-brick" d="M92 128C92 72 120 46 160 38C200 46 228 72 228 128Z"/>
            <rect class="f-red" x="66" y="122" width="188" height="8" rx="2"/>`,
      cracks: "M98 140l10 16-5 14 6 18M222 132l-9 18 6 15-4 20M150 60l8 14-4 12",
      rubble: [[86, 212, 12], [116, 214, 8], [212, 213, 11], [238, 210, 8]],
    },
    arch: {
      vb: [118, 130, 84, 86],
      art: `<rect class="f-turq" x="126" y="138" width="68" height="76"/>
            <path class="f-dark" d="M140 214V174C140 158 150 150 160 144C170 150 180 158 180 174V214Z"/>
            <path class="f-gold-s" d="M140 214V174C140 158 150 150 160 144C170 150 180 158 180 174V214"/>
            <rect class="f-gold" x="122" y="134" width="76" height="5"/>`,
      rubble: [[146, 211, 8], [174, 212, 6]],
    },
    fountain: {
      vb: [110, 232, 100, 50],
      art: `<ellipse class="f-turq" cx="160" cy="268" rx="46" ry="11"/>
            <ellipse class="f-water" cx="160" cy="266" rx="37" ry="6"/>
            <path class="f-water" d="M160 265C157 252 155 247 160 238C165 247 163 252 160 265Z"/>
            <circle class="f-water" cx="150" cy="248" r="2"/><circle class="f-water" cx="170" cy="246" r="2"/>`,
      rubble: [[136, 276, 6], [184, 277, 7]],
    },
    garden: {
      vb: [14, 146, 292, 116],
      art: `<path class="f-green" d="M30 248C18 212 24 172 34 150C44 172 50 212 38 248Z"/>
            <path class="f-green" d="M282 248C270 212 276 172 286 150C296 172 302 212 290 248Z"/>
            <circle class="f-green2" cx="64" cy="246" r="12"/><circle class="f-green2" cx="256" cy="246" r="12"/>
            <circle class="f-rose" cx="59" cy="241" r="3.5"/><circle class="f-rose" cx="69" cy="248" r="3.5"/>
            <circle class="f-rose" cx="251" cy="248" r="3.5"/><circle class="f-rose" cx="261" cy="241" r="3.5"/>`,
      rubble: [[44, 254, 6], [72, 256, 5], [250, 256, 5], [278, 254, 6]],
    },
    mosaic: {
      vb: [94, 6, 132, 128],
      art: `<path class="f-gold-s" d="M100 112C104 80 126 58 160 51C194 58 216 80 220 112"/>
            <path class="f-turq-s" d="M110 100C116 78 134 64 160 59C186 64 204 78 210 100"/>
            <path class="f-gold" d="M160 70l6 8-6 8-6-8z M132 94l5 7-5 7-5-7z M188 94l5 7-5 7-5-7z"/>
            <circle class="f-turq" cx="146" cy="84" r="3"/><circle class="f-turq" cx="174" cy="84" r="3"/>
            <path class="f-gold-s" d="M160 38V18"/><circle class="f-gold" cx="160" cy="16" r="5"/>
            <path class="f-gold" d="M160 124l3 5h-6z"/>`,
      rubble: [],
    },
  };

  function rock(x, y, r) {
    return `<path class="rock" d="M${x - r} ${y}L${x - r * 0.55} ${y - r * 0.85}L${x + r * 0.35} ${y - r}L${x + r} ${y - r * 0.2}L${x + r * 0.8} ${y}Z"/>`;
  }

  function placeholder(p, state) {
    const ph = PH[p.id];
    if (!ph) {
      // Unknown part id: simple labelled box.
      return `<svg viewBox="0 0 100 60" class="ph"><rect x="2" y="2" width="96" height="56" rx="8"
        class="${state === "restored" ? "f-gold" : "ghost-box"}"/><text x="50" y="40" text-anchor="middle" font-size="26">${p.emoji || "?"}</text></svg>`;
    }
    const vb = ph.vb.join(" ");
    if (state === "restored") return `<svg viewBox="${vb}" class="ph">${ph.art}</svg>`;
    return `<svg viewBox="${vb}" class="ph"><g class="ghost">${ph.art}</g>` +
      (ph.cracks ? `<path class="crack" d="${ph.cracks}"/>` : "") +
      ph.rubble.map((r) => rock(...r)).join("") + `</svg>`;
  }

  const BG_PLACEHOLDER = `
    <svg viewBox="0 0 360 640" class="bg-ph" preserveAspectRatio="none">
      <defs>
        <linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e59a5e"/><stop offset=".3" stop-color="#f2c48c"/><stop offset=".58" stop-color="#fbe8c4"/>
        </linearGradient>
        <linearGradient id="groundg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#dcc08c"/><stop offset="1" stop-color="#a98152"/>
        </linearGradient>
      </defs>
      <rect width="360" height="640" fill="url(#skyg)"/>
      <circle cx="282" cy="118" r="38" fill="#fff3cf" opacity=".85"/>
      <g fill="#fff8ea" opacity=".55">
        <ellipse cx="70" cy="110" rx="42" ry="9"/><ellipse cx="100" cy="100" rx="26" ry="9"/>
        <ellipse cx="250" cy="190" rx="38" ry="7"/>
      </g>
      <path d="M0 320L48 250L92 292L150 214L206 286L252 236L304 276L360 226V420H0Z" fill="#d59f72" opacity=".55"/>
      <path d="M0 372L40 330L86 348L128 318L232 318L278 342L326 312L360 330V640H0Z" fill="#c6976a"/>
      <path d="M0 392Q180 376 360 392V640H0Z" fill="url(#groundg)"/>
      <path d="M140 640L220 640L194 424L166 424Z" fill="#efdcb6" opacity=".85"/>
      <path d="M150 600H210M156 560H204M161 520H199M164 485H196M167 452H193" stroke="#cdb48a" stroke-width="1.5"/>
      <g fill="#9c8a6e" opacity=".8">
        <ellipse cx="40" cy="470" rx="14" ry="6"/><ellipse cx="318" cy="500" rx="18" ry="7"/>
        <ellipse cx="96" cy="560" rx="10" ry="4"/><ellipse cx="282" cy="590" rx="12" ry="5"/>
      </g>
      <g fill="#6f7f4a" opacity=".55">
        <path d="M18 380C14 362 16 348 20 340C24 348 26 362 22 380Z"/><path d="M340 384C336 366 338 352 342 344C346 352 348 366 344 384Z"/>
      </g>
    </svg>`;

  const DEFS = `
    <svg class="defs" width="0" height="0" aria-hidden="true"><defs>
      <pattern id="bricks" width="16" height="8" patternUnits="userSpaceOnUse">
        <rect width="16" height="8" fill="#b23a2a"/>
        <path d="M0 .4H16M0 4.2H16M4 .4V4.2M12 4.2V8" stroke="#7a1d14" stroke-width=".9" fill="none"/>
      </pattern>
    </defs></svg>`;

  const Scene = {
    el: null,
    world: null,
    partEls: [],
    taskEls: [],
    cam: { mode: "overview", part: -1 },
    busy: false,
    animating: -1,

    init() {
      this.el = document.getElementById("scene-screen");
      this.world = document.getElementById("world");
      const { width, height } = cfg().scene;
      this.world.style.width = width + "px";
      this.world.style.height = height + "px";
      this.world.classList.toggle("staged", !!cfg().scene.stagedArt);
      this.world.classList.toggle("blueprint", cfg().scene.buildStyle === "blueprint");
      this.world.innerHTML = `${DEFS}<div class="bg-layer"></div><div class="parts-layer"></div><div class="residents-layer"></div>
        <div class="wfx-layer"></div><div class="tasks-layer"></div>`;

      const partsLayer = this.world.querySelector(".parts-layer");
      const tasksLayer = this.world.querySelector(".tasks-layer");
      parts().forEach((p, i) => {
        const el = document.createElement("div");
        el.className = "spart";
        el.dataset.part = i;
        Object.assign(el.style, { left: p.box.x + "px", top: p.box.y + "px", width: p.box.w + "px", height: p.box.h + "px", zIndex: (p.layer ?? i) + 1 });
        el.innerHTML = `<div class="layer ruined"></div><div class="layer restored"></div>`;
        partsLayer.appendChild(el);
        this.partEls.push(el);

        const t = document.createElement("button");
        t.className = "task";
        t.dataset.task = i;
        t.style.left = p.button.x + "px";
        t.style.top = p.button.y + "px";
        tasksLayer.appendChild(t);
        this.taskEls.push(t);
      });

      this.world.addEventListener("click", (e) => {
        const t = e.target.closest("[data-task]");
        if (t) return this.restore(+t.dataset.task);
        const r = e.target.closest("[data-res]");
        if (r) return this.bark(+r.dataset.res);
        const p = e.target.closest(".spart.restored");
        if (p) this.replay(+p.dataset.part);
      });
      document.getElementById("merge-btn").addEventListener("click", () => this.openBoard());
      document.getElementById("back-btn").addEventListener("click", () => this.closeBoard());
      window.addEventListener("resize", () => this.applyCamera(false));

      this.buildResidents();
      this.renderArt();
      this.render();
      this.applyCamera(false);
      this.lastBark = Date.now() - (cfg().scene.barkEverySeconds - 3) * 1000; // first line ~3 s in
      setInterval(() => this.autoBark(), 1000);
    },

    /* ---------- characters standing in the scene ---------- */
    residents() { return cfg().scene.residents || []; },

    buildResidents() {
      const layer = this.world.querySelector(".residents-layer");
      const W = cfg().scene.width;
      layer.innerHTML = this.residents().map((r, i) => {
        const w = Math.round(r.h * 0.8), left = Math.round(r.cx - w / 2), top = r.feet - r.h;
        // speech bubble grows toward the middle of the screen
        const side = r.cx < W * 0.36 ? "b-right" : r.cx > W * 0.64 ? "b-left" : "b-center";
        return `<div class="resident ${side}${r.flip ? " flip" : ""}" data-res="${i}" ` +
          `style="left:${left}px;top:${top}px;height:${r.h}px;width:${w}px;z-index:${r.feet}">` +
          `<div class="res-body"></div><div class="bark"><span></span></div></div>`;
      }).join("");
      this.resEls = [...layer.children];
    },

    renderResidents() {
      const done = State.d.dome;
      this.residents().forEach((r, i) => {
        const el = this.resEls[i], c = CHARACTERS[r.who];
        const idx = r.after ? parts().findIndex((p) => p.id === r.after) : -1;
        el.classList.toggle("away", !c || (idx >= 0 && !done[idx]));
        if (!c) return;
        const pose = c.body && Art.has(c.body + (el._pose || "neutral") + ".webp") ? c.body + (el._pose || "neutral") + ".webp"
          : c.body && Art.has(c.body + "neutral.webp") ? c.body + "neutral.webp" : null;
        el.classList.toggle("full", !!pose);
        const src = pose || (Art.has(c.portrait) ? c.portrait : null);
        const html = src
          ? `<img class="res-img" src="${U.esc(src)}" alt="${U.esc(c.name)}" draggable="false"><span class="res-shadow"></span>`
          : `<span class="res-emoji">${c.emoji}</span>`;
        const body = el.querySelector(".res-body");
        if (body._html !== html) { body.innerHTML = html; body._html = html; }
      });
    },

    /* Shideh's live hint about what to build next. */
    hintLine() {
      const n = this.nextIndex();
      if (n < 0) return "The Red Dome is whole again. Thank you!";
      const p = parts()[n], need = p.cost - State.d.stars;
      return need <= 0 ? t("hintReady", { part: p.name }) : t("hintNeed", { part: p.name, n: need });
    },

    bark(i, text) {
      const r = this.residents()[i], el = this.resEls[i];
      if (!r || !el || el.classList.contains("away") || this.busy) return;
      let pose = null;
      if (!text) {
        const lines = (window.BARKS && BARKS[r.who]) || [];
        if (r.who === "shideh" && (Math.random() < 0.6 || !lines.length)) { text = this.hintLine(); pose = "arms_open"; }
        else {
          const line = U.pick(lines.length ? lines : ["…"]);
          text = typeof line === "string" ? line : line.text;
          pose = typeof line === "string" ? null : line.pose;
          const reply = typeof line === "object" && line.reply;
          if (reply) {
            const j = this.residents().findIndex((x) => x.who === reply.who);
            if (j >= 0 && j !== i) setTimeout(() => this.bark(j, reply.text), 2200);
          }
        }
      }
      // switch to a talking pose, back to neutral when the bubble closes
      el._pose = pose || U.pick(["happy", "arms_open", "surprised"]);
      this.renderResidents();
      this.resEls.forEach((x) => x !== el && x.classList.remove("speaking"));
      el.querySelector(".bark span").textContent = text;
      el.classList.remove("speaking");
      void el.offsetWidth;
      el.classList.add("speaking");
      Sfx.play("pop");
      clearTimeout(el._t);
      el._t = setTimeout(() => { el.classList.remove("speaking"); el._pose = "neutral"; this.renderResidents(); }, 4200);
      this.lastBark = Date.now();
    },

    autoBark() {
      if (this.busy || this.boardOpen() || Dialogue.isPlaying() || document.hidden) return;
      if (window.Tutorial && Tutorial.active()) return; // the guide is talking
      if (document.querySelector("#modal-root .modal")) return;
      if (Date.now() - this.lastBark < cfg().scene.barkEverySeconds * 1000) return;
      const here = this.resEls.map((el, i) => (el.classList.contains("away") ? -1 : i)).filter((i) => i >= 0);
      if (!here.length) return;
      // Shideh gives the hint first, then anyone.
      const shideh = this.residents().findIndex((r) => r.who === "shideh");
      const first = !this._barked && here.includes(shideh);
      this._barked = true;
      if (first) this.bark(shideh, this.hintLine());
      else this.bark(U.pick(here));
    },

    /* Art layers; re-run when PNGs finish loading. */
    renderArt() {
      const bg = cfg().scene.background;
      this.world.querySelector(".bg-layer").innerHTML = Art.has(bg)
        ? `<img class="bg-img" src="${U.esc(bg)}" alt="" draggable="false">` : BG_PLACEHOLDER;
      parts().forEach((p, i) => {
        ["ruined", "restored"].forEach((state) => {
          const layer = this.partEls[i].querySelector("." + state);
          layer.innerHTML = Art.has(p[state])
            ? `<img class="part-img" src="${U.esc(p[state])}" alt="" draggable="false">`
            : placeholder(p, state);
        });
      });
      this.renderResidents();
    },

    nextIndex() { return State.d.dome.findIndex((x) => !x); },
    canRestoreNext() {
      const n = this.nextIndex();
      return n >= 0 && State.d.stars >= parts()[n].cost;
    },

    render() {
      if (!this.el) return;
      const done = State.d.dome, next = this.nextIndex(), stars = State.d.stars;
      parts().forEach((p, i) => {
        this.partEls[i].classList.toggle("restored", done[i] && i !== this.animating);
        const t = this.taskEls[i];
        let cls = "task", html = "";
        if (done[i]) cls += " gone";
        else if (i === next) {
          cls += stars >= p.cost ? " ready" : " need";
          html = `<span class="t-ic">${p.icon ? Art.html(p.icon, p.emoji || "🔨", "t-art") : p.emoji || "🔨"}</span><span class="t-cost">⭐${p.cost}</span>`;
        } else {
          cls += " gone"; // only the next part's task is shown, like a to-do list
        }
        if (t.className !== cls) t.className = cls;
        if (t._html !== html) { t.innerHTML = html; t._html = html; }
      });
      this.renderResidents();
      document.getElementById("progress-val").textContent = `${State.partsRestored()}/${parts().length}`;
      const ready = State.d.orders.filter((o) => o && Orders.find(o)).length;
      const badge = document.querySelector("#merge-btn .badge");
      badge.textContent = ready || "";
      badge.classList.toggle("on", ready > 0);
    },

    /* ---------- camera ---------- */
    overviewCam() {
      const { width: W, height: H } = cfg().scene;
      const vw = this.el.clientWidth, vh = this.el.clientHeight;
      const s = Math.max(vw / W, vh / H);
      return { s, tx: (vw - W * s) / 2, ty: (vh - H * s) / 2 };
    },

    focusCam(i) {
      const { width: W, height: H, maxZoom } = cfg().scene;
      const vw = this.el.clientWidth, vh = this.el.clientHeight;
      const base = this.overviewCam().s, box = parts()[i].focus || parts()[i].box;
      const FOCUS_Y = 0.34; // where the part should sit on screen (above portraits + dialogue)
      const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
      let s = Math.min((vw * 0.8) / box.w, (vh * 0.36) / box.h);
      // Low parts would need a big zoom to sit at FOCUS_Y without showing past the world's edge; that zoom
      // filled the screen with plain floor (the terrace build looked like nothing happened), so cap it and let
      // a low part sit lower on screen instead.
      s = Math.max(s, Math.min(base * 1.3, ((1 - FOCUS_Y) * vh) / Math.max(1, H - cy)));
      s = Math.max(base * 1.15, Math.min(base * maxZoom, s));
      let tx = vw / 2 - cx * s, ty = vh * FOCUS_Y - cy * s;
      tx = Math.min(0, Math.max(vw - W * s, tx));
      ty = Math.min(0, Math.max(vh - H * s, ty));
      return { s, tx, ty };
    },

    applyCamera(animate) {
      const c = this.cam.mode === "focus" ? this.focusCam(this.cam.part) : this.overviewCam();
      this.world.style.transition = animate ? "transform .95s cubic-bezier(.65,0,.25,1)" : "none";
      this.world.style.transform = `translate(${c.tx}px, ${c.ty}px) scale(${c.s})`;
    },

    setCamera(mode, part = -1) {
      this.cam = { mode, part };
      this.applyCamera(true);
      return sleep(980);
    },

    /* ---------- restoring ---------- */
    async restore(i) {
      if (this.busy) return;
      const p = parts()[i], next = this.nextIndex();
      if (State.d.dome[i]) return this.replay(i);
      if (i !== next) {
        Sfx.play("error");
        UI.toast(t("buildFirst", { part: parts()[next].name }));
        return;
      }
      if (State.d.stars < p.cost) {
        Sfx.play("error");
        UI.toast(t("needMore", { part: p.name, n: p.cost - State.d.stars }));
        UI.bump(document.getElementById("merge-btn"));
        return;
      }
      State.d.stars -= p.cost;
      State.d.dome[i] = true;
      State.saveNow();

      this.busy = true;
      this.animating = i;
      this.el.classList.add("cinematic");
      UI.updateTop();

      await this.setCamera("focus", i);
      await this.build(i);
      await Dialogue.play(p.story);
      await this.endCinematic();
      if (p.tale) { this.busy = true; await Tale.play(p.tale); this.busy = false; }
      else if (p.mission) { this.busy = true; await Mission.play(p.mission); this.busy = false; }
      const gift = cfg().energy.partReward || 0;
      if (gift) {
        State.addEnergy(gift);
        UI.updateTop();
        const pill = document.querySelector("#scene-screen .energy-pill");
        if (pill) { UI.bump(pill); UI.floatText(pill.getBoundingClientRect(), `+${gift} ⚡`); }
        Sfx.play("energy");
      }
      if (State.partsRestored() === parts().length) { Sfx.play("fanfare"); UI.celebrate(); }
    },

    async build(i) {
      const el = this.partEls[i];
      const blueprint = cfg().scene.buildStyle === "blueprint";
      el.classList.add("shaking");
      Sfx.play("build");
      if (blueprint) this.goldDust(i); else this.dust(i);
      await sleep(800);
      el.classList.remove("shaking");
      this.animating = -1;
      el.classList.add("restored", "reveal");
      UI.sparkle(this.focusRect(i), 20);
      await sleep(blueprint ? 1500 : 1150);
      el.classList.remove("reveal");
    },

    /* Screen rectangle of the part's focus area (for sparkles). */
    focusRect(i) {
      const f = parts()[i].focus || parts()[i].box, w = this.world.getBoundingClientRect();
      const k = w.width / cfg().scene.width;
      return { left: w.left + f.x * k, top: w.top + f.y * k, width: f.w * k, height: f.h * k,
        right: w.left + (f.x + f.w) * k, bottom: w.top + (f.y + f.h) * k };
    },

    /* Golden motes rising from the blueprint while it turns into stone. */
    goldDust(i) {
      const f = parts()[i].focus || parts()[i].box, layer = this.world.querySelector(".wfx-layer");
      for (let k = 0; k < 18; k++) {
        const d = document.createElement("div");
        d.className = "gold-mote";
        d.style.left = f.x + Math.random() * f.w + "px";
        d.style.top = f.y + f.h * (0.3 + Math.random() * 0.7) + "px";
        d.style.animationDelay = Math.random() * 700 + "ms";
        layer.appendChild(d);
        setTimeout(() => d.remove(), 2200);
      }
    },

    dust(i) {
      const box = parts()[i].box, layer = this.world.querySelector(".wfx-layer");
      const n = 14;
      for (let k = 0; k < n; k++) {
        const d = document.createElement("div");
        d.className = "dust";
        const size = 16 + Math.random() * Math.min(40, box.w * 0.35);
        d.style.width = d.style.height = size + "px";
        d.style.left = box.x + Math.random() * box.w - size / 2 + "px";
        d.style.top = box.y + box.h * (0.35 + Math.random() * 0.65) - size / 2 + "px";
        d.style.setProperty("--dx", (Math.random() - 0.5) * 30 + "px");
        d.style.animationDelay = Math.random() * 380 + "ms";
        layer.appendChild(d);
        setTimeout(() => d.remove(), 1500);
      }
    },

    async replay(i) {
      if (this.busy || !State.d.dome[i]) return;
      this.busy = true;
      this.el.classList.add("cinematic");
      await this.setCamera("focus", i);
      await Dialogue.play(parts()[i].story);
      if (parts()[i].tale) await Tale.play(parts()[i].tale, { replay: true });
      await this.endCinematic();
    },

    async playIntro() {
      if (this.busy) return;
      this.busy = true;
      this.el.classList.add("cinematic");
      await Onboard.play();
      this.el.classList.remove("cinematic");
      this.busy = false;
    },

    async endCinematic() {
      await this.setCamera("overview");
      this.el.classList.remove("cinematic");
      this.busy = false;
      this.render();
    },

    /* ---------- board screen ---------- */
    openBoard() {
      if (this.busy) return;
      const app = document.getElementById("app");
      app.classList.add("open");
      setTimeout(() => { if (this.boardOpen()) this.el.classList.add("behind"); }, 450); // after the slide-in
      Sfx.play("whoosh");
      UI.layoutBoard();
      Board.render();
      Orders.render();
    },

    closeBoard() {
      if (this.boardOpen()) Sfx.play("whooshBack");
      document.getElementById("app").classList.remove("open");
      this.el.classList.remove("behind");
      this.render();
    },

    boardOpen() { return document.getElementById("app").classList.contains("open"); },

    /* ---------- debug helpers ---------- */
    restoreNextFree() {
      const n = this.nextIndex();
      if (n < 0) return UI.toast("The dome is already complete");
      State.d.stars += parts()[n].cost;
      if (this.boardOpen()) this.closeBoard();
      setTimeout(() => this.restore(n), 300);
    },

    unrestoreAll() {
      State.d.dome = State.d.dome.map(() => false);
      State.save();
      this.render();
    },
  };

  window.Scene = Scene;
})();
