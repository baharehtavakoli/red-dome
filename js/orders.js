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
          return UI.openChain(it.chain, it.level, `${who ? who.name : "Someone"} wants a ${def.name}.`);
        }
        const who = e.target.closest("[data-who]");
        if (who) {
          const o = State.d.orders[+who.dataset.who];
          if (o) UI.toast(`${CHARACTERS[o.who].name}: “${o.line}”`);
        }
      });
    },

    ensure() {
      const o = State.d.orders, n = oc().slots;
      while (o.length < n) o.push(null);
      o.length = n;
      for (let s = 0; s < n; s++) if (!o[s]) o[s] = this.generate(s);
    },

    generate(slot) {
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
      const lines = (window.ORDER_LINES && ORDER_LINES[who]) || [""];
      return { id: ++State.d.orderSeq, who, items, stars, line: U.pick(lines) };
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
          <button class="deliver" data-deliver="${s}"${ready ? "" : " disabled"}>${ready ? "Deliver " : ""}⭐${o.stars}</button>
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
      const idx = this.find(o);
      if (!idx) { UI.toast("Some items are still missing."); return; }

      const cardRect = this.slotEls[s].getBoundingClientRect();
      idx.forEach((k) => {
        const p = Board.piece(k);
        if (p) UI.flyTo(Board.rect(k), cardRect, p.outerHTML);
        State.d.board[k] = null;
        if (Board.selected === k) Board.selected = -1;
      });
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
        UI.floatText(cardRect, `+${o.stars} ⭐`);
      }, 260);

      setTimeout(() => {
        if (State.d.orders[s]) return;
        State.d.orders[s] = this.generate(s);
        State.save();
        this.render();
        Board.render();
        const card = this.slotEls[s].firstElementChild;
        if (card) card.classList.add("arrive");
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
