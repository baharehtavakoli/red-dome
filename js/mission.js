/* Story missions: short mini-games taken from Nasrin-Nush's tale, played after a chapter.
   A dome part opens one with `mission: "<id>"` (config.js -> domeParts); the rewards are in
   config.js -> GAME_CONFIG.missions. Closing a mission early keeps it waiting: a scroll button
   on the Dome Scene opens it again.
   State: State.d.missions = { <id>: "done" } */
(function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const cfg = () => GAME_CONFIG.missions || {};

  /* ---------- Find the twins: a memory game with talismans ---------- */
  const TREASURES = ["pearl", "rough_gem", "red_brick", "rose_bush", "star_shard", "glazed_red_tile"];
  const EMOJI = { pearl: "⚪", rough_gem: "💎", red_brick: "🧱", rose_bush: "🌹", star_shard: "✨", glazed_red_tile: "🟥" };

  /* done(tries) when every pair is found; fail() when the tries run out first (opts.maxTries). */
  function twins(body, done, fail, opts = {}) {
    const max = opts.maxTries || 0;
    const deck = U.shuffle ? U.shuffle(TREASURES.concat(TREASURES)) : TREASURES.concat(TREASURES).sort(() => Math.random() - 0.5);
    body.innerHTML = `
      <p class="ms-tip">${t("twinsTip")}</p>
      <div class="ms-grid">${deck.map((k, i) => `
        <button class="ms-card" data-i="${i}" aria-label="${U.esc(GAME_CONFIG.talisman.name || "")}">
          <span class="ms-back">${Art.html(GAME_CONFIG.talisman.icon, "🔶", "ms-ic")}</span>
          <span class="ms-front">${Art.html(`assets/items/${k}.webp`, EMOJI[k], "ms-ic")}</span>
        </button>`).join("")}</div>
      <p class="ms-moves">${max ? t("twinsLeft", { n: max }) : t("twinsMoves", { n: 0 })}</p>`;
    const cards = [...body.querySelectorAll(".ms-card")], moves = body.querySelector(".ms-moves");
    let open = [], n = 0, found = 0, lock = false;
    cards.forEach((c) => c.addEventListener("click", async () => {
      if (lock || c.classList.contains("up")) return;
      c.classList.add("up");
      Sfx.play("lift");
      open.push(c);
      if (open.length < 2) return;
      n++;
      moves.textContent = max ? t("twinsLeft", { n: max - n }) : t("twinsMoves", { n });
      moves.classList.toggle("low", !!max && max - n <= 3);
      const [a, b] = open;
      open = [];
      if (deck[a.dataset.i] === deck[b.dataset.i]) {
        found++;
        await sleep(250);
        Sfx.play("shatter");
        a.classList.add("matched"); b.classList.add("matched");
        UI.sparkle(a.getBoundingClientRect(), 8); UI.sparkle(b.getBoundingClientRect(), 8);
        if (found === TREASURES.length) { await sleep(700); return done(n); }
      } else {
        lock = true;
        await sleep(800);
        Sfx.play("error");
        a.classList.remove("up"); b.classList.remove("up");
        lock = false;
      }
      // out of tries: the talismans wake up and close the road
      if (max && n >= max && found < TREASURES.length) {
        lock = true;
        await sleep(400);
        cards.forEach((c) => c.classList.add("closing"));
        Sfx.play("shatter");
        await sleep(700);
        fail();
      }
    }));
  }

  const GAMES = { twins };

  const Mission = {
    open: false,

    pending() {
      const d = State.d.missions || {};
      return GAME_CONFIG.domeParts.find((p, i) => p.mission && State.d.dome[i] && d[p.mission] !== "done") || null;
    },

    init() {
      if (!State.d.missions || typeof State.d.missions !== "object") State.d.missions = {};
      const btn = document.createElement("button");
      btn.id = "mission-btn";
      btn.className = "gift-btn mission-btn";
      btn.setAttribute("aria-label", "Story mission");
      btn.innerHTML = `${Art.html("assets/ui/icons/story.webp", "📜", "gift-ic")}<span class="badge">!</span>`;
      btn.addEventListener("click", () => {
        const p = this.pending();
        if (p && !Scene.busy && !Scene.boardOpen()) this.play(p.mission);
      });
      document.getElementById("scene-screen").appendChild(btn);
      this.btn = btn;
      Art.probe(["assets/ui/icons/story.webp"], () => { btn.firstElementChild.outerHTML = Art.html("assets/ui/icons/story.webp", "📜", "gift-ic"); });
      this.refresh();
    },

    refresh() {
      if (this.btn) this.btn.classList.toggle("show", !!this.pending() && !this.open);
    },

    /* Resolves when the overlay closes (finished or put off for later). */
    play(id) {
      const game = GAMES[id], m = cfg()[id] || {};
      if (!game || (State.d.missions || {})[id] === "done") return Promise.resolve();
      const wasBusy = Scene.busy;
      Scene.busy = true;
      this.open = true;
      this.refresh();
      return new Promise((resolve) => {
        const el = document.createElement("div");
        el.id = "mission";
        const host = CHARACTERS[m.host || "nasrin"];
        const face = host ? Art.html(host.avatar || host.portrait, host.emoji, "ms-face") : "";
        const close = () => {
          el.classList.remove("in");
          setTimeout(() => { el.remove(); this.open = false; Scene.busy = wasBusy; this.refresh(); resolve(); }, 350);
        };
        // 1. the tale sets up the mission
        el.innerHTML = `
          <div class="ms-panel">
            <small class="ms-kicker">${t("missionKicker")}</small>
            <h3>${t(id + "Title")}</h3>
            <div class="ms-say">${face}<p>${t(id + "Intro")}</p></div>
            <div class="ms-body"></div>
            <div class="ms-actions">
              <button class="btn gold wide" data-go>${t("missionStart")}</button>
              <button class="btn ghost wide" data-later>${t("missionLater")}</button>
            </div>
          </div>`;
        document.body.appendChild(el);
        setTimeout(() => el.classList.add("in"), 30);
        Sfx.play("open");
        el.querySelector("[data-later]").addEventListener("click", close);
        const start = () => {
          Sfx.play("click");
          el.classList.remove("lost");
          el.classList.add("playing");
          el.querySelector("h3").textContent = t(id + "Title");
          el.querySelector(".ms-actions").innerHTML = `<button class="btn ghost wide" data-later>${t("missionLater")}</button>`;
          el.querySelector("[data-later]").addEventListener("click", close);
          // 2. the game
          game(el.querySelector(".ms-body"), won, lost, { maxTries: m.maxTries });
        };
        // out of tries: no reward, play it again (now or later)
        const lost = () => {
          Sfx.play("error");
          el.classList.remove("playing");
          el.classList.add("lost");
          el.querySelector("h3").textContent = t(id + "FailTitle");
          el.querySelector(".ms-say p").textContent = t(id + "Fail");
          el.querySelector(".ms-body").innerHTML = "";
          el.querySelector(".ms-actions").innerHTML = `
            <button class="btn gold wide" data-retry>${t("missionRetry")}</button>
            <button class="btn ghost wide" data-later>${t("missionLater")}</button>`;
          el.querySelector("[data-retry]").addEventListener("click", start);
          el.querySelector("[data-later]").addEventListener("click", close);
        };
        el.querySelector("[data-go]").addEventListener("click", start);
        function won(moves) {
          // 3. done: reward and the tale goes on
          State.d.missions[id] = "done";
          const r = m.reward || {};
          if (r.energy) State.addEnergy(r.energy);
          if (r.stars) State.d.stars += r.stars;
          State.save();
          UI.updateTop(true);
          Sfx.play("fanfare");
          const gift = [r.energy ? `<span>${Art.html("assets/ui/icons/energy.webp", "⚡", "ms-gic")}+${r.energy}</span>` : "", r.stars ? `<span>${Art.html("assets/ui/icons/star.webp", "⭐", "ms-gic")}+${r.stars}</span>` : ""].filter(Boolean).join("");
          el.classList.remove("playing");
          el.classList.add("won");
          el.querySelector("h3").textContent = t(id + "WinTitle");
          el.querySelector(".ms-say p").textContent = t(id + "Win");
          el.querySelector(".ms-body").innerHTML = `<p class="ms-moves">${t("twinsMoves", { n: moves })}</p><div class="ms-gift">${gift}</div>`;
          el.querySelector(".ms-actions").innerHTML = `<button class="btn gold wide" data-collect>${t("missionCollect")}</button>`;
          const b = el.querySelector("[data-collect]");
          b.addEventListener("click", () => { UI.sparkle(b.getBoundingClientRect(), 16); Sfx.play("energy"); close(); });
        }
      });
    },
  };

  window.Mission = Mission;
})();
