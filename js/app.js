/*
 * app.js — starts everything once the page has loaded.
 *   1. read config.json
 *   2. fill in shop details (trust strip, footer, year, banner)
 *   3. load products and show them
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});
  var t = function (k, v) { return BZ.i18n.t(k, v); };

  // Put config values into the page (all with textContent / attributes).
  function fillShopDetails(config) {
    var freeText = t("freeDeliveryAbove", { amount: BZ.config.money(config.freeShippingAbove, config) });

    document.querySelectorAll('[data-bz="free-delivery"]').forEach(function (n) { n.textContent = freeText; });
    document.querySelectorAll('[data-bz="tagline"]').forEach(function (n) { n.textContent = config.tagline; });
    document.querySelectorAll('[data-bz="shop-name"]').forEach(function (n) { n.textContent = config.shopName; });
    document.querySelectorAll('[data-bz="year"]').forEach(function (n) { n.textContent = String(new Date().getFullYear()); });

    // Contact links only when a valid number is set.
    document.querySelectorAll('[data-bz="contact-item"]').forEach(function (n) { n.hidden = !config.canOrder; });
    if (config.canOrder) {
      document.querySelectorAll('[data-bz="whatsapp-link"]').forEach(function (a) {
        a.href = "https://wa.me/" + config.whatsappDigits;
        a.textContent = "WhatsApp " + config.whatsappDisplay;
      });
      document.querySelectorAll('[data-bz="phone-link"]').forEach(function (a) {
        a.href = "tel:+" + config.whatsappDigits;
        a.textContent = "Call " + config.whatsappDisplay;
      });
    }

    // "Shop number is not set" banner
    document.getElementById("config-banner").hidden = config.canOrder;
  }

  // The sentence in the dark band, with the product count from the data.
  function fillStatement(config, productCount) {
    var p = document.querySelector('[data-bz="statement"]');
    if (!p) return;
    p.textContent = "";
    var amount = BZ.config.money(config.freeShippingAbove, config);
    [
      [t("statementA"), true],
      [t("statementB", { count: productCount }), false],
      [t("statementC", { amount: amount }), false],
      [t("statementD"), true],
      [t("statementE"), false],
    ].forEach(function (part, i) {
      if (i) p.appendChild(document.createTextNode(" "));
      var span = document.createElement("span");
      if (part[1]) span.className = "dim";
      span.textContent = part[0];
      p.appendChild(span);
    });
  }

  // Cart, quantity popup and WhatsApp ordering need the products, so they
  // start once the catalogue is loaded (only once, even after a Retry).
  var orderingStarted = false;
  function startOrdering(config) {
    if (orderingStarted) return;
    orderingStarted = true;
    BZ.cart.init(config);
    BZ.popup.init(config);
    BZ.order.init(config);
  }

  function loadProducts(config) {
    BZ.catalogue.showLoading();
    BZ.data.load(config)
      .then(function (data) {
        fillStatement(config, data.products.length);
        BZ.catalogue.setProducts(data.products, data.categories);
        startOrdering(config);
      })
      .catch(function (err) {
        console.warn("Products could not be loaded:", err.message);
        BZ.catalogue.showError(function () { loadProducts(config); });
      });
  }

  function start() {
    BZ.i18n.apply(document);
    BZ.catalogue.init({});
    BZ.catalogue.showLoading();
    BZ.config.load().then(function (config) {
      BZ.state = { config: config };
      fillShopDetails(config);
      BZ.catalogue.init(config);
      loadProducts(config);
    });
  }

  // Scripts use "defer", so the page is already parsed here.
  start();
})();
