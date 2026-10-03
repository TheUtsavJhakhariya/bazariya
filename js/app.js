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
    // Info pages link to "./#cart" to open the cart here.
    if (location.hash === "#cart") {
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* ignore */ }
      BZ.cart.openDrawer(document.getElementById("cart-button"));
    }
  }

  var productCount = 0;

  function loadProducts(config) {
    BZ.catalogue.showLoading();
    BZ.data.load(config)
      .then(function (data) {
        productCount = data.products.length;
        fillStatement(config, productCount);
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
      BZ.shell.fill(config);
      BZ.catalogue.init(config);
      // Language picker; on every switch, redraw the text built in JS.
      BZ.language.init(config, function () {
        BZ.shell.fill(config);
        if (productCount) fillStatement(config, productCount);
        BZ.catalogue.refresh();
        if (orderingStarted) BZ.cart.refresh();
      });
      loadProducts(config);
    });
  }

  // Scripts use "defer", so the page is already parsed here.
  start();
})();
