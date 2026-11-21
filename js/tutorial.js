/* First-time guide: a hand pointer and a short tip walk a new player through one full loop,
   from the dome to the board, dig, merge, deliver, back, and build the stairs.

   Each step says what it points at and when it is done, and is checked several times a second,
   so the guide follows whatever the player actually does (steps they do early are skipped).
   Progress is State.d.tut: step index, or -1 when finished. Old saves skip it. */
(function () {
  const $ = (s) => document.querySelector(s);
  const board = () => State.d.board;
  const count = (chain, level) => board().filter((c) => c && c.t === "item" && c.chain === chain && c.level === level).length;
  const pieceEl = (i) => (i >= 0 ? Board.piece(i) : null);
  const tutOrderSlot = () => State.d.orders.findIndex((o) => o && o.tut);

  const STEPS = [
    {
      id: "open",
      where: "scene",
      text: "Let's gather materials. Tap <b>Merge</b>!",
      target: () => $("#merge-btn"),
      done: () => Scene.boardOpen(),
    },
    {
      id: "dig",
      where: "board",
      text: "Tap the <b>Quarry</b> to dig up pebbles. Each tap costs 1 ⚡.",
      target: () => pieceEl(board().findIndex((c) => c && c.t === "gen" && c.chain === "stone")),
      done: () => count("stone", 1) >= 2 || count("stone", 2) > 0,
    },
    {
      id: "merge",
      where: "board",
      text: "Two of a kind make something better. <b>Drag one pebble onto the other.</b>",
      drag: () => {
        const ids = board().map((c, i) => (c && c.t === "item" && c.chain === "stone" && c.level === 1 ? i : -1)).filter((i) => i >= 0);
        return ids.length >= 2 ? [pieceEl(ids[0]), pieceEl(ids[1])] : null;
      },
      done: () => count("stone", 2) > 0 || State.d.ordersDone > 0,
      fallback: 1, // pebbles gone without a Stone? dig again
      stillValid: () => count("stone", 1) >= 2,
    },
    {
      id: "deliver",
      where: "board",
      text: "Mehrab needs a <b>Stone</b>. Tap <b>Deliver</b>!",
      target: () => { const s = tutOrderSlot(); return s >= 0 ? Orders.slotEls[s].querySelector(".deliver") : null; },
      done: () => State.d.ordersDone > 0,
      fallback: 1, // the Stone was sold or used: make another
      stillValid: () => count("stone", 2) > 0,
    },
    {
      id: "back",
      where: "board",
      text: "Orders pay ⭐ stars. You have enough for the stairs. <b>Back to the dome!</b>",
      target: () => $("#back-btn"),
      done: () => !Scene.boardOpen() || State.d.dome[0],
    },
    {
      id: "build",
      where: "scene",
      text: "Tap the stairs to <b>build</b> them!",
      target: () => Scene.taskEls[0],
      done: () => State.d.dome[0],
    },
  ];

  const Tutorial = {
    init() {
      if (State.d.tut === undefined) {
        // new players start at 0; anyone who has already played skips the guide
        State.d.tut = State.d.ordersDone > 0 || State.partsRestored() > 0 ? -1 : 0;
      }
      document.body.insertAdjacentHTML("beforeend",
        `<div id="tut" class="hidden" aria-live="polite"><div class="tut-ring"></div><div class="tut-hand">👆</div><div class="tut-tip"></div></div>`);
      this.el = $("#tut");
      this.hand = this.el.querySelector(".tut-hand");
      this.ring = this.el.querySelector(".tut-ring");
      this.tip = this.el.querySelector(".tut-tip");
      setInterval(() => this.update(), 200);
      window.addEventListener("resize", () => this.update());
    },

    active() { return State.d.tut >= 0; },

    /* The first order is an easy, generous one so the first build is one order away. */
    ensureOrder() {
      if (State.d.orders.some((o) => o && o.tut) || State.d.ordersDone > 0) return;
      const lines = (window.ORDER_LINES && ORDER_LINES.mehrab) || [""];
      State.d.orders[0] = {
        id: ++State.d.orderSeq, who: "mehrab", items: [{ chain: "stone", level: 2 }],
        stars: GAME_CONFIG.domeParts[0].cost, line: lines[0], tut: true,
      };
      State.save();
      Orders.render();
    },

    update() {
      if (!this.active()) return this.hide();
      let k = State.d.tut;
      // advance past every step that is already done
      while (k < STEPS.length && STEPS[k].done()) k++;
      // a step whose setup vanished goes back (e.g. pebbles used elsewhere)
      const s0 = STEPS[k];
      if (s0 && s0.fallback !== undefined && !s0.stillValid()) k = s0.fallback;
      if (k !== State.d.tut) { State.d.tut = k; State.save(); }
      if (k >= STEPS.length) return Scene.busy || Dialogue.isPlaying() ? this.hide() : this.finish();

      if (k >= 1) this.ensureOrder();
      const step = STEPS[k];
      // pause while a story, cinematic, window or the intro is on screen
      if (Dialogue.isPlaying() || Scene.busy || $("#modal-root .modal") || !State.d.seenIntro) return this.hide();

      const onBoard = Scene.boardOpen();
      let text = step.text, from = null, to = null;
      if (step.where === "board" && !onBoard) { text = "Back to the board: tap <b>Merge</b>."; from = $("#merge-btn"); }
      else if (step.where === "scene" && onBoard) { text = "Tap here to go back to the dome."; from = $("#back-btn"); }
      else if (step.drag) { const d = step.drag(); if (d) [from, to] = d; }
      else from = step.target();
      if (!from || !from.isConnected) return this.hide();
      this.show(from, to, text, step.id);
    },

    show(fromEl, toEl, text, id) {
      const a = fromEl.getBoundingClientRect();
      if (!a.width) return this.hide();
      const cx = a.left + a.width / 2, cy = a.top + a.height / 2;
      this.el.classList.remove("hidden");
      this.el.classList.toggle("dragging", !!toEl);
      this.ring.style.cssText = `left:${cx}px;top:${cy}px;width:${a.width + 14}px;height:${a.height + 14}px`;
      if (toEl) {
        const b = toEl.getBoundingClientRect();
        this.hand.style.cssText = `left:${cx}px;top:${cy}px;--dx:${b.left + b.width / 2 - cx}px;--dy:${b.top + b.height / 2 - cy}px`;
      } else {
        this.hand.style.cssText = `left:${cx}px;top:${cy}px`;
      }
      if (this.tip._html !== text) { this.tip.innerHTML = text; this.tip._html = text; }
      // tip above the target when it's low on the screen, below when it's high
      const vh = window.innerHeight, w = Math.min(300, window.innerWidth - 24);
      const below = cy < vh * 0.55;
      const left = Math.max(12, Math.min(window.innerWidth - w - 12, cx - w / 2));
      this.tip.style.cssText = `width:${w}px;left:${left}px;` +
        (below ? `top:${a.bottom + 54}px` : `bottom:${vh - a.top + 20}px`);
      if (this._last !== id) { this._last = id; this.tip.classList.remove("pop"); void this.tip.offsetWidth; this.tip.classList.add("pop"); }
    },

    hide() { if (this.el) this.el.classList.add("hidden"); },

    finish() {
      State.d.tut = -1;
      State.save();
      this.hide();
      setTimeout(() => UI.toast("Well done! Merge, deliver orders and build the whole Red Dome."), 600);
    },
  };

  window.Tutorial = Tutorial;
})();
