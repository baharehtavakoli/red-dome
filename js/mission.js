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

  /* ---------- The guardian wakes: block its blows by tapping when the golden ring meets the chest symbol ---------- */
  function guard(body, done, fail, opts = {}) {
    const need = opts.blocks || 5, lives = opts.lives || 3;
    const useArt = opts.art && Art.has(opts.art);
    const art = useArt ? opts.art : opts.fallback;
    const f = (useArt ? opts.focus : opts.fallbackFocus) || [50, 50];
    body.innerHTML = `
      <p class="ms-tip">${t("guardTip")}</p>
      <div class="gd-hud"><span class="gd-hearts"></span><span class="gd-count"></span></div>
      <div class="gd-arena" style="--fx:${f[0]}%;--fy:${f[1]}%">
        <img class="gd-img" src="${art}" alt="" draggable="false">
        <div class="gd-target"></div><div class="gd-ring"></div><div class="gd-flash"></div>
      </div>
      <button class="btn gold wide gd-block">🛡️ ${t("guardBlock")}</button>`;
    const arena = body.querySelector(".gd-arena"), ring = body.querySelector(".gd-ring");
    const hearts = body.querySelector(".gd-hearts"), count = body.querySelector(".gd-count");
    let hp = lives, ok = 0, attack = null, over = false, speed = 1700;
    const hud = () => {
      hearts.textContent = "❤️".repeat(Math.max(0, hp)) + "🖤".repeat(Math.max(0, lives - hp));
      count.textContent = t("guardLeft", { n: Math.max(0, need - ok) });
    };
    const strike = () => {
      if (over) return;
      attack = { t0: performance.now(), dur: speed };
      ring.style.animation = "none"; void ring.offsetWidth;
      ring.style.animation = `gd-shrink ${speed}ms linear forwards`;
      arena.classList.add("winding");
      attack.timer = setTimeout(() => settle(false), speed + 150); // too late: the blow lands
    };
    const settle = async (blocked) => {
      if (!attack || over) return;
      clearTimeout(attack.timer);
      attack = null;
      ring.style.animation = "none";
      arena.classList.remove("winding", "blocked", "hurt");
      void arena.offsetWidth;
      if (blocked) {
        ok++;
        Sfx.play("clang");
        arena.classList.add("blocked");
        UI.sparkle(body.querySelector(".gd-target").getBoundingClientRect(), 10);
        speed = Math.max(900, speed - 170); // each blow comes a little faster
      } else {
        hp--;
        Sfx.play("error");
        arena.classList.add("hurt");
      }
      hud();
      if (ok >= need) {
        over = true;
        await sleep(500);
        arena.classList.add("asleep");
        await sleep(1000);
        return done(lives - hp);
      }
      if (hp <= 0) {
        over = true;
        await sleep(800);
        return fail();
      }
      setTimeout(strike, 550 + Math.random() * 700);
    };
    // the ring shrinks from 2.4x to 0.8x: it meets the symbol at 87.5% of the way
    const tap = (e) => {
      e.preventDefault();
      if (!attack || over) return;
      const p = (performance.now() - attack.t0) / attack.dur;
      settle(p >= 0.74 && p <= 0.99);
    };
    arena.addEventListener("pointerdown", tap);
    body.querySelector(".gd-block").addEventListener("pointerdown", tap);
    hud();
    setTimeout(strike, 900);
  }

  /* ---------- The wall without a door: rotate the stones until the golden lines draw the door ---------- */
  function door(body, done, fail, opts = {}) {
    const C = 4, R = 5;
    // connections per stone: N=1 E=2 S=4 W=8; 0 = a door panel inside the outline (does not turn)
    const SOL = [6, 10, 10, 12, 5, 0, 0, 5, 5, 0, 0, 5, 5, 0, 0, 5, 3, 10, 10, 9];
    const turn = (m, k) => { for (let i = 0; i < k % 4; i++) m = ((m << 1) | (m >> 3)) & 15; return m; };
    const P = { 1: [50, 0], 2: [100, 50], 4: [50, 100], 8: [0, 50] };
    const draw = (m) => {
      const b = [1, 2, 4, 8].filter((x) => m & x);
      if (b.length !== 2) return "";
      const [a, c] = b.map((x) => P[x]);
      const straight = (m === 5 || m === 10);
      const d = straight ? `M${a[0]} ${a[1]} L${c[0]} ${c[1]}` : `M${a[0]} ${a[1]} Q50 50 ${c[0]} ${c[1]}`;
      return `<svg viewBox="0 0 100 100"><path d="${d}" class="dr-line"/><path d="${d}" class="dr-core"/></svg>`;
    };
    // every stone starts turned the wrong way
    const rot = SOL.map((m) => {
      if (!m) return 0;
      const wrong = [1, 2, 3].filter((k) => turn(m, k) !== m);
      return U.pick(wrong);
    });
    const minTaps = SOL.reduce((s, m, i) => {
      if (!m) return s;
      let k = 1;
      while (turn(m, rot[i] + k) !== m) k++;
      return s + k;
    }, 0);
    const max = minTaps + (opts.extraTurns ?? 6);
    body.innerHTML = `
      <p class="ms-tip">${t("doorTip")}</p>
      <div class="dr-grid">${SOL.map((m, i) => m
        ? `<button class="dr-tile" data-i="${i}" aria-label="stone"><div class="dr-rot" style="transform:rotate(${rot[i] * 90}deg)">${draw(m)}</div></button>`
        : `<div class="dr-panel"></div>`).join("")}</div>
      <p class="ms-moves">${t("doorLeft", { n: max })}</p>`;
    const moves = body.querySelector(".ms-moves"), grid = body.querySelector(".dr-grid");
    let n = 0, over = false;
    const solved = () => SOL.every((m, i) => !m || turn(m, rot[i]) === m);
    body.querySelectorAll(".dr-tile").forEach((tile) => tile.addEventListener("click", async () => {
      if (over) return;
      const i = +tile.dataset.i;
      rot[i]++;
      n++;
      tile.firstElementChild.style.transform = `rotate(${rot[i] * 90}deg)`;
      tile.classList.toggle("ok", turn(SOL[i], rot[i]) === SOL[i]);
      Sfx.play("place");
      moves.textContent = t("doorLeft", { n: max - n });
      moves.classList.toggle("low", max - n <= 3);
      if (solved()) {
        over = true;
        await sleep(350);
        grid.classList.add("done");
        Sfx.play("charm");
        await sleep(1300);
        grid.classList.add("open");
        Sfx.play("open");
        await sleep(900);
        return done(n);
      }
      if (n >= max) {
        over = true;
        await sleep(400);
        grid.classList.add("failed");
        Sfx.play("error");
        await sleep(900);
        fail();
      }
    }));
  }

  const GAMES = { twins, door, guard };

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
      const g = cfg().guard;
      if (g) Art.probe([g.art, g.fallback].filter(Boolean), () => {});
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
          game(el.querySelector(".ms-body"), won, lost, m);
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
          const res = t(id + "Result", { n: moves });
          el.querySelector(".ms-body").innerHTML = `<p class="ms-moves">${res !== id + "Result" ? res : t("twinsMoves", { n: moves })}</p><div class="ms-gift">${gift}</div>`;
          el.querySelector(".ms-actions").innerHTML = `<button class="btn gold wide" data-collect>${t("missionCollect")}</button>`;
          const b = el.querySelector("[data-collect]");
          b.addEventListener("click", () => { UI.sparkle(b.getBoundingClientRect(), 16); Sfx.play("energy"); close(); });
        }
      });
    },
  };

  window.Mission = Mission;
})();
