/* Story scenes, played on top of the Dome Scene.
   Two half-body portraits stand left/right; the speaker is highlighted,
   the other dimmed. Dialogue box at the bottom, text typed letter by letter,
   tap anywhere to advance. */
(function () {
  const TYPE_MS = 24;

  function portraitHtml(who) {
    const c = CHARACTERS[who];
    if (!c) return "";
    if (Art.has(c.portrait)) return `<img class="portrait-img" src="${U.esc(c.portrait)}" alt="" draggable="false">`;
    // Placeholder figure: shoulders + head, in the character's colour.
    return `<div class="figure" style="--who:${c.color}">
        <div class="fig-body"><div class="fig-collar"></div></div>
        <div class="fig-head"><span class="emoji">${c.emoji}</span></div>
      </div>`;
  }

  const Dialogue = {
    el: null,
    scene: null,
    idx: 0,
    timer: null,
    full: "",
    resolve: null,
    slots: { left: null, right: null },
    lastSpoke: {},

    init() {
      this.el = document.getElementById("dialogue");
      this.el.innerHTML = `
        <div class="dlg-backdrop"><img alt="" draggable="false"></div>
        <div class="dlg-stage">
          <div class="actor left" data-side="left"></div>
          <div class="actor right" data-side="right"></div>
        </div>
        <div class="dlg-title"><small data-chapter></small><span data-title></span></div>
        <button class="dlg-skip">${t("skip")}</button>
        <div class="dlg-box">
          <div class="dlg-name" data-name></div>
          <div class="dlg-text" data-text></div>
          <div class="dlg-next" aria-hidden="true"><span class="dlg-next-btn"></span></div>
        </div>`;
      this.$ = (s) => this.el.querySelector(s);
      this.actors = { left: this.$(".actor.left"), right: this.$(".actor.right") };
      this.el.addEventListener("click", (e) => {
        const skip = e.target.closest(".dlg-skip");
        if (skip) {
          // Skip sits near where players tap to advance, so it asks once
          if (!skip.classList.contains("confirm")) {
            skip.classList.add("confirm");
            skip.textContent = t("skipConfirm");
            clearTimeout(this._skipT);
            this._skipT = setTimeout(() => this.resetSkip(), 2500);
            return;
          }
          this.resetSkip();
          this.end();
        }
        else this.advance();
      });
    },

    /* Returns a Promise that resolves when the scene ends. */
    play(id, onDone) {
      return new Promise((resolve) => {
        const s = window.STORY[id];
        if (!s || !s.lines || !s.lines.length) { onDone && onDone(); resolve(); return; }
        this.scene = s;
        this.idx = 0;
        this.resetSkip();
        this.setBackdrop("none");
        this.resolve = () => { onDone && onDone(); resolve(); };
        this.lastSpoke = {};
        this.slots = { left: null, right: null };
        Object.values(this.actors).forEach((a) => { a.innerHTML = ""; a.className = a.className.replace(/ (active|dim|enter)/g, ""); });

        const cast = s.cast || [];
        if (cast[0]) this.place("left", cast[0]);
        if (cast[1]) this.place("right", cast[1]);

        this.$("[data-chapter]").textContent = s.chapter || "";
        this.$("[data-title]").textContent = s.title || "";
        const title = this.$(".dlg-title");
        title.classList.remove("show");
        void title.offsetWidth;
        title.classList.add("show");

        clearTimeout(this.hideTimer);
        this.el.classList.remove("hidden");
        requestAnimationFrame(() => this.el.classList.add("open"));
        this.showLine();
      });
    },

    place(side, who) {
      this.slots[side] = who;
      const a = this.actors[side];
      a.innerHTML = portraitHtml(who);
      a.classList.remove("enter");
      void a.offsetWidth;
      a.classList.add("enter");
    },

    resetSkip() {
      clearTimeout(this._skipT);
      const b = this.$(".dlg-skip");
      b.classList.remove("confirm");
      b.textContent = t("skip");
    },

    /* A portrait finished downloading after the scene started: swap the placeholder for it. */
    refreshArt() {
      ["left", "right"].forEach((side) => {
        const who = this.slots[side], a = this.actors[side];
        if (who && a.querySelector(".figure") && Art.has(CHARACTERS[who].portrait)) a.innerHTML = portraitHtml(who);
      });
    },

    /* Put the speaker on stage if needed; returns their side. */
    stageFor(line) {
      const who = line.who;
      if (this.slots.left === who) return "left";
      if (this.slots.right === who) return "right";
      let side = line.side;
      if (!side) {
        if (!this.slots.left) side = "left";
        else if (!this.slots.right) side = "right";
        else {
          const l = this.lastSpoke[this.slots.left] ?? -1, r = this.lastSpoke[this.slots.right] ?? -1;
          side = l <= r ? "left" : "right";
        }
      }
      this.place(side, who);
      return side;
    },

    /* Full-screen picture behind the dialogue: a key of GAME_CONFIG.scene.intro, or "none". */
    setBackdrop(key) {
      const bd = this.$(".dlg-backdrop"), img = bd.querySelector("img");
      const src = key && key !== "none" && (GAME_CONFIG.scene.intro || {})[key];
      if (!src) { bd.classList.remove("show"); return; }
      if (img.getAttribute("src") !== src) {
        img.setAttribute("src", src);
        bd.classList.remove("zoom"); void bd.offsetWidth; bd.classList.add("zoom");
      }
      bd.classList.add("show");
    },

    showLine() {
      const line = this.scene.lines[this.idx];
      if (line.bg !== undefined) this.setBackdrop(line.bg);
      const narr = line.who === "narrator";
      const who = narr ? { name: "", color: "#3a1450" } : CHARACTERS[line.who] || { name: line.who || "", color: "#9b1c1c" };
      const side = narr ? null : this.stageFor(line);
      if (!narr) this.lastSpoke[line.who] = this.idx;
      this.el.classList.toggle("narrating", narr);
      ["left", "right"].forEach((s) => {
        const a = this.actors[s];
        a.classList.toggle("active", s === side);
        a.classList.toggle("dim", s !== side && !!this.slots[s]);
      });
      const box = this.$(".dlg-box");
      box.style.setProperty("--who", who.color);
      box.classList.toggle("from-right", side === "right");
      this.$("[data-name]").textContent = who.name;
      box.classList.remove("line-in");
      void box.offsetWidth;
      box.classList.add("line-in");
      this.speaker = narr ? null : this.actors[side];
      this.type(line.text);
    },

    type(text) {
      clearInterval(this.timer);
      // Persian letters change shape with their neighbours, so it types word by word
      const chars = window.I18N && I18N.rtl ? text.split(/(\s+)/) : Array.from(text);
      const el = this.$("[data-text]");
      this.full = text;
      let n = 0;
      el.textContent = "";
      this.el.classList.add("typing");
      if (this.speaker) this.speaker.classList.add("talking");
      const voice = Object.keys(CHARACTERS).indexOf(this.scene && this.scene.lines[this.idx] && this.scene.lines[this.idx].who);
      this.timer = setInterval(() => {
        n++;
        if (n % 3 === 1 && /\S/.test(chars[n - 1] || "")) Sfx.play("blip", (voice < 0 ? 0 : voice) % 4);
        el.textContent = chars.slice(0, n).join("");
        if (n >= chars.length) this.finishTyping();
      }, TYPE_MS);
    },

    finishTyping() {
      clearInterval(this.timer);
      this.timer = null;
      this.$("[data-text]").textContent = this.full;
      this.el.classList.remove("typing");
      Object.values(this.actors).forEach((a) => a.classList.remove("talking"));
    },

    advance() {
      if (!this.scene) return;
      if (this.timer) { this.finishTyping(); return; }
      Sfx.play("next");
      this.idx++;
      if (this.idx >= this.scene.lines.length) this.end();
      else this.showLine();
    },

    end() {
      if (!this.scene) return;
      clearInterval(this.timer);
      this.timer = null;
      this.scene = null;
      this.el.classList.remove("open", "narrating");
      this.setBackdrop("none");
      this.hideTimer = setTimeout(() => this.el.classList.add("hidden"), 300);
      const done = this.resolve;
      this.resolve = null;
      if (done) setTimeout(done, 150);
    },

    isPlaying() { return !!this.scene; },
  };

  window.Dialogue = Dialogue;
})();
