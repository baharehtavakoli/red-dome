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

  /* ---------- The guardian wakes: a full-screen merge battle ----------
     The prince faces a bronze guardian. Below them is a small board of tools; merging two of the same
     tool fires it at once, and the higher the level made, the stronger it is:
       sword  -> the prince strikes          shield -> blocks the guardian's next blows
       rose water -> heals the prince        star -> magic: pushes the guardian's blow back (and hurts it)
     The guardian strikes every few moves. A level-4 tool is used up when it's made.
     Art: config.js -> missions.guard (sprites, tool icons); emoji stand in until the art exists. */
  const TOOLS = {
    sword: { emoji: ["", "🗡️", "🗡️", "⚔️", "⚔️"], fx: [0, 0, 1, 3, 6] },          // damage by level made
    shield: { emoji: ["", "🛡️", "🛡️", "🛡️", "🛡️"], fx: [0, 0, 1, 2, 3] },        // blocks
    rose: { emoji: ["", "🌹", "🌹", "🌹", "🌹"], fx: [0, 0, 1, 2, 4] },           // healing
    star: { emoji: ["", "✨", "🌟", "💫", "💫"], fx: [0, 0, 1, 2, 3] },           // moves pushed back (+ damage)
  };
  const TOOL_KEYS = Object.keys(TOOLS);

  function guard(body, done, fail, opts = {}) {
    const W = 4, H = 4, MAXLV = 4;
    const gMax = opts.guardianHp || 12, pMax = opts.princeHp || 6, every = opts.strikeEvery || 3, hitDmg = opts.strikeDmg || 2;
    const pick = (paths) => paths.find((p) => p && Art.has(p)) || paths[paths.length - 1];
    const has = (p) => (p && Art.has(p) ? p : null);
    const P = opts.poses || {}, FX = opts.fx || {};
    const art = {
      bg: pick([opts.bg, opts.bgFallback]),
      guardian: has(P.guardian && P.guardian.idle) || pick([opts.guardianArt, opts.guardianFallback]),
      prince: has(P.prince && P.prince.idle) || pick([opts.princeArt, opts.princeFallback]),
      slash: has(FX.slash), impact: has(FX.impact), wave: has(FX.wave),
    };
    const icon = (k, lv) => {
      const p = opts.tools && opts.tools[k] && opts.tools[k][lv - 1];
      return p && Art.has(p) ? `<img src="${p}" alt="" draggable="false">` : `<span>${TOOLS[k].emoji[lv]}</span>`;
    };
    const rnd = () => ({ k: U.pick(["sword", "sword", "shield", "shield", "rose", "star"]), lv: 1 });

    const mission = body.closest("#mission");
    const layer = document.createElement("div");
    layer.className = "bt";
    layer.innerHTML = `
      <div class="bt-stage" style="background-image:url('${art.bg}')">
        <div class="bt-top">
          <button class="bt-later">${t("missionLater")}</button>
          <div class="bt-title">${t("guardTitle")}</div>
        </div>
        <div class="bt-bars">
          <div class="bt-bar g"><b>${U.esc(t("guardName"))}</b><i><span></span></i></div>
          <div class="bt-bar p"><b>${U.esc(t("princeName"))}</b><i><span></span></i></div>
        </div>
        <div class="bt-fighters">
          <div class="bt-guardian"><img src="${art.guardian}" alt="" draggable="false"><div class="bt-cracks"></div>
            <div class="bt-intent"><i>✊</i><b></b></div></div>
          <div class="bt-prince"><img src="${art.prince}" alt="" draggable="false"><div class="bt-shield">${icon("shield", 3)}<b></b></div></div>
        </div>
        <div class="bt-count"></div>
        <div class="bt-fx"></div>
      </div>
      <div class="bt-board-wrap">
        <p class="bt-tip">${t("guardTip")}</p>
        <div class="bt-board"></div>
        <div class="bt-legend">${TOOL_KEYS.map((k) => `<span>${icon(k, 2)}<small>${t("tool_" + k)}</small></span>`).join("")}</div>
      </div>`;
    mission.appendChild(layer);
    setTimeout(() => layer.classList.add("in"), 30);
    layer.querySelector(".bt-later").addEventListener("click", () => {
      over = true;
      layer.remove();
      const later = mission.querySelector(".ms-actions [data-later]");
      if (later) later.click();
    });

    const $ = (s) => layer.querySelector(s);
    const boardEl = $(".bt-board"), fxEl = $(".bt-fx"), gEl = $(".bt-guardian"), pEl = $(".bt-prince");
    let gHp = gMax, pHp = pMax, shield = 0, clock = every, moves = 0, over = false, busy = false, sel = -1;
    let board = Array.from({ length: W * H }, rnd);
    // make sure the first board has something to merge for every tool
    TOOL_KEYS.forEach((k, i) => { board[i * 2] = { k, lv: 1 }; board[i * 2 + 9] = { k, lv: 1 }; });

    /* ---- motion helpers: each fighter moves along x (px) with a little extra transform ---- */
    const pose = (el, who, name) => {
      const img = el.querySelector("img");
      const src = has(P[who] && P[who][name]) || art[who];
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
      // a pose drawn smaller than the others (e.g. the low lunge) is scaled back up from the feet
      const k = src !== art[who] && opts.poseScale && opts.poseScale[who] && opts.poseScale[who][name];
      img.style.transformOrigin = "50% 100%";
      img.style.scale = k ? String(k) : "";
    };
    const go = (el, x, ms, extra = "", easing = "cubic-bezier(.2,.8,.2,1)") => {
      const from = el._t || "translateX(0px)", to = `translateX(${x}px) ${extra}`;
      if (el._a) el._a.cancel();
      el._t = to;
      el._a = el.animate([{ transform: from }, { transform: to }], { duration: ms, easing, fill: "forwards" });
      return sleep(ms);
    };
    const still = (el) => { if (el._a) el._a.cancel(); el._a = null; el._t = null; };
    // centre-to-centre distance at rest (offsetLeft ignores transforms)
    const dist = () => (pEl.offsetLeft + pEl.offsetWidth / 2) - (gEl.offsetLeft + gEl.offsetWidth / 2);
    const spot = (el, fx, fy) => {
      const r = el.getBoundingClientRect(), s = fxEl.getBoundingClientRect();
      return { x: r.left - s.left + r.width * fx, y: r.top - s.top + r.height * fy };
    };
    const put = (cls, at, html = "", ms = 900, style = "") => {
      const d = document.createElement("div");
      d.className = cls;
      d.innerHTML = html;
      d.style.cssText = `left:${at.x}px;top:${at.y}px;${style}`;
      fxEl.appendChild(d);
      setTimeout(() => d.remove(), ms);
      return d;
    };
    const flash = (el, ms) => {
      const img = el.querySelector("img");
      img.classList.add("whiteout");
      setTimeout(() => img.classList.remove("whiteout"), ms);
    };
    const num = (at, text, cls, lv = 2) => put("bt-num " + cls, at, U.esc(text), 1100, `--fs:${26 + lv * 6}px`);
    const boom = (at, lv, cls = "") => {
      const s = 70 + lv * 26;
      if (art.impact && !cls) return put("bt-impact", at, `<img src="${art.impact}" alt="">`, 400, `--s:${s}px`);
      return put("bt-boom " + cls, at, "", 400, `--s:${s}px`);
    };
    const burst = (at, n, kind = "", up = false) => {
      for (let i = 0; i < n; i++) {
        const a = up ? -Math.PI / 2 + (Math.random() - 0.5) * 1.6 : Math.random() * Math.PI * 2;
        const r = 40 + Math.random() * (up ? 90 : 70);
        const ch = kind === "chip" ? "" : kind === "petal" ? "🌸" : Math.random() < 0.5 ? "✦" : "✧";
        put("bt-spark " + kind, at, ch, 800,
          `--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r + (up ? 0 : 14)}px;--rot:${Math.round(Math.random() * 540 - 270)}deg;animation-delay:${Math.random() * 60}ms`);
      }
    };
    const SLASH_SVG = `<svg viewBox="0 0 200 200"><defs><linearGradient id="bt-sg" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#ffd76a" stop-opacity="0"/><stop offset=".45" stop-color="#ffd76a"/><stop offset="1" stop-color="#fffbe8"/></linearGradient></defs>
      <path d="M14 182 Q34 40 190 18 Q74 64 14 182Z" fill="url(#bt-sg)"/>
      <path d="M42 150 Q74 62 172 32" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".95"/></svg>`;
    const slash = (at, lv, flip) => put("bt-slash" + (flip ? " flip" : "") + (lv >= 3 ? " big" : ""), at,
      art.slash ? `<img src="${art.slash}" alt="">` : SLASH_SVG, 420, `--s:${110 + lv * 34}px`);

    const hud = () => {
      $(".bt-bar.g span").style.width = `${(Math.max(0, gHp) / gMax) * 100}%`;
      $(".bt-bar.p span").style.width = `${(Math.max(0, pHp) / pMax) * 100}%`;
      $(".bt-shield").classList.toggle("on", shield > 0);
      $(".bt-shield b").textContent = shield > 1 ? "×" + shield : "";
      const soon = clock <= 1;
      const c = $(".bt-count");
      c.textContent = soon && shield === 0 ? t("guardWarn") : t("guardLeft", { n: clock });
      c.classList.toggle("soon", soon);
      $(".bt-intent b").textContent = clock > 0 ? String(clock) : "!";
      $(".bt-intent").classList.toggle("soon", soon);
      gEl.classList.toggle("charging", soon && !over);
      $(".bt-cracks").style.opacity = String(Math.min(1, (1 - gHp / gMax) * 1.2));
    };
    const render = () => {
      boardEl.innerHTML = board.map((c, i) => c
        ? `<button class="bt-cell lv${c.lv}${i === sel ? " sel" : ""}" data-i="${i}" data-k="${c.k}">${icon(c.k, c.lv)}<i>${c.lv}</i></button>`
        : `<div class="bt-cell empty"></div>`).join("");
    };
    const anim = (el, cls, ms) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); };
    const hasMove = () => board.some((a, i) => a && a.lv < MAXLV && board.some((b, j) => j !== i && b && b.k === a.k && b.lv === a.lv));

    /* ---- the prince's sword: wind back, dash in, slash, freeze on the hit, knock the guardian back, return ---- */
    async function swordAttack(v, lv) {
      const d = dist();
      pose(pEl, "prince", "ready");
      await go(pEl, 16, 120, "scale(.96) rotate(3deg)", "ease-out");
      pose(pEl, "prince", "attack");
      pEl.classList.add("front");
      await go(pEl, -(d - gEl.offsetWidth * 0.48), 150, "rotate(-4deg)", "cubic-bezier(.6,0,.9,.5)");
      const hits = lv >= 4 ? [Math.ceil(v / 2), Math.floor(v / 2)] : [v];
      for (let h = 0; h < hits.length; h++) {
        const at = spot(gEl, 0.5 + (Math.random() - 0.5) * 0.12, 0.42 + h * 0.08);
        Sfx.play("clang");
        slash(at, lv, h % 2 === 1);
        boom(at, lv);
        flash(gEl, 80 + lv * 20);
        burst(at, 6 + lv * 3);
        burst(at, 2 + lv * 2, "chip");
        gHp -= hits[h];
        num(at, `-${hits[h]}`, "dmg", lv);
        hud();
        if (lv >= 3) anim(layer, "shake", 400);
        await sleep(60 + lv * 25); // hit-stop: everything holds on the impact
        go(gEl, -14 - lv * 7, 130, "rotate(-4deg)", "ease-out").then(() => { if (!over) go(gEl, 0, 300, "", "ease-in-out"); });
        if (h < hits.length - 1) await sleep(120);
      }
      await sleep(110);
      pose(pEl, "prince", "idle");
      await go(pEl, 0, 260, "", "ease-in-out");
      pEl.classList.remove("front");
    }

    /* ---- the star: a spark of magic flies to the guardian and leaves it dizzy ---- */
    async function starCast(v, lv) {
      Sfx.play("charm");
      pose(pEl, "prince", "attack");
      await go(pEl, -10, 100, "", "ease-out");
      const from = spot(pEl, 0.3, 0.45), to = spot(gEl, 0.52, 0.38);
      const orb = put("bt-orb", { x: 0, y: 0 }, icon("star", Math.min(lv, 3)), 700);
      orb.animate([
        { transform: `translate(${from.x}px,${from.y}px) translate(-50%,-50%) scale(.6) rotate(0deg)` },
        { transform: `translate(${(from.x + to.x) / 2}px,${Math.min(from.y, to.y) - 50}px) translate(-50%,-50%) scale(1.2) rotate(180deg)`, offset: 0.5 },
        { transform: `translate(${to.x}px,${to.y}px) translate(-50%,-50%) scale(1) rotate(360deg)` },
      ], { duration: 300, easing: "ease-in", fill: "forwards" });
      await sleep(300);
      orb.remove();
      boom(to, lv, "magic");
      burst(to, 10);
      flash(gEl, 90);
      const dizzy = document.createElement("div");
      dizzy.className = "bt-dizzy";
      dizzy.innerHTML = "<span>✦</span><span>✧</span><span>✦</span>";
      gEl.appendChild(dizzy);
      setTimeout(() => dizzy.remove(), 1500);
      clock += v;
      num(to, `⏳ +${v}`, "magic", 1);
      if (lv >= 3) { gHp -= lv - 2; setTimeout(() => num(spot(gEl, 0.5, 0.55), `-${lv - 2}`, "dmg", 2), 160); }
      hud();
      go(gEl, -10, 120, "rotate(-5deg)").then(() => { if (!over) go(gEl, 0, 400, "", "ease-in-out"); });
      pose(pEl, "prince", "idle");
      await go(pEl, 0, 220, "", "ease-in-out");
    }

    async function act(k, lv) {
      const v = TOOLS[k].fx[lv];
      if (k === "sword") {
        await swordAttack(v, lv);
      } else if (k === "shield") {
        shield += v;
        Sfx.play("place");
        pose(pEl, "prince", "block");
        anim($(".bt-shield"), "pop", 400);
        burst(spot(pEl, 0.15, 0.4), 8);
        num(spot(pEl, 0.3, 0.2), `🛡️ +${v}`, "block", 1);
        hud();
        await sleep(450);
        pose(pEl, "prince", "idle");
      } else if (k === "rose") {
        const before = pHp; pHp = Math.min(pMax, pHp + v);
        Sfx.play("energy");
        anim(pEl, "healglow", 800);
        burst(spot(pEl, 0.5, 0.75), 6 + lv * 2, "petal", true);
        num(spot(pEl, 0.5, 0.3), `+${pHp - before}`, "heal", lv);
        hud();
        await sleep(450);
      } else if (k === "star") {
        await starCast(v, lv);
      }
    }

    /* ---- the guardian's blow: rear back, charge across, smash; the shield takes it or the prince does ---- */
    async function strike() {
      const d = dist();
      gEl.classList.remove("charging");
      gEl.classList.add("striking");
      if (shield > 0) pose(pEl, "prince", "block");
      pose(gEl, "guardian", "windup");
      Sfx.play("drum");
      await go(gEl, -18, 280, "scale(1.06) rotate(-5deg)", "ease-out");
      await sleep(140);
      pose(gEl, "guardian", "strike");
      gEl.classList.add("front");
      const reach = d - pEl.offsetWidth * 0.78;
      await go(gEl, reach, 150, "rotate(4deg)", "cubic-bezier(.6,0,.9,.5)");
      const at = spot(pEl, 0.4, 0.5);
      put("bt-wave", spot(pEl, 0.45, 0.98), art.wave ? `<img src="${art.wave}" alt="">` : "", 600);
      anim(layer, "shake", 400);
      if (shield > 0) {
        shield--;
        Sfx.play("clang");
        anim($(".bt-shield"), "hitblock", 400);
        boom(at, 2, "block");
        burst(at, 12);
        num(spot(pEl, 0.4, 0.25), t("guardBlocked"), "block", 1);
        hud();
        await sleep(110);
        await go(gEl, reach * 0.55, 170, "rotate(-3deg)", "ease-out"); // bounced off the shield
      } else {
        pHp -= hitDmg;
        Sfx.play("error");
        pose(pEl, "prince", "hurt");
        boom(at, 3, "hurt");
        flash(pEl, 120);
        burst(at, 8, "chip");
        anim(layer, "flash", 500);
        num(at, `-${hitDmg}`, "hurt", 3);
        hud();
        await sleep(130); // hit-stop
        go(pEl, 34, 160, "rotate(6deg)", "ease-out").then(() => { if (!over) go(pEl, 0, 360, "", "ease-in-out"); });
        await sleep(160);
      }
      await sleep(160);
      pose(gEl, "guardian", "idle");
      await go(gEl, 0, 380, "", "ease-in-out");
      gEl.classList.remove("front", "striking");
      if (pHp > 0) pose(pEl, "prince", "idle");
      clock = every;
      hud();
    }

    async function merge(a, b) {
      busy = true;
      sel = -1;
      const lv = board[a].lv + 1, k = board[a].k;
      moves++;
      board[a] = null;
      board[b] = lv >= MAXLV ? null : { k, lv };
      render();
      const cell = boardEl.querySelector(`[data-i="${b}"]`) || boardEl.children[b];
      if (cell) UI.sparkle(cell.getBoundingClientRect(), lv >= 3 ? 12 : 6);
      Sfx.play("merge", lv);
      await act(k, lv);
      if (over) return;
      if (gHp <= 0) return win();
      clock--;
      hud();
      if (clock <= 0) { await sleep(250); await strike(); }
      if (over) return;
      if (pHp <= 0) return lose();
      // new tools drop into the empty cells
      await sleep(150);
      board = board.map((c) => c || rnd());
      if (!hasMove()) {
        // never leave the board stuck: copy one tool onto another cell so a merge exists
        const i0 = board.findIndex((c) => c && c.lv < MAXLV);
        const j0 = board.findIndex((c, j) => j !== i0);
        if (i0 >= 0 && j0 >= 0) board[j0] = { ...board[i0] };
      }
      render();
      busy = false;
    }

    async function win() {
      over = true;
      hud();
      anim(layer, "shake", 500);
      const at = spot(gEl, 0.5, 0.45);
      burst(at, 18, "chip");
      burst(at, 12);
      await sleep(200);
      still(gEl);
      pose(gEl, "guardian", "fallen");
      gEl.classList.add("fallen");
      Sfx.play("shatter", 3);
      await sleep(1400);
      layer.classList.remove("in");
      await sleep(400);
      layer.remove();
      done(moves);
    }
    async function lose() {
      over = true;
      hud();
      still(pEl);
      pose(pEl, "prince", "hurt");
      pEl.classList.add("down");
      await sleep(1200);
      layer.classList.remove("in");
      await sleep(400);
      layer.remove();
      fail();
    }

    // tap one tool, then a matching one; or drag one onto the other
    let dragFrom = -1;
    boardEl.addEventListener("pointerdown", (e) => {
      const c = e.target.closest(".bt-cell[data-i]");
      if (!c || busy || over) return;
      dragFrom = +c.dataset.i;
    });
    boardEl.addEventListener("pointerup", (e) => {
      if (busy || over) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const c = el && el.closest(".bt-cell[data-i]");
      const to = c ? +c.dataset.i : -1;
      const from = dragFrom;
      dragFrom = -1;
      if (to < 0) return;
      const tryMerge = (a, b) => {
        const A = board[a], B = board[b];
        if (a !== b && A && B && A.k === B.k && A.lv === B.lv && A.lv < MAXLV) { merge(a, b); return true; }
        return false;
      };
      if (from >= 0 && from !== to) { if (!tryMerge(from, to)) { Sfx.play("error"); sel = -1; render(); } return; }
      if (sel < 0) { sel = to; Sfx.play("select"); render(); return; }
      if (sel === to) { sel = -1; render(); return; }
      if (!tryMerge(sel, to)) { sel = to; Sfx.play("select"); render(); }
    });

    render();
    hud();
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
      if (g) Art.probe([g.bg, g.bgFallback, g.guardianArt, g.guardianFallback, g.princeArt, g.princeFallback]
        .concat(...Object.values(g.tools || {}), ...Object.values(g.poses || {}).map((o) => Object.values(o)), Object.values(g.fx || {}))
        .filter(Boolean), () => {});
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
