/*
 * shell.js — the parts every page shares: shop details from config.json in
 * the trust strip, footer and contact links; the "number not set" banner;
 * the footer year; and the cart badge on pages without the catalogue.
 *
 * Elements are found by data-bz="..." attributes:
 *   free-delivery   "Free delivery above ₹499"
 *   tagline         "Ghar Ka Bazaar"
 *   shop-name       "BAZARIYAA"
 *   year            2026
 *   contact-item    shown only when a valid WhatsApp number is set
 *   whatsapp-link   <a> -> https://wa.me/<number>, text "WhatsApp +91 …"
 *   phone-link      <a> -> tel:+<number>, text "Call +91 …"
 *   number-text     the formatted number inside a sentence (info pages)
 *   needs-number    buttons/links disabled when no number is set
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});
  var t = function (k, v) { return BZ.i18n.t(k, v); };

  function all(selector, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
  }

  function fill(config) {
    var freeText = t("freeDeliveryAbove", { amount: BZ.config.money(config.freeShippingAbove, config) });

    all('[data-bz="free-delivery"]', function (n) { n.textContent = freeText; });
    all('[data-bz="tagline"]', function (n) { n.textContent = config.tagline; });
    all('[data-bz="shop-name"]', function (n) { n.textContent = config.shopName; });
    all('[data-bz="year"]', function (n) { n.textContent = String(new Date().getFullYear()); });

    // Contact details only when a valid number is set.
    all('[data-bz="contact-item"]', function (n) { n.hidden = !config.canOrder; });
    all('[data-bz="no-number-item"]', function (n) { n.hidden = config.canOrder; });
    if (config.canOrder) {
      all('[data-bz="whatsapp-link"]', function (a) {
        a.href = "https://wa.me/" + config.whatsappDigits;
        if (!a.hasAttribute("data-keep-text")) a.textContent = t("whatsappNumber", { number: config.whatsappDisplay });
      });
      all('[data-bz="phone-link"]', function (a) {
        a.href = "tel:+" + config.whatsappDigits;
        a.textContent = t("callNumber", { number: config.whatsappDisplay });
      });
      all('[data-bz="number-text"]', function (n) { n.textContent = config.whatsappDisplay; });
      all("[data-cta-link]", function (a) { a.href = "https://wa.me/" + config.whatsappDigits; });
    }
    all('[data-bz="needs-number"]', function (n) {
      if (config.canOrder) return;
      n.setAttribute("aria-disabled", "true");
      n.removeAttribute("href");
    });

    var banner = document.getElementById("config-banner");
    if (banner) banner.hidden = config.canOrder;

    // Opened by double-clicking the file? Browsers then block config.json
    // and the product list, so say clearly how to open it properly.
    if (banner && location.protocol === "file:") {
      banner.querySelector("span").textContent = t("openedAsFile");
      banner.hidden = false;
    }
  }

  // Info pages: the cart lives on the home page, so the badge just counts
  // what is saved (the home page checks it against the catalogue).
  function savedCartCount() {
    try {
      var items = JSON.parse(localStorage.getItem("bazariya_cart_v1") || "[]");
      return Array.isArray(items) ? items.reduce(function (n, i) { return n + (parseInt(i.qty, 10) || 0); }, 0) : 0;
    } catch (e) {
      return 0;
    }
  }

  function showSavedCartCount() {
    var badge = document.getElementById("cart-count");
    if (!badge) return;
    var count = savedCartCount();
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  BZ.shell = { fill: fill, showSavedCartCount: showSavedCartCount };
})();
