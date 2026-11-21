/* The merge board: rendering, drag & drop, merging, generators, talismans. */
(function () {
  const DRAG_THRESHOLD = 8;

  const Board = {
    el: null,
    cellEls: [],
    selected: -1,
    drag: null,
    ghost: null,
    hoverIdx: -1,

    get cells() { return State.d.board; },
    get cols() { return GAME_CONFIG.cols; },
    get rows() { return GAME_CONFIG.rows; },

    init(el) {
      this.el = el;
      el.innerHTML = "";
      el.style.gridTemplateColumns = `repeat(${this.cols}, var(--cell))`;
      this.cellEls = [];
      for (let i = 0; i < this.cols * this.rows; i++) {
        const d = document.createElement("div");
        d.dataset.i = i;
        el.appendChild(d);
        this.cellEls.push(d);
      }
      el.addEventListener("pointerdown", (e) => this.onDown(e));
      el.addEventListener("pointermove", (e) => this.onMove(e));
      el.addEventListener("pointerup", (e) => this.onUp(e));
      el.addEventListener("pointercancel", () => this.onCancel());
      el.addEventListener("contextmenu", (e) => e.preventDefault());
    },

    /* ---------- geometry ---------- */
    rc(i) { return [Math.floor(i / this.cols), i % this.cols]; },
    idx(r, c) { return r < 0 || c < 0 || r >= this.rows || c >= this.cols ? -1 : r * this.cols + c; },
    neighbors(i, diagonal) {
      const [r, c] = this.rc(i), out = [];
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          if (!diagonal && dr && dc) continue;
          const n = this.idx(r + dr, c + dc);
          if (n >= 0) out.push(n);
        }
      return out;
    },
    cellAt(x, y) {
      const first = this.cellEls[0].getBoundingClientRect();
      const stepX = this.cols > 1 ? this.cellEls[1].getBoundingClientRect().left - first.left : first.width;
      const stepY = this.rows > 1 ? this.cellEls[this.cols].getBoundingClientRect().top - first.top : first.height;
      const c = Math.floor((x - first.left) / stepX);
      const r = Math.floor((y - first.top) / stepY);
      return this.idx(r, c);
    },
    rect(i) { return this.cellEls[i].getBoundingClientRect(); },

    /* ---------- rendering ---------- */
    render() {
      const wanted = Orders.wantedKeys();
      // items identical to the selected one glow, so it's obvious what to merge
      const sel = this.cells[this.selected];
      this._matchKey = sel && sel.t === "item" && sel.level < U.maxLevel(sel.chain) ? U.key(sel.chain, sel.level) : null;
      for (let i = 0; i < this.cellEls.length; i++) this.renderCell(i, wanted);
    },

    pieceHtml(cell, wanted) {
      if (!cell) return "";
      if (cell.t === "tal") {
        const t = GAME_CONFIG.talisman;
        return `<div class="talisman">${Art.html(t.icon, t.emoji)}</div>`;
      }
      const ch = CHAINS[cell.chain];
      if (cell.t === "gen") {
        const g = ch.generator;
        return `<div class="piece gen" style="--c:${ch.color}">${Art.html(g.icon, g.emoji)}<span class="bolt">⚡</span></div>`;
      }
      const def = ch.items[cell.level - 1];
      const isMax = cell.level === ch.items.length;
      const want = wanted && wanted.has(U.key(cell.chain, cell.level));
      const special = def.special ? " special" : "";
      return `<div class="piece item${isMax ? " max" : ""}${special}" style="--c:${ch.color}">${Art.html(def.icon, def.emoji)}` +
        `<span class="lvl">${cell.level}</span>${want ? '<span class="tick">✓</span>' : ""}</div>`;
    },

    renderCell(i, wanted) {
      const el = this.cellEls[i], cell = this.cells[i];
      const [r, c] = this.rc(i);
      let cls = "cell" + ((r + c) % 2 ? " alt" : "");
      if (cell && cell.t === "tal") cls += " locked";
      if (i === this.selected) cls += " selected";
      else if (this._matchKey && cell && cell.t === "item" && U.key(cell.chain, cell.level) === this._matchKey) cls += " match";
      el.className = cls;
      const html = this.pieceHtml(cell, wanted);
      if (el._html !== html) {
        el.innerHTML = html;
        el._html = html;
      }
    },

    piece(i) { return this.cellEls[i] && this.cellEls[i].firstElementChild; },

    fx(i, cls) {
      const p = this.piece(i);
      if (!p) return;
      p.classList.remove(cls);
      void p.offsetWidth; // restart animation
      p.classList.add(cls);
      p.addEventListener("animationend", () => p.classList.remove(cls), { once: true });
    },

    fxDrop(to, from) {
      const p = this.piece(to);
      if (!p) return;
      const a = this.rect(from), b = this.rect(to);
      p.style.setProperty("--dx", a.left - b.left + "px");
      p.style.setProperty("--dy", a.top - b.top + "px");
      this.fx(to, "drop");
    },

    fxBreak(i) {
      UI.burst(this.rect(i), { chars: ["✦", "✧", "◆", "✦"], count: 10, cls: "gold", spread: 46 });
      if (this.cells[i]) this.fx(i, "pop");
    },

    /* Save + redraw everything that depends on the board. */
    commit() {
      State.save();
      this.render();
      Orders.render();
      UI.updateTop();
    },

    select(i) {
      this.selected = i;
      this.render();
      UI.showInfo(i);
    },

    /* ---------- input ---------- */
    onDown(e) {
      if (this.drag || (e.pointerType === "mouse" && e.button !== 0)) return;
      // Hit-test by coordinates: animating pieces can visually overlap other cells.
      const i = this.cellAt(e.clientX, e.clientY);
      if (i < 0) return;
      this.drag = { i, id: e.pointerId, x0: e.clientX, y0: e.clientY, started: false };
      this.lastAction = Date.now();
      try { this.el.setPointerCapture(e.pointerId); } catch (err) {}
    },

    onMove(e) {
      const d = this.drag;
      if (!d || d.id !== e.pointerId) return;
      if (!d.started) {
        if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < DRAG_THRESHOLD) return;
        const cell = this.cells[d.i];
        if (!cell || cell.t === "tal") return;
        this.startDrag(d);
      }
      this.moveGhost(e.clientX, e.clientY);
    },

    onUp(e) {
      const d = this.drag;
      if (!d || d.id !== e.pointerId) return;
      this.drag = null;
      if (d.started) {
        const to = this.cellAt(e.clientX, e.clientY);
        this.endDrag(d);
        this.drop(d.i, to);
      } else {
        this.tap(d.i);
      }
    },

    onCancel() {
      if (this.drag && this.drag.started) this.endDrag(this.drag);
      this.drag = null;
      this.render();
    },

    startDrag(d) {
      d.started = true;
      const p = this.piece(d.i);
      const r = this.rect(d.i);
      const g = p.cloneNode(true);
      g.classList.remove("pop", "drop", "tap", "bounce", "shake");
      g.classList.add("ghost");
      g.style.width = r.width * 0.92 + "px";
      g.style.height = r.height * 0.92 + "px";
      document.body.appendChild(g);
      this.ghost = g;
      this.ghostSize = r.width * 0.92;
      p.classList.add("lifted");
      Sfx.play("lift");
      d.piece = p;
      if (this.selected !== d.i) {
        this.selected = d.i;
        this.cellEls.forEach((el, k) => el.classList.toggle("selected", k === d.i));
        UI.showInfo(d.i);
      }
    },

    moveGhost(x, y) {
      const s = this.ghostSize;
      this.ghost.style.transform = `translate(${x - s / 2}px, ${y - s * 0.75}px) scale(1.18)`;
      const t = this.cellAt(x, y);
      if (t === this.hoverIdx) return;
      this.clearHover();
      this.hoverIdx = t;
      if (t < 0 || t === this.drag?.i) return;
      const a = this.cells[this.drag.i], b = this.cells[t];
      const el = this.cellEls[t];
      el.classList.add("hover");
      if (this.canMerge(a, b)) el.classList.add("merge-target");
      else if (b && b.t === "tal") el.classList.add("blocked");
    },

    clearHover() {
      if (this.hoverIdx >= 0) this.cellEls[this.hoverIdx].classList.remove("hover", "merge-target", "blocked");
      this.hoverIdx = -1;
    },

    endDrag(d) {
      this.clearHover();
      if (this.ghost) this.ghost.remove();
      this.ghost = null;
      if (d.piece) d.piece.classList.remove("lifted");
    },

    canMerge(a, b) {
      return a && b && a.t === "item" && b.t === "item" && a.chain === b.chain && a.level === b.level &&
        a.level < U.maxLevel(a.chain);
    },

    /* ---------- actions ---------- */
    drop(from, to) {
      const cells = this.cells;
      if (to < 0 || to === from) { this.render(); return; }
      const a = cells[from], b = cells[to];
      if (!a) { this.render(); return; } // the dragged item was used meanwhile (e.g. delivered with another finger)

      if (b && b.t === "tal") {
        this.render();
        this.fx(from, "shake");
        Sfx.play("error");
        UI.toast("Locked by a talisman. Merge right next to it to break it.");
        return;
      }

      if (a.t === "item" && b && b.t === "item" && a.chain === b.chain && a.level === b.level) {
        if (a.level >= U.maxLevel(a.chain)) {
          this.render();
          Sfx.play("error");
          UI.toast(`${U.item(a.chain, a.level).name} is already at max level ✦`);
          return;
        }
        this.merge(from, to);
        return;
      }

      // Move to empty cell, or swap with whatever is there.
      cells[to] = a;
      cells[from] = b || null;
      this.selected = to;
      Sfx.play("place");
      this.commit();
      UI.showInfo(to);
    },

    merge(from, to) {
      const a = this.cells[from];
      this.cells[from] = null;
      this.cells[to] = { t: "item", chain: a.chain, level: a.level + 1 };
      this.selected = to;
      const broken = this.breakTalismans(this.neighbors(to, false));
      this.commit();
      this.fx(to, "pop");
      Sfx.play(a.level + 1 >= U.maxLevel(a.chain) ? "maxed" : "merge", a.level + 1);
      if (broken.length) setTimeout(() => Sfx.play("shatter", broken.length), 120);
      UI.burst(this.rect(to), { chars: ["✨", "·", "✦"], count: 7, spread: 34 });
      broken.forEach((n) => this.fxBreak(n));
      UI.showInfo(to);
    },

    /* Breaks talismans at the given cells. Returns the indices broken. */
    breakTalismans(list) {
      const t = GAME_CONFIG.talisman, broken = [];
      list.forEach((n) => {
        const c = this.cells[n];
        if (!c || c.t !== "tal") return;
        let reveal = null;
        if (c.hides && U.item(c.hides.chain, c.hides.level)) reveal = { t: "item", chain: c.hides.chain, level: c.hides.level };
        else if (Math.random() < t.revealChance) reveal = { t: "item", chain: U.pick(Object.keys(CHAINS)), level: 1 };
        this.cells[n] = reveal;
        broken.push(n);
      });
      return broken;
    },

    tap(i) {
      const cell = this.cells[i];
      if (!cell) { this.select(-1); return; }
      if (cell.t === "gen") { this.select(i); this.produce(i); return; }
      if (cell.t === "item") {
        const def = U.item(cell.chain, cell.level);
        if (def.special === "clearTalismans" && this.selected === i) { this.activateCharm(i); return; }
        this.select(i);
        Sfx.play("select");
        this.fx(i, "tap");
        return;
      }
      this.select(i); // talisman: show info
      Sfx.play("error");
      this.fx(i, "shake");
    },

    produce(i) {
      const cell = this.cells[i];
      const g = CHAINS[cell.chain].generator;
      const cost = g.energyCost ?? 1;
      State.tickEnergy();
      if (State.d.energy < cost) {
        this.fx(i, "shake");
        Sfx.play("error");
        UI.openEnergy(true);
        return;
      }
      const t = this.nearestEmpty(i);
      if (t < 0) {
        this.fx(i, "shake");
        Sfx.play("error");
        UI.toast("The board is full! Merge or deliver some items.");
        return;
      }
      State.d.energy -= cost;
      const lucky = Math.random() < (GAME_CONFIG.luckyDropChance || 0);
      const level = Math.min((g.dropLevel || 1) + (lucky ? 1 : 0), U.maxLevel(cell.chain));
      this.cells[t] = { t: "item", chain: cell.chain, level };
      this.commit();
      this.fx(i, "bounce");
      Sfx.play("produce");
      this.fxDrop(t, i);
      if (lucky) setTimeout(() => { Sfx.play("stars"); UI.floatText(this.rect(t), "Lucky! ✨"); }, 250);
    },

    /* Random empty cell among those closest to `i` (8-way distance). */
    nearestEmpty(i) {
      const [r0, c0] = this.rc(i);
      let best = Infinity, list = [];
      this.cells.forEach((c, k) => {
        if (c) return;
        const [r, cc] = this.rc(k);
        const dist = Math.max(Math.abs(r - r0), Math.abs(cc - c0));
        if (dist < best) { best = dist; list = [k]; }
        else if (dist === best) list.push(k);
      });
      return list.length ? U.pick(list) : -1;
    },

    /* Selling frees space; it pays a quarter of what an order would, so it never beats delivering. */
    sellValue(cell) {
      if (!cell || cell.t !== "item") return 0;
      const r = GAME_CONFIG.orders.starReward[cell.level - 1] ?? cell.level * cell.level;
      return Math.floor(r / 4);
    },

    sell(i) {
      const cell = this.cells[i];
      if (!cell || cell.t !== "item") return;
      this.onCancel();
      const value = this.sellValue(cell), r = this.rect(i);
      this.cells[i] = null;
      this.selected = -1;
      State.d.stars += value;
      this.commit();
      Sfx.play(value ? "stars" : "place");
      UI.burst(r, { chars: ["·", "✦"], count: 6, spread: 26 });
      if (value) { UI.floatText(r, `+${value} ⭐`); UI.updateTop(true); }
      UI.showInfo(-1);
    },

    activateCharm(i) {
      this.onCancel();
      const broken = this.breakTalismans(this.neighbors(i, true));
      if (!broken.length) {
        this.fx(i, "shake");
        Sfx.play("error");
        UI.toast("No talismans around the charm. Move it next to one, then tap it.");
        return;
      }
      const r = this.rect(i);
      this.cells[i] = null;
      this.selected = -1;
      this.commit();
      UI.burst(r, { chars: ["🌟", "✨", "✦"], count: 14, cls: "gold", spread: 70 });
      Sfx.play("charm");
      setTimeout(() => Sfx.play("shatter", broken.length), 350);
      broken.forEach((n) => this.fxBreak(n));
      UI.showInfo(-1);
      UI.toast(`The astrolabe hums... ${broken.length} talisman${broken.length > 1 ? "s" : ""} broken!`);
    },

    /* After a few idle seconds on the board, wiggle two items that can be merged. */
    idleHint() {
      const now = Date.now();
      if (!Scene.boardOpen() || this.drag || Dialogue.isPlaying() || document.querySelector("#modal-root .modal")) {
        this.lastAction = now;
        return;
      }
      if (now - (this.lastAction || now) < 7000) { this.lastAction = this.lastAction || now; return; }
      this.lastAction = now;
      const pair = this.findPair();
      if (pair) pair.forEach((i) => this.fx(i, "hint"));
    },

    /* Two identical, not-yet-max items; pairs an order wants come first. */
    findPair() {
      const wanted = Orders.wantedKeys(), seen = {};
      let fallback = null;
      for (let i = 0; i < this.cells.length; i++) {
        const c = this.cells[i];
        if (!c || c.t !== "item" || c.level >= U.maxLevel(c.chain)) continue;
        const k = U.key(c.chain, c.level);
        if (seen[k] != null) {
          if (wanted.has(U.key(c.chain, c.level + 1))) return [seen[k], i];
          fallback = fallback || [seen[k], i];
        } else seen[k] = i;
      }
      return fallback;
    },

    spawn(chain, level) {
      const center = this.idx(Math.floor(this.rows / 2), Math.floor(this.cols / 2));
      const t = this.nearestEmpty(center);
      if (t < 0) { UI.toast("Board is full"); return; }
      this.cells[t] = { t: "item", chain, level };
      this.commit();
      this.fx(t, "pop");
    },

    breakAll() {
      const all = this.cells.map((c, k) => (c && c.t === "tal" ? k : -1)).filter((k) => k >= 0);
      const broken = this.breakTalismans(all);
      this.commit();
      broken.forEach((n) => this.fxBreak(n));
    },

    clearItems() {
      this.cells.forEach((c, k) => { if (c && c.t === "item") this.cells[k] = null; });
      this.selected = -1;
      this.commit();
      UI.showInfo(-1);
    },
  };

  window.Board = Board;
})();
