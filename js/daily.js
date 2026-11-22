/* Daily gift: a 7-day calendar. One claim per calendar day; missing a day starts again at day 1,
   and after day 7 it starts over. Rewards are in config.js -> GAME_CONFIG.daily.
   State: State.d.daily = { last: "<date string of last claim>", streak: <day last claimed, 1-7> } */
(function () {
  const today = () => new Date().toDateString();
  const yesterday = () => new Date(Date.now() - 864e5).toDateString();
  const days = () => GAME_CONFIG.daily || [];

  function describe(r) {
    const out = [];
    if (r.energy) out.push(`+${r.energy} ⚡`);
    if (r.stars) out.push(`+${r.stars} ⭐`);
    if (r.item) { const it = U.item(r.item.chain, r.item.level); if (it) out.push(it.name); }
    return out;
  }
  /* One block per reward: a big icon, the amount and what it is ("20 / Energy"). */
  function cell(r) {
    const out = [];
    if (r.energy) out.push(`<div class="rw">${Art.html("assets/ui/icons/energy.webp", "⚡", "rw-ic")}<b>${r.energy}</b><em>${t("rwEnergy")}</em></div>`);
    if (r.stars) out.push(`<div class="rw">${Art.html("assets/ui/icons/star.webp", "⭐", "rw-ic")}<b>${r.stars}</b><em>${t("rwStars")}</em></div>`);
    if (r.item) {
      const it = U.item(r.item.chain, r.item.level);
      if (it) out.push(`<div class="rw item">${Art.html(it.icon, it.emoji, "rw-ic")}<b>1</b><em>${U.esc(it.name)}</em></div>`);
    }
    return out.join("");
  }

  const Daily = {
    init() {
      const d = State.d;
      if (!d.daily || typeof d.daily !== "object") d.daily = { last: "", streak: 0 };
      const btn = document.createElement("button");
      btn.id = "gift-btn";
      btn.className = "gift-btn";
      btn.setAttribute("aria-label", "Daily gift");
      btn.innerHTML = `${Art.html("assets/ui/icons/chest.webp", "🎁", "gift-ic")}<span class="badge">!</span>`;
      btn.addEventListener("click", () => this.open());
      document.getElementById("scene-screen").appendChild(btn);
      this.btn = btn;
      Art.probe(["assets/ui/icons/energy.webp", "assets/ui/icons/star.webp"], () => {}); // the calendar's reward icons
      Art.probe(["assets/ui/icons/chest.webp"], () => { btn.firstElementChild.outerHTML = Art.html("assets/ui/icons/chest.webp", "🎁", "gift-ic"); });
      this.refresh();
    },

    available() { return days().length > 0 && State.d.daily.last !== today(); },

    /* Which day (1-7) today's claim would be. */
    nextDay() {
      const d = State.d.daily, n = days().length;
      if (d.last === today()) return d.streak;
      return d.last === yesterday() ? (d.streak % n) + 1 : 1;
    },

    refresh() {
      if (this.btn) this.btn.classList.toggle("ready", this.available());
    },

    /* Opened by itself once per session, when nothing else is going on. */
    maybeAutoOpen() {
      if (this._shown || !this.available()) return;
      if (!State.d.seenIntro || State.d.tut >= 0 || Scene.busy || Scene.boardOpen() || Dialogue.isPlaying()) return;
      if (document.querySelector("#modal-root .modal")) return;
      this._shown = true;
      setTimeout(() => this.open(), 700);
    },

    open() {
      this._shown = true;
      const cur = this.nextDay(), can = this.available();
      const cells = days().map((r, i) => {
        const day = i + 1;
        const state = day < cur || (!can && day === cur) ? "got" : day === cur ? "today" : "later";
        return `<div class="day ${state}${day === days().length ? " big" : ""}">
          <small class="day-n">${t("day", { n: day })}</small><div class="rws">${cell(r)}</div>
          ${state === "got" ? '<i class="check">✓</i>' : ""}</div>`;
      }).join("");
      const m = UI.modal(`
        <h3>${t("dailyTitle")}</h3>
        <p class="muted">${t("dailyText")}</p>
        <div class="daily-grid">${cells}</div>
        ${can ? `<button class="btn gold wide" data-claim>${t("claim", { n: cur })}</button>`
              : `<p class="muted">${t("claimed")}</p>`}
        <button class="btn ghost wide" data-close>${t("close")}</button>`, { cls: "daily" });
      const b = m.querySelector("[data-claim]");
      if (b) b.addEventListener("click", () => this.claim(b));
    },

    claim(btn) {
      if (!this.available()) return;
      const day = this.nextDay(), r = days()[day - 1] || {};
      const rect = btn.getBoundingClientRect();
      State.d.daily = { last: today(), streak: day };
      if (r.energy) State.addEnergy(r.energy);
      if (r.stars) State.d.stars += r.stars;
      let itemNote = "";
      if (r.item) {
        // the item goes on the board; if it's full, it's paid out in stars instead
        const free = State.d.board.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
        if (free.length) State.d.board[U.pick(free)] = { t: "item", chain: r.item.chain, level: r.item.level };
        else { const v = Board.sellValue({ t: "item", chain: r.item.chain, level: r.item.level }) * 2 || 2; State.d.stars += v; itemNote = t("boardFullStars", { n: v }); }
        Board.render();
        Orders.render();
      }
      State.save();
      Sfx.play("deliver");
      UI.sparkle(rect, 18);
      UI.floatText(rect, describe(r).join("  "));
      UI.updateTop(true);
      this.refresh();
      UI.closeModal();
      UI.toast(t("dailyToast", { n: day, gift: describe(r).join("، ") }) + itemNote);
    },
  };

  window.Daily = Daily;
})();
