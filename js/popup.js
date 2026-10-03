/*
 * popup.js — the quantity popup that opens from "Buy now" or "Add to cart".
 * (Bottom sheet on phones, centred box on wider screens.)
 *
 *   Order now on WhatsApp -> message for THIS item only. Cart untouched.
 *   Add to cart           -> adds the chosen quantity, closes, shows a toast.
 *
 * Opened from "Buy now": the WhatsApp button is the main (orange) one.
 * Opened from "Add to cart": the Add to cart button is the main (dark) one.
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});
  var t = function (k, v) { return BZ.i18n.t(k, v); };
  var el, icon;

  var QUICK_PICKS = [1, 2, 3, 5, 10];
  var config = null;

  function open(action, product, trigger) {
    if (!product || !product.inStock) return;
    var qty = 1;
    var max = config.maxQtyPerItem;
    var name = BZ.catalogue.displayName(product);
    var unit = product.price;

    // --- pieces that change when the quantity changes ---
    var input = el("input", {
      class: "stepper__input",
      id: "qty-input",
      type: "text",
      inputmode: "numeric",
      pattern: "[0-9]*",
      autocomplete: "off",
      value: "1",
      "aria-label": t("quantity"),
    });
    var minus = el("button", { type: "button", class: "stepper__btn", "aria-label": t("decreaseQty", { name: name }) }, [icon("minus")]);
    var plus = el("button", { type: "button", class: "stepper__btn stepper__btn--dark", "aria-label": t("increaseQty", { name: name }) }, [icon("plus")]);
    var totalLabel = el("span", { class: "qty-total__label" });
    var totalValue = el("strong", { class: "qty-total__value" });

    var picks = el("div", { class: "quick-picks", role: "group", "aria-label": t("howMany") });
    QUICK_PICKS.filter(function (n) { return n <= max; }).forEach(function (n) {
      picks.appendChild(el("button", { type: "button", class: "quick-pick", "data-qty": n, "aria-pressed": "false", text: String(n) }));
    });

    // --- the two actions ---
    var viaBuy = action === "buy";
    var addBtn = el("button", {
      type: "button",
      class: "button button--lg button--stacked " + (viaBuy ? "button--outline" : "button--primary"),
      "data-autofocus": viaBuy ? null : true,
    }, [
      el("span", { class: "button__main" }, [icon("cart"), el("span", { text: t("addToCart") })]),
      el("span", { class: "button__sub", text: t("keepShoppingSendLater") }),
    ]);
    var orderBtn = el("button", {
      type: "button",
      class: "button button--lg button--stacked " + (viaBuy ? "button--accent" : "button--outline"),
      "data-autofocus": viaBuy ? true : null,
      disabled: !config.canOrder,
    }, [
      el("span", { class: "button__main" }, [icon("chat"), el("span", { text: t("orderNowWhatsApp") })]),
      el("span", { class: "button__sub", text: t("onlyThisItem") }),
    ]);

    // Main action first on phones (where the buttons stack).
    var actions = el("div", { class: "dialog__actions dialog__actions--two qty-actions" + (viaBuy ? " qty-actions--buy" : "") }, [addBtn, orderBtn]);

    // --- quantity logic ---
    function setQty(value, fromTyping) {
      var n = parseInt(String(value).replace(/\D/g, ""), 10);
      if (!isFinite(n) || n < 1) n = 1;
      if (n > max) n = max;
      qty = n;
      // While typing, don't fight the user over an empty field.
      if (!fromTyping || input.value !== "") input.value = String(qty);
      minus.disabled = qty <= 1;
      plus.disabled = qty >= max;
      totalLabel.textContent = t("totalQtyTimes", { qty: qty, price: BZ.config.money(unit, config) });
      totalValue.textContent = BZ.config.money(unit * qty, config);
      picks.querySelectorAll(".quick-pick").forEach(function (b) {
        b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-qty")) === qty));
      });
    }

    minus.addEventListener("click", function () { setQty(qty - 1); });
    plus.addEventListener("click", function () { setQty(qty + 1); });
    picks.addEventListener("click", function (e) {
      var b = e.target.closest(".quick-pick");
      if (b) setQty(b.getAttribute("data-qty"));
    });
    input.addEventListener("input", function () { setQty(input.value, true); });
    input.addEventListener("blur", function () { setQty(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp") { e.preventDefault(); setQty(qty + 1); }
      if (e.key === "ArrowDown") { e.preventDefault(); setQty(qty - 1); }
      if (e.key === "Enter") { e.preventDefault(); input.blur(); }
    });

    addBtn.addEventListener("click", function () {
      setQty(input.value);
      var before = BZ.cart.qtyOf(product.id);
      BZ.cart.add(product.id, qty);
      BZ.ui.closeDialog();
      BZ.ui.toast(t("itemAdded", { name: name }), {
        detail: t("qtyTimesPrice", { qty: qty, price: BZ.config.money(unit, config) }),
        actionLabel: t("undo"),
        // Undo puts the cart back exactly as it was before.
        onAction: function () {
          if (before > 0) BZ.cart.setQty(product.id, before);
          else BZ.cart.remove(product.id);
        },
        duration: 5000,
      });
    });

    orderBtn.addEventListener("click", function () {
      setQty(input.value);
      // Only this item. The cart is not read or changed.
      BZ.order.send([{ product: product, qty: qty, note: "" }], { replaceTop: true, trigger: trigger });
    });

    var desc = product.description ? el("p", { class: "qty-sheet__desc", text: product.description }) : null;

    var layer = BZ.ui.makeLayer("sheet", "qty-title", [
      el("div", { class: "qty-sheet__head" }, [
        el("p", { class: "mono-label", text: BZ.catalogue.categoryLabel(product.category) }),
        el("button", { type: "button", class: "button button--outline button--close", "data-close": true }, [icon("close"), el("span", { text: t("close") })]),
      ]),
      el("div", { class: "qty-sheet__top" }, [
        el("div", { class: "qty-sheet__img" }, [
          BZ.ui.img(product.image, name),
          el("span", { class: "card__number", text: t("itemNo", { id: product.id }) }),
        ]),
        el("div", { class: "qty-sheet__info" }, [
          el("h2", { class: "qty-sheet__name", id: "qty-title", text: name }),
          desc,
          el("p", { class: "qty-sheet__price" }, [
            el("span", { class: "price-large", text: BZ.config.money(unit, config) }),
            " ",
            el("span", { class: "qty-sheet__each", text: t("each") }),
          ]),
        ]),
      ]),
      el("div", { class: "qty-sheet__pick" }, [
        el("label", { class: "qty-sheet__how", for: "qty-input", text: t("howMany") }),
        el("div", { class: "qty-sheet__pick-row" }, [
          picks,
          el("div", { class: "stepper stepper--lg" }, [minus, input, plus]),
        ]),
      ]),
      el("div", { class: "qty-total" }, [totalLabel, totalValue]),
      actions,
      config.canOrder ? null : el("p", { class: "cart__footnote cart__footnote--warn", text: t("bannerNoNumber") }),
    ]);

    setQty(1);
    BZ.ui.openDialog(layer, { trigger: trigger });
  }

  function init(cfg) {
    config = cfg;
    el = BZ.ui.el;
    icon = BZ.ui.icon;
    // The catalogue calls this when a card button is tapped.
    BZ.onProductAction = open;
  }

  BZ.popup = { init: init, open: open };
})();
