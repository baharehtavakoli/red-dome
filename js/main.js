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
      probe.src = "assets/ui/btn_gold.png";
    }

    // Swap placeholders for real art as PNGs are found.
    Art.probe(Art.allPaths(), U.debounce(() => {
      Scene.renderArt();
      Board.render();
      Orders.render();
      Debug.build();
      UI.showInfo(Board.selected);
    }, 60));

    setInterval(() => UI.tick(), 1000);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) State.saveNow();
      else UI.tick();
    });
    window.addEventListener("pagehide", () => State.saveNow());

    if (!State.d.seenIntro) {
      setTimeout(() => Scene.playIntro().then(() => { State.d.seenIntro = true; State.save(); }), 500);
    }
    State.save();

    // Handy for poking around in the console.
    window.RD = { State, Board, Orders, Scene, Dialogue, UI, Debug };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
