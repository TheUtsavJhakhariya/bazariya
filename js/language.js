/*
 * language.js — the language picker (header button + footer EN / हि / ગુ).
 *
 * - The choice is saved in localStorage ("bazariya_lang").
 * - Hindi / Gujarati fonts (Noto Sans) are downloaded ONLY when that
 *   language is chosen, so English visitors never pay for them.
 * - <html lang> is updated on every change (done by BZ.i18n.set).
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});
  var t = function (k, v) { return BZ.i18n.t(k, v); };

  var STORAGE_KEY = "bazariya_lang";

  // Shown in the picker in their own script, plus the English name.
  var LANGS = {
    en: { code: "EN", native: "English", english: "English" },
    hi: { code: "HI", native: "हिंदी", english: "Hindi" },
    gu: { code: "GU", native: "ગુજરાતી", english: "Gujarati" },
  };

  var FONT_URLS = {
    hi: "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap",
    gu: "https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap",
  };

  var available = ["en"];
  var dialog = null;

  function save(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }
  function saved() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  // Add the Google Fonts stylesheet for this language once.
  function loadFont(lang) {
    var url = FONT_URLS[lang];
    if (!url || document.querySelector('link[data-font="' + lang + '"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.setAttribute("data-font", lang);
    document.head.appendChild(link);
  }

  function updateControls(lang) {
    var code = document.getElementById("language-code");
    if (code) code.textContent = LANGS[lang].code;
    Array.prototype.forEach.call(document.querySelectorAll(".lang-quick [data-lang]"), function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
      b.hidden = available.indexOf(b.getAttribute("data-lang")) === -1;
    });
  }

  function choose(lang) {
    if (available.indexOf(lang) === -1) lang = "en";
    loadFont(lang);
    save(lang);
    BZ.i18n.set(lang);
    updateControls(lang);
  }

  // ---------- picker popup (Languages.png) ----------

  function openPicker(trigger) {
    var el = BZ.ui.el;
    var current = BZ.i18n.lang();
    var cards = el("div", { class: "lang-cards" });
    available.forEach(function (lang) {
      var info = LANGS[lang];
      var isCurrent = lang === current;
      var btn = el("button", {
        type: "button",
        class: "lang-card" + (isCurrent ? " lang-card--current" : ""),
        "data-lang": lang,
        "aria-pressed": String(isCurrent),
        "data-autofocus": isCurrent ? true : null,
      }, [
        el("span", { class: "lang-card__top" }, [
          el("span", { class: "lang-card__code", text: info.code }),
          isCurrent ? el("span", { class: "lang-card__current", text: "● " + t("current") }) : null,
        ]),
        el("span", { class: "lang-card__native", lang: lang, text: info.native }),
        el("span", { class: "lang-card__english", text: isCurrent ? t("currentLanguage") : info.english }),
      ]);
      cards.appendChild(btn);
    });

    cards.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-lang]");
      if (!btn) return;
      choose(btn.getAttribute("data-lang"));
      BZ.ui.closeDialog();
    });

    dialog = BZ.ui.makeLayer("sheet", "lang-title", [
      el("div", { class: "dialog__head lang-head" }, [
        el("h2", { class: "dialog__serif-title", id: "lang-title" }, [
          t("languageTitle") + " · ",
          el("span", { lang: "hi", text: "भाषा" }),
          " · ",
          el("span", { lang: "gu", text: "ભાષા" }),
        ]),
        el("button", { type: "button", class: "button button--outline button--close", "data-close": true }, [BZ.ui.icon("close"), el("span", { text: t("close") })]),
      ]),
      cards,
      el("p", { class: "lang-note", text: t("languageNote") }),
    ]);
    BZ.ui.openDialog(dialog, { trigger: trigger, onClose: function () { dialog = null; } });
  }

  /*
   * init(config, onChange)
   * onChange(lang) is called after every language switch so the page can
   * redraw text built in JavaScript (product cards, prices, banner…).
   */
  function init(config, onChange) {
    available = (config.languages || ["en"]).filter(function (l) { return LANGS[l] && BZ.i18n.supported.indexOf(l) !== -1; });
    if (available.indexOf("en") === -1) available.unshift("en");
    if (typeof onChange === "function") BZ.i18n.onChange(onChange);

    var button = document.getElementById("language-button");
    if (button) {
      // Only one language? Then there is nothing to pick.
      button.hidden = available.length < 2;
      button.addEventListener("click", function () { openPicker(button); });
    }
    document.addEventListener("click", function (e) {
      var quick = e.target.closest(".lang-quick [data-lang]");
      if (quick) choose(quick.getAttribute("data-lang"));
    });

    var start = saved() || config.defaultLanguage || "en";
    if (start !== "en" && available.indexOf(start) !== -1) choose(start);
    else updateControls("en");
  }

  BZ.language = { init: init, choose: choose };
})();
