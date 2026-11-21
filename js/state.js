/* Game state: creation, save/load (localStorage), energy regeneration.
   Board cells are: null | {t:"item", chain, level} | {t:"gen", chain} | {t:"tal", hides?} */
(function () {
  const SAVE_KEY = "reddome_save_v1";
  const VERSION = 1;
  const cfg = () => window.GAME_CONFIG;

  function cellFromLegend(def) {
    if (!def) return null;
    if (def.talisman) return def.hides ? { t: "tal", hides: { ...def.hides } } : { t: "tal" };
    if (def.gen) return { t: "gen", chain: def.gen };
    if (def.chain) return { t: "item", chain: def.chain, level: def.level || 1 };
    return null;
  }

  function validCell(c) {
    if (!c) return null;
    if (c.t === "tal") return c;
    if (!window.CHAINS[c.chain]) return null;
    if (c.t === "gen") return c;
    if (c.t === "item") {
      c.level = Math.max(1, Math.min(U.maxLevel(c.chain), c.level | 0));
      return c;
    }
    return null;
  }

  const State = {
    d: null,

    buildBoard() {
      const { cols, rows, layout, legend } = cfg();
      const cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ch = (layout[r] || "")[c] || ".";
          cells.push(cellFromLegend(legend[ch]));
        }
      }
      return cells;
    },

    newGame() {
      this.d = {
        version: VERSION,
        energy: cfg().energy.start,
        energyStamp: Date.now(),
        stars: cfg().startStars,
        board: this.buildBoard(),
        orders: [],
        orderSeq: 0,
        ordersDone: 0,
        dome: cfg().domeParts.map(() => false),
        seenIntro: false,
        ads: { day: "", count: 0 },
      };
    },

    load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          let d = null;
          try { d = JSON.parse(raw); } catch (e) { d = null; }
          const size = cfg().cols * cfg().rows;
          if (d && d.version === VERSION && Array.isArray(d.board) && d.board.length === size) {
            this.d = d;
            this.sanitize();
            return true;
          }
          // Old or changed save: keep a copy, then carry over progress instead of wiping it.
          this.backup(raw);
          this.newGame();
          if (d && typeof d === "object") {
            const keep = ["stars", "energy", "energyStamp", "ordersDone", "orderSeq", "seenIntro", "dome", "ads"];
            keep.forEach((k) => { if (d[k] !== undefined) this.d[k] = d[k]; });
            this.sanitize();
            console.warn("Save migrated: progress kept, board reset.");
          }
          return true;
        }
      } catch (e) {
        console.warn("Save could not be read, starting fresh.", e);
      }
      this.newGame();
      return false;
    },

    backup(raw) {
      try { localStorage.setItem(SAVE_KEY + "_backup", raw); } catch (e) {}
    },

    /* Keep old saves working after chains.js / config.js edits. */
    sanitize() {
      const d = this.d;
      d.board = d.board.map(validCell);
      const parts = cfg().domeParts.length;
      d.dome = Array.from({ length: parts }, (_, i) => !!(d.dome && d.dome[i]));
      d.orders = (d.orders || []).map((o) =>
        o && Array.isArray(o.items) && Number.isFinite(o.stars) && window.CHARACTERS[o.who] &&
        o.items.every((it) => U.item(it.chain, it.level)) ? o : null
      );
      d.energy = Number.isFinite(d.energy) ? d.energy : cfg().energy.start;
      d.energyStamp = Number.isFinite(d.energyStamp) ? d.energyStamp : Date.now();
      d.stars = Number.isFinite(d.stars) ? d.stars : 0;
      d.ordersDone = d.ordersDone || 0;
      d.orderSeq = d.orderSeq || 0;
      d.seenIntro = !!d.seenIntro;
      d.ads = d.ads && typeof d.ads === "object" ? d.ads : { day: "", count: 0 };
    },

    save() {
      clearTimeout(this._t);
      this._t = setTimeout(() => this.saveNow(), 150);
    },

    saveNow() {
      clearTimeout(this._t);
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.d));
      } catch (e) {
        console.warn("Could not save", e);
      }
    },

    reset() {
      try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
      this.newGame();
      this.saveNow();
    },

    /* Applies passive regeneration. Returns true if energy changed. */
    tickEnergy() {
      const d = this.d, e = cfg().energy, now = Date.now(), step = e.regenSeconds * 1000;
      if (d.energyStamp > now) d.energyStamp = now; // phone clock was set back
      if (d.energy >= e.max) {
        d.energyStamp = now;
        return false;
      }
      const gained = Math.floor((now - d.energyStamp) / step);
      if (gained <= 0) return false;
      d.energy = Math.min(e.max, d.energy + gained);
      d.energyStamp = d.energy >= e.max ? now : d.energyStamp + gained * step;
      return true;
    },

    secondsToNextEnergy() {
      const e = cfg().energy;
      if (this.d.energy >= e.max) return 0;
      return (e.regenSeconds * 1000 - (Date.now() - this.d.energyStamp)) / 1000;
    },

    secondsToFull() {
      const e = cfg().energy, missing = e.max - this.d.energy;
      if (missing <= 0) return 0;
      return this.secondsToNextEnergy() + (missing - 1) * e.regenSeconds;
    },

    addEnergy(n) {
      this.tickEnergy();
      this.d.energy = Math.max(0, this.d.energy + n);
      this.save();
    },

    /* Rewarded ads left today (energy.adsPerDay; 0 or missing = unlimited). */
    adsLeft() {
      const cap = cfg().energy.adsPerDay;
      if (!cap) return Infinity;
      const today = new Date().toDateString();
      if (this.d.ads.day !== today) this.d.ads = { day: today, count: 0 };
      return Math.max(0, cap - this.d.ads.count);
    },
    useAd() {
      this.adsLeft();
      this.d.ads.count++;
      this.save();
    },

    partsRestored() {
      return this.d.dome.filter(Boolean).length;
    },
  };

  window.State = State;
})();
