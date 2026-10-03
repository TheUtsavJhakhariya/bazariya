/*
 * i18n.js — all words shown on screen live here.
 *
 * In HTML:  <span data-i18n="cashOnDelivery">…</span>
 *           <input data-i18n-attr="placeholder:searchPlaceholder">
 * In JS:    BZ.i18n.t("productsFound", { count: 48 })  ->  "48 products found"
 *
 * Milestone M6 adds Hindi (hi) and Gujarati (gu) and the language picker.
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});

  var STRINGS = {
    en: {
      skipToContent: "Skip to products",
      bannerNoNumber: "Shop number is not set. Orders can't be sent.",
      cashOnDelivery: "Cash on delivery",
      freeDeliveryAbove: "Free delivery above {amount}",
      changeLanguage: "Change language",
      openCart: "Open cart",
      cartCount: "{count} items in cart",
      searchLabel: "Search products",
      searchPlaceholder: "Name or item no. 154",
      clear: "Clear",
      showResults: "Show results",
      statementA: "We have",
      statementB: "{count} home essentials,",
      statementC: "free delivery above {amount}",
      statementD: "and",
      statementE: "cash on delivery.",
      allItemsA: "All",
      allItemsB: "items",
      categories: "Categories",
      all: "All",
      showingXofY: "Showing {shown} of {total}",
      productsFound: "{count} products found",
      oneProductFound: "1 product found",
      showMore: "Show {count} more",
      itemNo: "No. {id}",
      buyNow: "Buy now",
      addToCart: "Add to cart",
      outOfStock: "Out of stock",
      loading: "Loading items…",
      noMatchTitle: "No match for “{query}”",
      noMatchInCategory: "No match for “{query}” in {category}",
      noMatchText: "Check the spelling, or try the item number.",
      clearSearch: "Clear search",
      showAllCategories: "Search all categories",
      askOnWhatsApp: "Ask us on WhatsApp",
      emptyCategory: "Nothing here yet.",
      loadFailedTitle: "Couldn't load items",
      loadFailedText: "Check your internet and try again.",
      retry: "Retry",
      allProducts: "All products",
      aboutUs: "About us",
      returnPolicy: "Return policy",
      terms: "Terms",
    },
  };

  var current = "en";

  // Replace {name} placeholders with values.
  function fill(text, vars) {
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (m, key) {
      return vars[key] !== undefined ? String(vars[key]) : m;
    });
  }

  // Look up a string; fall back to English, then to the key itself.
  function t(key, vars) {
    var dict = STRINGS[current] || STRINGS.en;
    var text = dict[key] !== undefined ? dict[key] : STRINGS.en[key];
    return fill(text !== undefined ? text : key, vars);
  }

  // Translate every element with data-i18n / data-i18n-attr inside root.
  function apply(root) {
    root = root || document;
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      // format: "attr:key" or "attr:key,attr2:key2"
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length === 2) el.setAttribute(parts[0].trim(), t(parts[1].trim()));
      });
    });
  }

  BZ.i18n = { t: t, apply: apply, lang: function () { return current; } };
})();
