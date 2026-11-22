/* Onboarding: the story before the game, as 5 full-screen picture panels.
   Each screen has one or more beats; tap Next to show the next beat. A beat can change the picture
   (img) and put characters on it (cast: half-body portraits, left to right) or a speaker tag (who).
   The last screen ends on a button that starts the game.
   Pictures are keys of GAME_CONFIG.scene.intro ("scene" = the blueprint background); a missing
   picture falls back to the next key in `img`, so new art can be added later in config.js. */
(function () {
  const SCREENS = [
    { beats: [
      { key: "ob1a", img: ["bahram", "sky"] },
      { key: "ob1b", img: ["sky"] },
    ] },
    { beats: [{ key: "ob2", img: ["ladies", "sky"] }] },
    { beats: [{ key: "ob3", img: ["plateau", "ray"], cast: ["shideh"] }] },
    { beats: [
      { key: "ob4a", img: ["domeTop", "ray"] },
      { key: "ob4b", img: ["meet"], who: "shideh", quote: true },
    ] },
    { beats: [{ key: "ob5", img: ["build", "scene"] }], cta: "obStart" },
  ];

  function src(keys) {
    const all = Object.assign({ scene: GAME_CONFIG.scene.background }, GAME_CONFIG.scene.intro || {});
    const last = keys[keys.length - 1];
    for (const k of keys) {
      const p = all[k];
      if (p && (k === last || !GAME_CONFIG.tryImages || Art.has(p))) return p;
    }
    return all[last] || "";
  }

  const Onboard = {
    /* pictures the first screens need, for the loader in main.js */
    firstImages() {
      const I = GAME_CONFIG.scene.intro || {};
      const want = (keys) => keys.map((k) => I[k]).find(Boolean);  // the picture we hope to show, loaded or not
      return [want(SCREENS[0].beats[0].img), want(SCREENS[0].beats[1].img), want(SCREENS[1].beats[0].img)];
    },

    play() {
      return new Promise((resolve) => {
        const el = document.createElement("div");
        el.id = "onboard";
        el.innerHTML = `
          <div class="ob-pic"><img alt="" draggable="false"></div>
          <div class="ob-cast"></div>
          <div class="ob-shade"></div>
          <button class="ob-skip">${t("skip")}</button>
          <div class="ob-card">
            <div class="ob-box"><div class="ob-who"></div><p class="ob-text"></p></div>
            <div class="ob-foot">
              <button class="btn ghost ob-prev">${t("obPrev")}</button>
              <div class="ob-dots">${SCREENS.map(() => "<i></i>").join("")}</div>
              <button class="btn gold ob-next"></button>
            </div>
          </div>`;
        document.body.appendChild(el);
        const img = el.querySelector(".ob-pic img"), pic = el.querySelector(".ob-pic"), castEl = el.querySelector(".ob-cast");
        const textEl = el.querySelector(".ob-text"), whoEl = el.querySelector(".ob-who");
        const prev = el.querySelector(".ob-prev");
        const next = el.querySelector(".ob-next"), dots = [...el.querySelectorAll(".ob-dots i")];
        let s = -1, b = 0, done = false, castKey = "";

        const finish = () => {
          if (done) return;
          done = true;
          el.classList.add("out");
          setTimeout(() => { el.remove(); resolve(); }, 500);
        };

        const setPicture = (p) => {
          if (img.getAttribute("src") === p) return;
          const swap = () => {
            img.setAttribute("src", p);
            pic.classList.remove("zoom"); void pic.offsetWidth; pic.classList.add("zoom", "show");
          };
          if (!img.getAttribute("src")) return swap();
          pic.classList.remove("show");
          setTimeout(swap, 280);
        };

        const setCast = (cast) => {
          const key = (cast || []).join(",");
          if (key === castKey) return;
          castKey = key;
          const had = !!castEl.innerHTML;
          castEl.classList.remove("show");
          setTimeout(() => {
            castEl.className = `ob-cast n${(cast || []).length}`;
            castEl.innerHTML = (cast || []).map((w) => {
              const c = CHARACTERS[w];
              return c ? `<div class="ob-actor ${w}">${Art.html(c.portrait, c.emoji, "ob-portrait")}</div>` : "";
            }).join("");
            if (cast && cast.length) setTimeout(() => castEl.classList.add("show"), 40);
          }, had ? 250 : 0);
        };

        const showBeat = () => {
          const scr = SCREENS[s], beat = scr.beats[b];
          if (beat.img) setPicture(src(beat.img));
          setCast(beat.cast);
          // the name tag goes on the speaker; a lone portrait is named on screen too
          const w = beat.who || (beat.cast && beat.cast.length === 1 ? beat.cast[0] : null);
          const c = w && CHARACTERS[w];
          whoEl.textContent = c ? c.name : "";
          whoEl.classList.toggle("show", !!c);
          el.classList.toggle("quote", !!beat.quote);
          textEl.textContent = t(beat.key);
          textEl.classList.remove("in"); void textEl.offsetWidth; textEl.classList.add("in");
          const last = b === scr.beats.length - 1;
          next.textContent = last && scr.cta ? t(scr.cta) : t("obNext");
          next.classList.toggle("cta", !!(last && scr.cta));
          el.querySelector(".ob-skip").style.visibility = scr.cta ? "hidden" : "";
          prev.style.visibility = s === 0 && b === 0 ? "hidden" : "";
        };

        const showScreen = (i, beat = 0) => {
          s = i; b = beat;
          dots.forEach((d, j) => d.classList.toggle("on", j <= i));
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
        // Previous: one beat back, or the last beat of the screen before
        prev.addEventListener("click", () => {
          if (s < 0 || done) return;
          Sfx.play("next");
          if (b > 0) { b--; showBeat(); }
          else if (s > 0) showScreen(s - 1, SCREENS[s - 1].beats.length - 1);
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
        showScreen(0);
        setTimeout(() => el.classList.add("in"), 30);
      });
    },
    isOpen() { return false; },
  };

  window.Onboard = Onboard;
})();
