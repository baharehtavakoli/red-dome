/* HUD, info bar, toasts, modals (energy, settings) and visual effects. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);

  const UI = {
    init() {
      document.querySelectorAll(".energy-pill").forEach((b) => b.addEventListener("click", () => this.openEnergy(false)));
      $("#settings-btn").addEventListener("click", () => this.openSettings());
      window.addEventListener("resize", () => this.layoutBoard());
      this.infoEl = $("#infobar");
      this.infoEl.addEventListener("click", (e) => {
        const b = e.target.closest("[data-action]");
        if (!b) return;
        if (b.dataset.action === "activate") Board.activateCharm(+b.dataset.i);
        if (b.dataset.action === "chain") this.openChain(b.dataset.chain, +b.dataset.level);
      });
    },

    /* ---------- top bar ---------- */
    /* HUD values appear on both screens, so they're found by data-hud. */
    updateTop(bumpStars) {
      const d = State.d, max = GAME_CONFIG.energy.max;
      const next = State.secondsToNextEnergy();
      const all = (k) => document.querySelectorAll(`[data-hud="${k}"]`);
      all("energy").forEach((e) => (e.textContent = `${d.energy}/${max}`));
      all("timer").forEach((e) => (e.textContent = next > 0 ? U.fmtTime(next) : ""));
      all("stars").forEach((e) => (e.textContent = d.stars));
      document.querySelectorAll(".energy-pill").forEach((e) => e.classList.toggle("low", d.energy < 5));
      if (bumpStars) document.querySelectorAll(".stars-pill").forEach((e) => this.bump(e));
      $("#back-btn").classList.toggle("notify", Scene.canRestoreNext());
      if (this.energyModal) this.refreshEnergyModal();
      Scene.render();
    },

    /* Size board cells to fit the board screen. */
    layoutBoard() {
      const app = $("#app");
      const used = ["topbar", "orders", "infobar"].reduce((s, id) => s + document.getElementById(id).offsetHeight, 0);
      const board = $("#board");
      const cs = getComputedStyle(board);
      const frame = parseFloat(cs.paddingLeft) * 2 + parseFloat(cs.borderLeftWidth) * 2;
      const gap = parseFloat(cs.columnGap) || 0;
      const { cols, rows } = GAME_CONFIG;
      const ws = getComputedStyle($("#board-wrap"));
      const side = parseFloat(ws.paddingLeft) + parseFloat(ws.paddingRight);
      const availW = app.clientWidth - side - frame - gap * (cols - 1);
      const availH = app.clientHeight - used - 14 - frame - gap * (rows - 1);
      const cell = Math.floor(Math.max(28, Math.min(availW / cols, availH / rows, 72)));
      document.documentElement.style.setProperty("--cell", cell + "px");
    },

    bump(el) {
      el.classList.remove("bump");
      void el.offsetWidth;
      el.classList.add("bump");
    },

    tick() {
      if (State.tickEnergy()) State.save();
      this.updateTop();
      Board.idleHint();
    },

    /* ---------- info bar ---------- */
    showInfo(i) {
      const el = this.infoEl;
      const cell = i >= 0 ? State.d.board[i] : null;
      if (!cell) {
        el.innerHTML = `<div class="info-hint">Tap a <b>generator ⚡</b> to make items. Drag two matching items together to <b>merge</b>.</div>`;
        return;
      }
      if (cell.t === "tal") {
        const t = GAME_CONFIG.talisman;
        el.innerHTML = `<div class="info-icon tal">${Art.html(t.icon, t.emoji)}</div>
          <div class="info-text"><b>${t.name}</b><small>Merge an item right next to it, or use an Astrolabe Charm, to break it.</small></div>`;
        return;
      }
      const ch = CHAINS[cell.chain];
      if (cell.t === "gen") {
        const g = ch.generator, first = ch.items[(g.dropLevel || 1) - 1];
        el.innerHTML = `<div class="info-icon gen" style="--c:${ch.color}">${Art.html(g.icon, g.emoji)}</div>
          <div class="info-text"><b>${U.esc(g.name)}</b><small>Tap to make ${U.esc(first.name)} · ${g.energyCost ?? 1} ⚡</small></div>
          <button class="info-chain" data-action="chain" data-chain="${cell.chain}" data-level="0">${Art.html(first.icon, first.emoji, "mini")}<span class="arrow">›</span>…<span class="ibtn">i</span></button>`;
        return;
      }
      const def = ch.items[cell.level - 1], next = ch.items[cell.level], max = ch.items.length;
      let right;
      if (def.special === "clearTalismans") {
        right = `<button class="btn small gold" data-action="activate" data-i="${i}">Activate</button>`;
      } else if (next) {
        right = `<button class="info-chain" data-action="chain" data-chain="${cell.chain}" data-level="${cell.level}" aria-label="Show the ${U.esc(ch.name)} chain">` +
          `2×${Art.html(def.icon, def.emoji, "mini")}<span class="arrow">→</span>${Art.html(next.icon, next.emoji, "mini")}<span class="ibtn">i</span></button>`;
      } else {
        right = `<button class="info-chain" data-action="chain" data-chain="${cell.chain}" data-level="${cell.level}">✦ Max<span class="ibtn">i</span></button>`;
      }
      const extra = def.description ? ` · ${U.esc(def.description)}` : "";
      el.innerHTML = `<div class="info-icon" style="--c:${ch.color};${U.slotVar(cell.chain)}">${Art.html(def.icon, def.emoji)}</div>
        <div class="info-text"><b>${U.esc(def.name)}</b><small>${ch.name} · Level ${cell.level}/${max}${extra}</small></div>${right}`;
    },

    /* ---------- merge chain card ---------- */
    /* Shows a whole chain: generator, then every level with what it merges into.
       `level` is highlighted (0 = just the generator). `intro` replaces the subtitle. */
    openChain(chain, level, intro) {
      const ch = CHAINS[chain];
      if (!ch) return;
      const g = ch.generator, slot = U.slotVar(chain);
      const steps = ch.items.map((it, k) => {
        const lv = k + 1, cls = lv === level ? " cur" : lv < level ? " done" : "";
        return `${k ? '<span class="chain-arrow">›</span>' : ""}<div class="chain-step${cls}">` +
          `<div class="chain-art" style="${slot}">${Art.html(it.icon, it.emoji)}</div><small>${U.esc(it.name)}</small><i>Lv ${lv}</i></div>`;
      }).join("");
      let howto = "";
      const target = ch.items[level - 1];
      if (target) {
        const prev = ch.items[level - 2];
        howto = level <= (g.dropLevel || 1)
          ? `Tap the <b>${U.esc(g.name)}</b> on the board to make a ${U.esc(target.name)}.`
          : `Merge <b>two ${U.esc(prev.name)}s</b> to make a ${U.esc(target.name)}.`;
      } else howto = `Tap the <b>${U.esc(g.name)}</b> to start this chain, then merge pairs to climb it.`;
      this.modal(`
        <h3>${U.esc(ch.name)} chain</h3>
        <p class="muted">${intro ? U.esc(intro) : "Two of the same make the next one."}</p>
        <div class="chain-flow">
          <div class="chain-step chain-gen"><div class="chain-art">${Art.html(g.icon, g.emoji)}</div><small>${U.esc(g.name)}</small><i>makes</i></div>
          <span class="chain-arrow">›</span>${steps}
        </div>
        <p class="chain-howto">${howto}</p>
        <button class="btn gold wide" data-close>Got it</button>`, { cls: "chain-modal" });
    },

    /* ---------- toast ---------- */
    toast(msg, ms = 2200) {
      const root = $("#toast-root");
      root.textContent = msg;
      root.classList.remove("show");
      void root.offsetWidth;
      root.classList.add("show");
      clearTimeout(this._toastT);
      this._toastT = setTimeout(() => root.classList.remove("show"), ms);
    },

    /* ---------- modals ---------- */
    modal(html, opts = {}) {
      this.closeModal();
      const root = $("#modal-root");
      root.innerHTML = `<div class="modal-back"><div class="modal ${opts.cls || ""}">${html}</div></div>`;
      const back = root.firstElementChild;
      this._onClose = opts.onClose || null;
      back.addEventListener("click", (e) => {
        if (e.target === back || e.target.closest("[data-close]")) this.closeModal();
      });
      requestAnimationFrame(() => back.classList.add("open"));
      return back.firstElementChild;
    },

    closeModal() {
      const root = $("#modal-root");
      if (!root.firstElementChild) return;
      root.innerHTML = "";
      const cb = this._onClose;
      this._onClose = null;
      cb && cb();
    },

    openEnergy(outOf) {
      const e = GAME_CONFIG.energy;
      const m = this.modal(`
        <h3>${outOf ? "Out of energy!" : "Energy"}</h3>
        <div class="energy-big">⚡ <span data-e></span></div>
        <p class="muted" data-etimer></p>
        <button class="btn gold wide" data-ad>📺 Watch ad <b>+${e.adReward} ⚡</b></button>
        <button class="btn ghost wide" data-close>Close</button>`, { onClose: () => (this.energyModal = null) });
      this.energyModal = m;
      this.refreshEnergyModal();
      m.querySelector("[data-ad]").addEventListener("click", () => this.watchAd());
    },

    refreshEnergyModal() {
      const m = this.energyModal;
      if (!m || !m.querySelector("[data-e]")) return;
      const max = GAME_CONFIG.energy.max;
      m.querySelector("[data-e]").textContent = `${State.d.energy} / ${max}`;
      m.querySelector("[data-etimer]").textContent = State.d.energy >= max
        ? "Energy is full."
        : `+1 in ${U.fmtTime(State.secondsToNextEnergy())} · full in ${U.fmtTime(State.secondsToFull())}`;
    },

    watchAd() {
      const e = GAME_CONFIG.energy;
      this.energyModal = null;
      const m = this.modal(`
        <h3>Ad playing…</h3>
        <div class="ad-fake"><div class="ad-screen">📺<small>Your ad here</small></div>
        <div class="ad-bar"><i style="animation-duration:${e.adSeconds}s"></i></div></div>
        <p class="muted">Fake ad for testing — no network calls.</p>`, { cls: "ad" });
      const back = m.parentElement;
      back.style.pointerEvents = "none"; // can't dismiss mid-ad
      setTimeout(() => {
        this.closeModal();
        State.addEnergy(e.adReward);
        this.updateTop();
        const pill = Scene.boardOpen() ? $("#app .energy-pill") : $("#scene-screen .energy-pill");
        this.bump(pill);
        this.floatText(pill.getBoundingClientRect(), `+${e.adReward} ⚡`);
        this.toast(`Thanks for watching! +${e.adReward} energy`);
      }, e.adSeconds * 1000);
    },

    openSettings() {
      const parts = GAME_CONFIG.domeParts.length;
      const m = this.modal(`
        <h3>Settings</h3>
        <p class="muted">Orders delivered: ${State.d.ordersDone} · Dome: ${State.partsRestored()}/${parts}</p>
        <button class="btn wide" data-intro>📜 Replay intro</button>
        <button class="btn danger wide" data-reset>Reset progress</button>
        <button class="btn ghost wide" data-close>Close</button>`);
      m.querySelector("[data-intro]").addEventListener("click", () => {
        this.closeModal();
        if (Scene.boardOpen()) Scene.closeBoard();
        setTimeout(() => Scene.playIntro(), 300);
      });
      const reset = m.querySelector("[data-reset]");
      reset.addEventListener("click", () => {
        if (!reset.classList.contains("confirm")) {
          reset.classList.add("confirm");
          reset.textContent = "Tap again to erase everything";
          return;
        }
        State.reset();
        location.reload();
      });
    },

    celebrate() {
      this.sparkle(document.body.getBoundingClientRect(), 40);
      this.modal(`
        <div class="celebrate-icon">🕌</div>
        <h3>The Red Dome is restored!</h3>
        <p class="muted">Nasrin-Nush's home shines again. Keep merging — orders will keep coming.</p>
        <button class="btn gold wide" data-close>Wonderful</button>`);
    },

    /* ---------- effects ---------- */
    burst(rect, { chars = ["✨"], count = 8, cls = "", spread = 40 } = {}) {
      const layer = $("#fx-layer");
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      for (let k = 0; k < count; k++) {
        const s = document.createElement("span");
        s.className = "particle " + cls;
        s.textContent = chars[k % chars.length];
        const a = (k / count) * Math.PI * 2 + Math.random() * 0.6;
        const dist = spread * (0.55 + Math.random() * 0.6);
        s.style.left = cx + "px";
        s.style.top = cy + "px";
        s.style.setProperty("--tx", Math.cos(a) * dist + "px");
        s.style.setProperty("--ty", Math.sin(a) * dist + "px");
        s.style.animationDelay = Math.random() * 90 + "ms";
        layer.appendChild(s);
        setTimeout(() => s.remove(), 1000);
      }
    },

    sparkle(rect, count = 14) {
      this.burst(rect, { chars: ["✨", "⭐", "✦", "✧"], count, cls: "gold", spread: Math.max(50, rect.width * 0.55) });
    },

    floatText(rect, text) {
      const s = document.createElement("div");
      s.className = "float-text";
      s.textContent = text;
      s.style.left = rect.left + rect.width / 2 + "px";
      s.style.top = rect.top + rect.height / 2 + "px";
      $("#fx-layer").appendChild(s);
      setTimeout(() => s.remove(), 1300);
    },

    flyTo(from, to, html) {
      const f = document.createElement("div");
      f.className = "flyer";
      f.innerHTML = html;
      f.style.left = from.left + "px";
      f.style.top = from.top + "px";
      f.style.width = from.width + "px";
      f.style.height = from.height + "px";
      $("#fx-layer").appendChild(f);
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        f.style.transform = `translate(${dx}px, ${dy}px) scale(.45)`;
        f.style.opacity = "0.2";
      }));
      setTimeout(() => f.remove(), 520);
    },
  };

  window.UI = UI;
})();
