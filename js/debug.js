/* Debug panel for fast testing. Toggle with the 🐞 button.
   The button only shows on localhost, or when the address ends with ?debug.

   Test one piece on its own, without playing up to it: add ?test=<piece> to the address, e.g.
     .../red-dome/?test=guard     the night-1 battle        ?test=twins   the twin talismans
     .../red-dome/?test=door      the hidden door           ?test=tale1 (tale2, tale3)  a tale night
     .../red-dome/?test=onboard   the opening story
   It opens straight away and a "play again" button brings it back. Nothing is saved in test mode,
   so the real game progress on that device stays exactly as it was. */
(function () {
  const TESTS = [
    ["guard", "⚔️ Battle"], ["twins", "🃏 Twins"], ["door", "🚪 Door"],
    ["tale1", "📖 Tale 1"], ["tale2", "📖 Tale 2"], ["tale3", "📖 Tale 3"], ["onboard", "🎬 Opening"],
  ];

  const Debug = {
    // the piece named by ?test=..., or null
    testTarget() {
      const m = /[?&]test=([a-z0-9]+)/i.exec(location.search);
      return m && TESTS.some(([id]) => id === m[1]) ? m[1] : null;
    },

    // called by main.js before boot finishes: test mode never saves and never shows the opening by itself
    prepareTest() {
      State.save = () => {};
      State.saveNow = () => {};
      State.d.seenIntro = true;
    },

    async runTest(id) {
      const bar = document.createElement("div");
      bar.id = "test-bar";
      bar.innerHTML = `<b>TEST · ${U.esc(id)}</b><span>${U.esc(t("testNoSave"))}</span><button>🔁 ${U.esc(t("testAgain"))}</button>`;
      document.body.appendChild(bar);
      const btn = bar.querySelector("button");
      const run = async () => {
        btn.disabled = true;
        bar.hidden = true; // out of the way while the piece is playing
        if (id === "onboard") await Onboard.play();
        else if (/^tale\d$/.test(id)) await Tale.play(id, { replay: true });
        else {
          State.d.missions = State.d.missions || {};
          delete State.d.missions[id];
          await Mission.play(id);
        }
        btn.disabled = false;
        bar.hidden = false;
      };
      btn.addEventListener("click", run);
      run();
    },

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
        <div class="dbg-sub">Test one piece (opens in test mode, nothing saved):</div>
        <div class="dbg-row">${TESTS.map(([id, label]) => `<button data-dbg="test:${id}">${label}</button>`).join("")}</div>
        <div class="dbg-row"><button data-dbg="domeNext">Restore next part</button><button data-dbg="domeReset">Un-restore dome</button><button data-dbg="regen">Fast regen</button></div>
        <div class="dbg-sub">Spawn item (tap):</div>
        ${spawn}`;
    },

    run(cmd) {
      const d = State.d;
      if (cmd.startsWith("test:")) {
        location.search = "?test=" + cmd.slice(5) + (/[?&]debug\b/.test(location.search) ? "&debug" : "");
        return;
      }
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
