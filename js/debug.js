/* Debug panel for fast testing. Toggle with the 🐞 button.
   The button only shows on localhost, or when the address ends with ?debug. */
(function () {
  const Debug = {
    init() {
      this.panel = document.getElementById("debug-panel");
      const btn = document.getElementById("debug-toggle");
      const on = /[?&]debug\b/.test(location.search) || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === "file:";
      if (!on) btn.style.display = "none";
      else document.documentElement.classList.add("debug-on");
      btn.addEventListener("click", () => this.toggle());
      this.build();
      this.panel.addEventListener("click", (e) => {
        const sp = e.target.closest("[data-spawn]");
        if (sp) {
          const [chain, level] = sp.dataset.spawn.split(":");
          Board.spawn(chain, +level);
          return;
        }
        const b = e.target.closest("[data-dbg]");
        if (b) this.run(b.dataset.dbg);
      });
    },

    toggle(force) {
      const open = force ?? this.panel.classList.contains("hidden");
      this.panel.classList.toggle("hidden", !open);
    },

    build() {
      const spawn = Object.entries(CHAINS).map(([key, ch]) => `
        <div class="dbg-chain"><span>${ch.name}</span><div>
          ${ch.items.map((it, k) => `<button class="dbg-item" style="--c:${ch.color}" data-spawn="${key}:${k + 1}" title="${U.esc(it.name)}">${Art.html(it.icon, it.emoji)}<i>${k + 1}</i></button>`).join("")}
        </div></div>`).join("");

      this.panel.innerHTML = `
        <div class="dbg-head"><b>🐞 Debug</b><button data-dbg="close">✕</button></div>
        <div class="dbg-row"><span>Energy</span><button data-dbg="e10">+10</button><button data-dbg="e100">+100</button><button data-dbg="e0">Empty</button></div>
        <div class="dbg-row"><span>Stars</span><button data-dbg="s10">+10</button><button data-dbg="s100">+100</button><button data-dbg="s0">Zero</button></div>
        <div class="dbg-row"><button data-dbg="tal">Break talismans</button><button data-dbg="orders">New orders</button><button data-dbg="clear">Clear items</button></div>
        <div class="dbg-row"><button data-dbg="domeNext">Restore next part</button><button data-dbg="domeReset">Un-restore dome</button><button data-dbg="regen">Fast regen</button></div>
        <div class="dbg-sub">Spawn item (tap):</div>
        ${spawn}`;
    },

    run(cmd) {
      const d = State.d;
      switch (cmd) {
        case "close": return this.toggle(false);
        case "e10": State.addEnergy(10); break;
        case "e100": State.addEnergy(100); break;
        case "e0": d.energy = 0; d.energyStamp = Date.now(); break;
        case "s10": d.stars += 10; break;
        case "s100": d.stars += 100; break;
        case "s0": d.stars = 0; break;
        case "tal": Board.breakAll(); break;
        case "orders": Orders.reroll(); break;
        case "clear": Board.clearItems(); break;
        case "domeNext": this.toggle(false); Scene.restoreNextFree(); break;
        case "domeReset": Scene.unrestoreAll(); break;
        case "regen":
          GAME_CONFIG.energy.regenSeconds = GAME_CONFIG.energy.regenSeconds === 2 ? 120 : 2;
          UI.toast(`Energy regen: 1 per ${GAME_CONFIG.energy.regenSeconds}s (this session only)`);
          break;
      }
      State.save();
      UI.updateTop(cmd[0] === "s");
      Orders.render();
    },
  };

  window.Debug = Debug;
})();
