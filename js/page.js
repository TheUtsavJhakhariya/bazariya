/*
 * page.js — start-up for the info pages (About, Return policy, Terms).
 * The home page uses app.js instead.
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});

  BZ.i18n.apply(document);
  BZ.shell.showSavedCartCount();
  BZ.config.load().then(function (config) {
    BZ.state = { config: config };
    BZ.shell.fill(config);
    if (BZ.language) BZ.language.init(config, function () { BZ.shell.fill(config); });
  });
})();
