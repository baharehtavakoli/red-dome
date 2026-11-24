/* Order cards: generation, availability checks, delivery. */
(function () {
  const oc = () => GAME_CONFIG.orders;

  const Orders = {
    el: null,
    slotEls: [],

    init(el) {
      this.el = el;
      el.innerHTML = "";
      this.slotEls = [];
      for (let s = 0; s < oc().slots; s++) {
        const d = document.createElement("div");
        d.className = "order-slot";
        el.appendChild(d);
        this.slotEls.push(d);
      }
      el.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-deliver]");
        if (btn) return this.deliver(+btn.dataset.deliver);
        const req = e.target.closest("[data-req]");
        if (req) {
          const [s, k] = req.dataset.req.split(":").map(Number);
          const it = State.d.orders[s].items[k];
          const def = U.item(it.chain, it.level), who = CHARACTERS[State.d.orders[s].who];
          return UI.openChain(it.chain, it.level, t("wants", { who: who ? who.name : t("someone"), item: def.name }));
        }
        const who = e.target.closest("[data-who]");
        if (who) {
          const o = State.d.orders[+who.dataset.who];
          if (o) UI.toast(t("orderLine", { who: CHARACTERS[o.who].name, line: this.lineFor(o) }));
        }
      });
    },

    ensure() {
      const o = State.d.orders, n = oc().slots;
      while (o.length < n) o.push(null);
      o.length = n;
      for (let s = 0; s < n; s++) if (!o[s]) o[s] = this.generate(s);
    },

    /* A new order should be something to make, not something already lying on the board
       (a fresh game opened with an order ready to deliver): re-roll up to a few times. */
    generate(slot) {
      let o = null;
      for (let k = 0; k < 12; k++) { o = this.roll(slot); if (!this.find(o)) break; }
      return o;
    },

    roll(slot) {
      const cfg = oc();
      const busy = State.d.orders.filter((o, j) => o && j !== slot).map((o) => o.who);
      let givers = Object.keys(cfg.givers).filter((w) => !busy.includes(w) && CHARACTERS[w]);
      if (!givers.length) givers = Object.keys(cfg.givers).filter((w) => CHARACTERS[w]);
      const who = U.pick(givers);

      const maxAllowed = cfg.baseMaxLevel + State.partsRestored() * cfg.levelPerPart;
      const count = Math.random() < cfg.twoItemChance ? 2 : 1;
      const items = [];
      const usedChains = new Set();

      for (const chain of U.shuffle(cfg.givers[who].chains)) {
        if (items.length >= count) break;
        if (usedChains.has(chain) || !CHAINS[chain]) continue;
        const options = CHAINS[chain].items
          .map((it, k) => ({ it, level: k + 1 }))
          .filter((x) => x.it.orderable !== false && x.level <= maxAllowed);
        if (!options.length) continue;
        // Favour higher levels: weight = level.
        const total = options.reduce((s, x) => s + x.level, 0);
        let roll = Math.random() * total, chosen = options[0];
        for (const x of options) { roll -= x.level; if (roll <= 0) { chosen = x; break; } }
        items.push({ chain, level: chosen.level });
        usedChains.add(chain);
      }
      if (!items.length) items.push({ chain: Object.keys(CHAINS)[0], level: 1 });

      const stars = items.reduce((s, it) => s + (cfg.starReward[it.level - 1] ?? it.level * it.level), 0) +
        (items.length > 1 ? cfg.twoItemBonus : 0);
      return { id: ++State.d.orderSeq, who, items, stars };
    },

    /* What the giver says about an order: the (first) item and what it's for on the building,
       in their own words. Built when shown, so it follows the current language. */
    lineFor(o) {
      const req = o.items[0], def = req && U.item(req.chain, req.level);
      if (!def) return "";
      const who = ["mehrab", "shideh", "golnar"].includes(o.who) ? o.who : "shideh";
      const name = I18N.lang === "fa" ? def.name : def.name.toLowerCase();
      return t(`ord_${who}${o.id % 3}`, { item: name, use: t("use_" + def.id) });
    },

    /* Board indices that would fill this order, or null. */
    find(order) {
      const used = new Set(), out = [];
      for (const req of order.items) {
        const k = State.d.board.findIndex((c, idx) =>
          c && c.t === "item" && c.chain === req.chain && c.level === req.level && !used.has(idx));
        if (k < 0) return null;
        used.add(k);
        out.push(k);
      }
      return out;
    },

    has(req) {
      return State.d.board.some((c) => c && c.t === "item" && c.chain === req.chain && c.level === req.level);
    },

    wantedKeys() {
      const set = new Set();
      State.d.orders.forEach((o) => o && o.items.forEach((it) => set.add(U.key(it.chain, it.level))));
      return set;
    },

    render() {
      State.d.orders.forEach((o, s) => this.renderSlot(s));
    },

    renderSlot(s) {
      const el = this.slotEls[s], o = State.d.orders[s];
      let html;
      if (!o) {
        html = `<div class="order empty"><span class="dots">• • •</span></div>`;
      } else {
        const ch = CHARACTERS[o.who];
        const ready = !!this.find(o);
        const reqs = o.items.map((it, k) => {
          const def = U.item(it.chain, it.level), have = this.has(it);
          return `<div class="req${have ? " have" : ""}" style="--c:${CHAINS[it.chain].color};${U.slotVar(it.chain)}" data-req="${s}:${k}">` +
            `${Art.html(def.icon, def.emoji)}<span class="lvl">${it.level}</span>${have ? '<span class="check">✓</span>' : ""}</div>`;
        }).join("");
        html = `<div class="order${ready ? " ready" : ""}">
          <div class="order-head" data-who="${s}">
            <div class="avatar" style="--who:${ch.color}">${Art.html(ch.avatar, ch.emoji)}</div>
            <div class="who-name">${U.esc(ch.name)}</div>
          </div>
          <div class="reqs">${reqs}</div>
          <button class="deliver${ready ? "" : " off"}" data-deliver="${s}" aria-disabled="${!ready}">${ready ? t("deliver") + " " : ""}⭐${o.stars}</button>
        </div>`;
      }
      if (el._html !== html) {
        el.innerHTML = html;
        el._html = html;
      }
    },

    deliver(s) {
      const o = State.d.orders[s];
      if (!o) return;
      Board.onCancel(); // a drag in progress with another finger must not drop a delivered item
      const idx = this.find(o);
      if (!idx) {
        Sfx.play("error");
        const missing = o.items.filter((it) => !this.has(it)).map((it) => U.item(it.chain, it.level).name);
        UI.toast(missing.length ? t("missing", { items: missing.join(t("and")) }) : t("bothNeeded"));
        const card = this.slotEls[s].firstElementChild;
        if (card) { card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake"); }
        return;
      }

      const cardRect = this.slotEls[s].getBoundingClientRect();
      idx.forEach((k) => {
        const p = Board.piece(k);
        if (p) UI.flyTo(Board.rect(k), cardRect, p.outerHTML);
        State.d.board[k] = null;
        if (Board.selected === k) Board.selected = -1;
      });
      Sfx.play("deliver");
      State.d.stars += o.stars;
      State.d.ordersDone++;
      State.d.orders[s] = null;
      State.save();
      Board.render();
      this.render();
      UI.updateTop(true);
      UI.showInfo(Board.selected);

      setTimeout(() => {
        UI.sparkle(cardRect);
        Sfx.play("stars");
        UI.floatText(cardRect, `+${o.stars} ⭐`);
      }, 260);

      setTimeout(() => {
        if (State.d.orders[s]) return;
        State.d.orders[s] = this.generate(s);
        State.save();
        this.render();
        Board.render();
        const card = this.slotEls[s].firstElementChild;
        if (card) { card.classList.add("arrive"); Sfx.play("arrive"); }
      }, oc().refillDelayMs + 300);
    },

    reroll() {
      State.d.orders = State.d.orders.map(() => null);
      this.ensure();
      State.save();
      this.render();
      Board.render();
    },
  };

  window.Orders = Orders;
})();
