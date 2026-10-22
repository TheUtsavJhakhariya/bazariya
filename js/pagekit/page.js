/*
 * page.js — start-up for the info pages (About, Return policy, Terms).
 * The home page uses app.js instead.
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});

  BZ.i18n.apply(document);
  BZ.shell.showSavedCartCount();
  initReturns();
  BZ.config.load().then(function (config) {
    BZ.state = { config: config };
    BZ.shell.fill(config);
    if (BZ.language) BZ.language.init(config, function () { BZ.shell.fill(config); });
  });

  // Return page: picking a reason updates the answer card under the list.
  function initReturns() {
    var form = document.getElementById("return-cases");
    var card = document.getElementById("return-answer");
    if (!form || !card) return;

    function show(input) {
      card.className = "return-answer is-" + (input.getAttribute("data-kind") || "yes");
      card.querySelector("[data-answer-badge]").textContent = input.getAttribute("data-badge") || "";
      card.querySelector("[data-answer-title]").textContent = input.getAttribute("data-title") || "";
      card.querySelector("[data-answer-body]").textContent = input.getAttribute("data-body") || "";
      Array.prototype.forEach.call(form.querySelectorAll(".case"), function (label) {
        label.classList.toggle("is-on", label.contains(input) && input.checked);
      });
    }

    form.addEventListener("change", function (event) {
      if (event.target && event.target.name === "case") show(event.target);
    });
    var checked = form.querySelector('input[name="case"]:checked');
    if (checked) show(checked);
  }
})();
