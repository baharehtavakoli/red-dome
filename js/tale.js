/* Tale nights: Nasrin-Nush's tale, told as an illustrated storybook apart from the building site.
   A dome part opens one with `tale: "<id>"` (config.js -> domeParts); the pages are in
   config.js -> GAME_CONFIG.tales. Each page has a picture and one line of narration (i18n key).
   After the last page the tale's mission starts (js/mission.js), if it isn't done yet.
   A page picture that hasn't been drawn yet falls back to `fallback` (shown with `fit`). */
(function () {
  const Tale = {
    open: false,

    play(id, opts = {}) {
      const tale = (GAME_CONFIG.tales || {})[id];
      if (!tale) return Promise.resolve();
      const wasBusy = Scene.busy;
      Scene.busy = true;
      this.open = true;
      return new Promise((resolve) => {
        const pages = tale.pages;
        const host = CHARACTERS[tale.host || "nasrin"];
        const el = document.createElement("div");
        el.id = "tale";
        el.innerHTML = `
          <div class="tl-book">
            <div class="tl-head"><small>${t(tale.kicker)}</small><b>${t(tale.title)}</b></div>
            <div class="tl-page">
              <div class="tl-pic"><img alt="" draggable="false"></div>
              <p class="tl-text"></p>
              <span class="tl-num"></span>
            </div>
            <div class="tl-foot">
              <button class="btn ghost tl-prev">${t("obPrev")}</button>
              <button class="btn gold tl-next"></button>
            </div>
          </div>
          <div class="tl-teller">${host ? Art.html(host.avatar || host.portrait, host.emoji, "tl-face") : ""}<span>${host ? U.esc(host.name) : ""}</span></div>`;
        document.body.appendChild(el);
        const page = el.querySelector(".tl-page"), img = el.querySelector(".tl-pic img"), pic = el.querySelector(".tl-pic");
        const text = el.querySelector(".tl-text"), num = el.querySelector(".tl-num");
        const prev = el.querySelector(".tl-prev"), next = el.querySelector(".tl-next");
        let i = -1, busy = false, done = false;

        const srcOf = (p) => (p.img && (!GAME_CONFIG.tryImages || Art.has(p.img)) ? { src: p.img, fit: "cover" } : { src: p.fallback || p.img, fit: p.fit || "cover" });

        const show = (n, dir) => {
          if (busy || n < 0 || n >= pages.length) return;
          busy = true;
          const draw = () => {
            i = n;
            const p = pages[i], s = srcOf(p);
            img.setAttribute("src", s.src || "");
            pic.dataset.fit = s.fit;
            text.textContent = t(p.key);
            num.textContent = `${i + 1} / ${pages.length}`;
            prev.style.visibility = i === 0 ? "hidden" : "";
            next.textContent = i === pages.length - 1 ? t(opts.replay || !tale.mission ? "taleClose" : "taleOn") : t("obNext");
            page.classList.remove("turn-out-next", "turn-out-prev");
            if (dir) page.classList.add(dir > 0 ? "turn-in-next" : "turn-in-prev");
            setTimeout(() => { page.classList.remove("turn-in-next", "turn-in-prev"); busy = false; }, dir ? 380 : 0);
          };
          if (!dir) return draw();
          Sfx.play("next");
          page.classList.add(dir > 0 ? "turn-out-next" : "turn-out-prev");
          setTimeout(draw, 260);
        };

        const close = () => {
          if (done) return;
          done = true;
          el.classList.remove("in");
          setTimeout(async () => {
            el.remove();
            this.open = false;
            // the tale leads into its mission: the player now takes the test from the story
            if (!opts.replay && tale.mission) await Mission.play(tale.mission);
            Scene.busy = wasBusy;
            Mission.refresh();
            resolve();
          }, 450);
        };

        next.addEventListener("click", () => { if (i < pages.length - 1) show(i + 1, 1); else close(); });
        prev.addEventListener("click", () => show(i - 1, -1));
        Sfx.play("whoosh");
        show(0, 0);
        setTimeout(() => el.classList.add("in"), 30);
      });
    },
  };

  window.Tale = Tale;
})();
