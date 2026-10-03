/*
 * cart.js — the cart: one small state module + the cart drawer.
 *
 * Saved in localStorage under "bazariya_cart_v1" as [{ id, qty, note }] ONLY.
 * Names, prices, photos and stock always come from the current catalogue,
 * so price changes in the Sheet apply to returning customers too.
 *
 * Everything that shows the cart (badge, drawer) listens for changes via
 * subscribe(), so there is only one copy of the cart state.
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});
  var t = function (k, v) { return BZ.i18n.t(k, v); };
  var el, icon;

  var STORAGE_KEY = "bazariya_cart_v1";
  var NOTE_MAX = 120;

  var config = null;
  var items = [];           // [{ id, qty, note }]
  var listeners = [];
  var drawer = null;        // the drawer layer while it is open

  // ---------- storage (always in try/catch: private mode can block it) ----------

  function readStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { /* cart stays in memory */ }
  }

  // Keep only valid items: product exists and is in stock, qty within limits.
  // Returns true if something had to be removed.
  function sanitize(list) {
    var removed = false;
    var seen = {};
    var clean = [];
    list.forEach(function (raw) {
      var id = parseInt(raw && raw.id, 10);
      var product = BZ.catalogue.findById(id);
      if (!product || !product.inStock || seen[id]) { removed = true; return; }
      var qty = Math.min(Math.max(parseInt(raw.qty, 10) || 0, 0), config.maxQtyPerItem);
      if (qty < 1) return;
      seen[id] = true;
      clean.push({ id: id, qty: qty, note: String(raw.note || "").slice(0, NOTE_MAX) });
    });
    items = clean;
    return removed;
  }

  function changed() {
    save();
    listeners.forEach(function (fn) { fn(); });
  }

  // ---------- state API ----------

  function find(id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }

  // Add qty of a product (adds to what is already there, capped).
  function add(id, qty) {
    var item = find(id);
    if (item) item.qty = Math.min(item.qty + qty, config.maxQtyPerItem);
    else items.push({ id: id, qty: Math.min(qty, config.maxQtyPerItem), note: "" });
    changed();
  }

  // Set an exact quantity; 0 removes the line.
  function setQty(id, qty) {
    var item = find(id);
    if (!item) return;
    if (qty <= 0) return remove(id);
    item.qty = Math.min(qty, config.maxQtyPerItem);
    changed();
  }

  function setNote(id, note) {
    var item = find(id);
    if (!item) return;
    item.note = String(note || "").replace(/\s+/g, " ").trim().slice(0, NOTE_MAX);
    save(); // no re-render while typing
  }

  function remove(id) {
    items = items.filter(function (i) { return i.id !== id; });
    changed();
  }

  function clear() {
    items = [];
    changed();
  }

  function qtyOf(id) {
    var item = find(id);
    return item ? item.qty : 0;
  }

  // Cart lines joined with current product data.
  function lines() {
    return items.map(function (i) {
      return { product: BZ.catalogue.findById(i.id), qty: i.qty, note: i.note };
    }).filter(function (l) { return l.product; });
  }

  // { count: total quantity, total: rupees }
  function summary() {
    var ls = lines();
    return {
      count: ls.reduce(function (n, l) { return n + l.qty; }, 0),
      total: BZ.whatsapp.totalPaise(ls) / 100,
    };
  }

  function subscribe(fn) { listeners.push(fn); }

  // ---------- header badge ----------

  function updateBadge() {
    var count = summary().count;
    var badge = document.getElementById("cart-count");
    var label = document.querySelector("#cart-button .visually-hidden");
    badge.textContent = String(count);
    badge.hidden = count === 0;
    if (label) label.textContent = count ? t("openCartCount", { count: count }) : t("openCart");
  }

  // ---------- drawer ----------

  function freeDeliveryBox(totalRupees) {
    var threshold = config.freeShippingAbove;
    var left = threshold - totalRupees;
    var percent = Math.max(0, Math.min(100, (totalRupees / threshold) * 100));
    var reached = left <= 0;
    var text = reached
      ? el("p", { class: "free-box__text" }, [el("strong", { text: t("youGetFreeDelivery") })])
      : el("p", { class: "free-box__text" }, [
          t("addMoreA") + " ",
          el("strong", { text: BZ.config.money(Math.ceil(left), config) }),
          " " + t("addMoreB"),
        ]);
    return el("div", { class: "free-box" + (reached ? " free-box--reached" : "") }, [
      el("div", { class: "free-box__row" }, [icon(reached ? "check" : "truck"), text]),
      el("div", {
        class: "progress",
        role: "progressbar",
        "aria-valuemin": "0",
        "aria-valuemax": String(threshold),
        "aria-valuenow": String(Math.min(Math.round(totalRupees), threshold)),
        "aria-label": t("freeDeliveryProgress"),
      }, [el("span", { class: "progress__bar", style: "width:" + percent.toFixed(1) + "%" })]),
    ]);
  }

  function stepper(id, qty, labelName) {
    var minus = el("button", { type: "button", class: "stepper__btn", "data-cart-action": "minus", "data-id": id, "aria-label": t("decreaseQty", { name: labelName }) }, [icon("minus")]);
    var plus = el("button", { type: "button", class: "stepper__btn stepper__btn--dark", "data-cart-action": "plus", "data-id": id, "aria-label": t("increaseQty", { name: labelName }), disabled: qty >= config.maxQtyPerItem }, [icon("plus")]);
    return el("div", { class: "stepper" }, [
      minus,
      el("span", { class: "stepper__value", "aria-live": "polite", "aria-label": t("quantityIs", { qty: qty }), text: String(qty) }),
      plus,
    ]);
  }

  function row(line) {
    var p = line.product;
    var unitText = BZ.config.money(p.price, config);
    var noteId = "note-" + p.id;
    var name = BZ.catalogue.displayName(p);

    var noteToggle = el("button", { type: "button", class: "note-toggle", "data-cart-action": "note", "data-id": p.id, "aria-expanded": "false", "aria-controls": noteId + "-box" }, [
      icon("note"),
      el("span", { class: "note-toggle__text", text: line.note || t("addNote") }),
    ]);
    var noteBox = el("div", { class: "note-box", id: noteId + "-box", hidden: true }, [
      el("label", { for: noteId, class: "note-box__label", text: t("noteLabel") }),
      el("input", { id: noteId, class: "note-box__input", type: "text", maxlength: String(NOTE_MAX), "data-note-for": p.id, value: line.note, placeholder: t("notePlaceholder"), autocomplete: "off", enterkeyhint: "done" }),
      el("p", { class: "note-box__count", "aria-live": "polite", text: line.note.length + " / " + NOTE_MAX }),
    ]);

    return el("li", { class: "cart-row", "data-id": p.id }, [
      el("div", { class: "cart-row__top" }, [
        el("div", { class: "cart-row__img" }, [BZ.ui.img(p.image, "")]),
        el("div", { class: "cart-row__info" }, [
          el("h3", { class: "cart-row__name", text: name }),
          el("p", { class: "cart-row__meta", text: t("itemNo", { id: p.id }) + " · " + unitText + " × " + line.qty }),
        ]),
        el("p", { class: "cart-row__total", text: BZ.config.money(p.price * line.qty, config) }),
      ]),
      el("div", { class: "cart-row__controls" }, [
        stepper(p.id, line.qty, name),
        noteToggle,
        el("button", { type: "button", class: "button button--danger", "data-cart-action": "remove", "data-id": p.id, "aria-label": t("removeItem", { name: name }), text: t("remove") }),
      ]),
      noteBox,
    ]);
  }

  // Build or rebuild the inside of the drawer.
  function renderDrawer() {
    if (!drawer) return;
    var body = drawer.querySelector(".cart__content");
    var footer = drawer.querySelector(".cart__footer");
    // Keep focus on the same control after re-rendering (e.g. the + button).
    var active = document.activeElement;
    var focusKey = active && active.getAttribute && active.getAttribute("data-cart-action")
      ? active.getAttribute("data-cart-action") + ":" + active.getAttribute("data-id") : null;

    body.textContent = "";
    footer.textContent = "";
    var ls = lines();
    var sum = summary();

    if (!ls.length) {
      body.appendChild(el("div", { class: "state state--empty" }, [
        el("h3", { class: "state__title" }, [t("cartEmptyA") + " ", el("em", { text: t("cartEmptyB") })]),
        el("p", { class: "state__text", text: t("cartEmptyText") }),
        el("button", { type: "button", class: "button button--primary", "data-close": true, text: t("startShopping") }),
      ]));
    } else {
      body.appendChild(freeDeliveryBox(sum.total));
      var list = el("ul", { class: "cart-list" });
      ls.forEach(function (l) { list.appendChild(row(l)); });
      body.appendChild(list);
    }

    var free = sum.total >= config.freeShippingAbove;
    var sendBtn = el("button", {
      type: "button",
      class: "button button--accent button--block button--lg",
      "data-cart-action": "send",
      disabled: !ls.length || !config.canOrder,
    }, [icon("chat"), el("span", { text: t("sendOrderWhatsApp") })]);

    footer.appendChild(el("div", { class: "cart__total-row" }, [
      el("span", { text: t(sum.count === 1 ? "totalOneItem" : "totalItems", { count: sum.count }) }),
      el("strong", { class: "cart__total", text: BZ.config.money(sum.total, config, true) }),
    ]));
    footer.appendChild(el("p", { class: "cart__footnote", text: ls.length ? (free ? t("freeDeliveryPayCash") : t("deliveryConfirmedPayCash")) : "" }));
    footer.appendChild(sendBtn);
    if (!config.canOrder) footer.appendChild(el("p", { class: "cart__footnote cart__footnote--warn", text: t("bannerNoNumber") }));

    if (focusKey) {
      var parts = focusKey.split(":");
      var again = drawer.querySelector('[data-cart-action="' + parts[0] + '"][data-id="' + parts[1] + '"]');
      if (again && !again.disabled) again.focus();
      else drawer.querySelector(".dialog").focus();
    }
  }

  function openDrawer(trigger) {
    if (drawer) return;
    drawer = BZ.ui.makeLayer("drawer", "cart-title", [
      el("div", { class: "cart__head" }, [
        el("h2", { class: "dialog__serif-title", id: "cart-title" }, [t("yourCartA") + " ", el("em", { text: t("yourCartB") })]),
        el("button", { type: "button", class: "button button--outline button--close", "data-close": true, "data-autofocus": true }, [icon("close"), el("span", { text: t("close") })]),
      ]),
      el("div", { class: "cart__content" }),
      el("div", { class: "cart__footer" }),
    ]);
    drawer.addEventListener("click", onDrawerClick);
    drawer.addEventListener("input", onNoteInput);
    drawer.addEventListener("focusout", onNoteBlur);
    drawer.addEventListener("keydown", function (e) {
      // Enter in a note field saves and closes the field.
      if (e.key === "Enter" && e.target.matches(".note-box__input")) {
        e.preventDefault();
        e.target.blur();
      }
    });
    renderDrawer();
    BZ.ui.openDialog(drawer, { trigger: trigger, onClose: function () { drawer = null; } });
  }

  // One click listener for every button in the drawer (event delegation).
  function onDrawerClick(e) {
    var btn = e.target.closest("[data-cart-action]");
    if (!btn || btn.disabled) return;
    var action = btn.getAttribute("data-cart-action");
    var id = parseInt(btn.getAttribute("data-id"), 10);

    if (action === "plus") setQty(id, qtyOf(id) + 1);
    else if (action === "minus") {
      if (qtyOf(id) <= 1) confirmRemove(id, btn);
      else setQty(id, qtyOf(id) - 1);
    } else if (action === "remove") confirmRemove(id, btn);
    else if (action === "note") toggleNote(btn);
    else if (action === "send") BZ.order.send(lines(), { fromCart: true, replaceTop: true, trigger: document.getElementById("cart-button") });
  }

  function toggleNote(btn) {
    var box = document.getElementById(btn.getAttribute("aria-controls"));
    var open = box.hidden;
    box.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    if (open) box.querySelector("input").focus();
  }

  function onNoteInput(e) {
    if (!e.target.matches(".note-box__input")) return;
    var id = parseInt(e.target.getAttribute("data-note-for"), 10);
    setNote(id, e.target.value);
    var row = e.target.closest(".cart-row");
    row.querySelector(".note-box__count").textContent = e.target.value.length + " / " + NOTE_MAX;
    row.querySelector(".note-toggle__text").textContent = e.target.value.trim() || t("addNote");
  }

  // Leaving an empty note field closes it again.
  function onNoteBlur(e) {
    if (!e.target.matches(".note-box__input")) return;
    var box = e.target.closest(".note-box");
    var row = e.target.closest(".cart-row");
    setTimeout(function () {
      if (box.contains(document.activeElement)) return;
      box.hidden = true;
      row.querySelector(".note-toggle").setAttribute("aria-expanded", "false");
    }, 0);
  }

  // ---------- "Remove this from your cart?" ----------

  function confirmRemove(id, trigger) {
    var line = lines().filter(function (l) { return l.product.id === id; })[0];
    if (!line) return;
    var p = line.product;
    var name = BZ.catalogue.displayName(p);
    var keep = el("button", { type: "button", class: "button button--primary button--lg", "data-close": true, "data-autofocus": true, text: t("keepIt") });
    var yes = el("button", { type: "button", class: "button button--danger button--lg", text: t("yesRemove") });

    var layer = BZ.ui.makeLayer("center", "remove-title", [
      el("div", { class: "dialog__body" }, [
        el("div", { class: "mini-product" }, [
          el("div", { class: "mini-product__img" }, [BZ.ui.img(p.image, "")]),
          el("div", {}, [
            el("p", { class: "mono-label", text: t("itemNo", { id: p.id }) + " · " + BZ.config.money(p.price, config) + " × " + line.qty }),
            el("p", { class: "mini-product__name", text: name }),
          ]),
        ]),
        el("h2", { class: "dialog__serif-title", id: "remove-title" }, [t("removeThisA") + " ", el("em", { text: t("removeThisB") })]),
        line.note ? el("p", { class: "dialog__text", text: t("noteRemovedToo", { note: line.note }) }) : null,
        el("div", { class: "dialog__actions dialog__actions--two" }, [keep, yes]),
      ]),
    ]);

    yes.addEventListener("click", function () {
      BZ.ui.closeDialog();       // close this question, back to the cart
      remove(id);                // the cart redraws itself
      if (drawer) drawer.querySelector(".dialog").focus();
    });
    BZ.ui.openDialog(layer, { trigger: trigger, fallbackFocus: drawer ? drawer.querySelector(".dialog") : null });
  }

  // ---------- start ----------

  function init(cfg) {
    config = cfg;
    el = BZ.ui.el;
    icon = BZ.ui.icon;

    var removed = sanitize(readStorage());
    save();
    if (removed) BZ.ui.toast(t("itemsNoLongerAvailable"), { tone: "warning" });

    subscribe(updateBadge);
    subscribe(renderDrawer);
    updateBadge();

    document.getElementById("cart-button").addEventListener("click", function (e) {
      openDrawer(e.currentTarget);
    });

    // Another tab changed the cart: load it here too.
    window.addEventListener("storage", function (e) {
      if (e.key !== STORAGE_KEY) return;
      sanitize(readStorage());
      listeners.forEach(function (fn) { fn(); });
    });
  }

  BZ.cart = {
    init: init,
    add: add,
    setQty: setQty,
    remove: remove,
    clear: clear,
    qtyOf: qtyOf,
    lines: lines,
    summary: summary,
    subscribe: subscribe,
    openDrawer: openDrawer,
    NOTE_MAX: NOTE_MAX,
  };
})();
