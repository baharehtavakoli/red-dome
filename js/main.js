/* Boot: load save, wire modules, start on the Dome Scene. */
(function () {
  function boot() {
    State.load();
    State.tickEnergy();
    Orders.ensure();

    Board.init(document.getElementById("board"));
    Orders.init(document.getElementById("orders"));
    Scene.init();
    Dialogue.init();
    UI.init();
    Debug.init();

    Board.render();
    Orders.render();
    UI.updateTop();
    UI.showInfo(-1);
    UI.layoutBoard();
    window.addEventListener("orientationchange", () => setTimeout(() => { UI.layoutBoard(); Scene.applyCamera(false); }, 200));

    // Painted UI skin (css/skin.css) switches on once its PNGs are present.
    if (GAME_CONFIG.tryImages) {
      const probe = new Image();
      probe.onload = () => { document.documentElement.classList.add("ui-art"); UI.layoutBoard(); };
      probe.src = "assets/ui/btn_gold.webp";
    }

    // Swap placeholders for real art as PNGs are found.
    Art.probe(Art.allPaths(), U.debounce(() => {
      Scene.renderArt();
      Board.render();
      Orders.render();
      Debug.build();
      UI.showInfo(Board.selected);
      Dialogue.refreshArt();
    }, 60));

    setInterval(() => UI.tick(), 1000);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) State.saveNow();
      else UI.tick();
    });
    window.addEventListener("pagehide", () => State.saveNow());

    if (!State.d.seenIntro) {
      // lock the scene while the intro's art loads, so the board can't be opened under it
      Scene.busy = true;
      document.getElementById("scene-screen").classList.add("cinematic");
      // Online the art takes a moment to download: wait (up to 5 s) for the background and the
      // intro's portraits so the first scene doesn't open on placeholders.
      const need = [GAME_CONFIG.scene.background]
        .concat(((STORY.intro && STORY.intro.cast) || []).map((w) => CHARACTERS[w] && CHARACTERS[w].portrait));
      const t0 = Date.now();
      const start = () => { Scene.busy = false; return Scene.playIntro(); };
      const startIntro = () => start().then(() => { State.d.seenIntro = true; State.save(); });
      (function wait() {
        if (!GAME_CONFIG.tryImages || need.every((p) => !p || Art.has(p)) || Date.now() - t0 > 5000) setTimeout(startIntro, 300);
        else setTimeout(wait, 100);
      })();
    }
    State.save();

    // Phone Back button: closes the top layer (window, story, board) instead of leaving the game.
    // A guard entry in the history catches Back; on the main screen a second Back leaves.
    const arm = () => { try { history.pushState({ rd: 1 }, ""); } catch (e) {} };
    arm();
    window.addEventListener("popstate", () => {
      if (document.querySelector("#modal-root .modal")) {
        if (!document.querySelector("#modal-root .modal.ad")) UI.closeModal();
        arm();
      } else if (Dialogue.isPlaying()) {
        arm(); // stories are skipped with the Skip button, not by accident
      } else if (Scene.boardOpen()) {
        Scene.closeBoard();
        arm();
      } else {
        UI.toast("Press Back again to leave the game");
        setTimeout(arm, 2500); // after a while, Back is caught again
      }
    });

    // Offline cache + "Add to Home screen" (only on the real site; local testing stays uncached).
    if ("serviceWorker" in navigator && location.protocol === "https:") {
      const reg = () => navigator.serviceWorker.register("sw.js").catch(() => {});
      if (document.readyState === "complete") reg(); else window.addEventListener("load", reg, { once: true });
    }
    // Ask the browser to keep the save even when storage runs low.
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

    // Handy for poking around in the console.
    window.RD = { State, Board, Orders, Scene, Dialogue, UI, Debug };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
