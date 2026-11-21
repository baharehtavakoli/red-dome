/* Onboarding: the story before the game, as 5 full-screen picture panels.
   Each screen has a picture and one or more beats (tap Next to show the next beat).
   The last screen ends on a button that starts the game.
   Pictures are keys of GAME_CONFIG.scene.intro; a missing picture falls back to the next key in `img`. */
(function () {
  const SCREENS = [
    { img: ["bahram", "sky"], beats: ["ob1a", "ob1b"] },
    { img: ["ladies", "sky"], beats: ["ob2"] },
    { img: ["architect", "scene"], who: "shideh", beats: ["ob3"] },
    { img: ["ray"], beats: ["ob4a", { key: "ob4b", who: "shideh" }] },
    { img: ["build", "scene"], beats: ["ob5"], cta: "obStart" },
  ];

  function src(keys) {
    const I = GAME_CONFIG.scene.intro || {};
    const all = Object.assign({ scene: GAME_CONFIG.scene.background }, I);
    for (const k of keys) {
      const p = all[k];
      if (p && (!GAME_CONFIG.tryImages || Art.has(p) || k === keys[keys.length - 1])) return p;
    }
    return all[keys[keys.length - 1]] || "";
  }

  const Onboard = {
    /* pictures the first screen needs, for the loader in main.js */
    firstImages() { return [src(SCREENS[0].img), src(SCREENS[1].img)]; },

    play() {
      return new Promise((resolve) => {
        const el = document.createElement("div");
        el.id = "onboard";
        el.innerHTML = `
          <div class="ob-pic"><img alt="" draggable="false"></div>
          <div class="ob-shade"></div>
          <button class="ob-skip">${t("skip")}</button>
          <div class="ob-card">
            <div class="ob-who"></div>
            <p class="ob-text"></p>
            <div class="ob-foot">
              <div class="ob-dots">${SCREENS.map(() => "<i></i>").join("")}</div>
              <button class="btn gold ob-next"></button>
            </div>
          </div>`;
        document.body.appendChild(el);
        const img = el.querySelector(".ob-pic img"), pic = el.querySelector(".ob-pic");
        const textEl = el.querySelector(".ob-text"), whoEl = el.querySelector(".ob-who");
        const next = el.querySelector(".ob-next"), dots = [...el.querySelectorAll(".ob-dots i")];
        let s = -1, b = 0, done = false;

        const finish = () => {
          if (done) return;
          done = true;
          el.classList.add("out");
          setTimeout(() => { el.remove(); resolve(); }, 500);
        };

        const showBeat = () => {
          const scr = SCREENS[s], beat = scr.beats[b];
          const key = typeof beat === "string" ? beat : beat.key;
          const who = (typeof beat === "object" && beat.who) || (b === 0 && scr.who) || null;
          const c = who && CHARACTERS[who];
          whoEl.innerHTML = c ? `${Art.html(c.avatar || c.portrait, c.emoji || "", "ob-face")}<b>${U.esc(c.name)}</b>` : "";
          whoEl.classList.toggle("show", !!c);
          el.classList.toggle("quote", typeof beat === "object");
          textEl.textContent = t(key);
          textEl.classList.remove("in"); void textEl.offsetWidth; textEl.classList.add("in");
          const last = b === scr.beats.length - 1;
          next.textContent = last && scr.cta ? t(scr.cta) : t("obNext");
          next.classList.toggle("cta", !!(last && scr.cta));
          el.querySelector(".ob-skip").style.visibility = scr.cta ? "hidden" : "";
        };

        const showScreen = (i) => {
          s = i; b = 0;
          dots.forEach((d, j) => d.classList.toggle("on", j <= i));
          const p = src(SCREENS[i].img);
          if (img.getAttribute("src") !== p) {
            pic.classList.remove("show");
            setTimeout(() => {
              img.setAttribute("src", p);
              pic.classList.remove("zoom"); void pic.offsetWidth; pic.classList.add("zoom", "show");
            }, s === 0 ? 0 : 280);
          }
          showBeat();
        };

        next.addEventListener("click", () => {
          if (s < 0 || done) return;
          Sfx.play("next");
          const scr = SCREENS[s];
          if (b < scr.beats.length - 1) { b++; showBeat(); }
          else if (s < SCREENS.length - 1) showScreen(s + 1);
          else { Sfx.play("whoosh"); finish(); }
        });
        // Skip asks once, like the story's Skip
        const skip = el.querySelector(".ob-skip");
        skip.addEventListener("click", () => {
          if (skip.classList.contains("confirm")) return finish();
          skip.classList.add("confirm");
          skip.textContent = t("skipConfirm");
          setTimeout(() => { skip.classList.remove("confirm"); skip.textContent = t("skip"); }, 2500);
        });
        Onboard.isOpen = () => !done;
        requestAnimationFrame(() => { el.classList.add("in"); showScreen(0); });
      });
    },
    isOpen() { return false; },
  };

  window.Onboard = Onboard;
})();
