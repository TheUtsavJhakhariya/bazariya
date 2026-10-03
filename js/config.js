/*
 * config.js — loads config.json, fills in safe defaults, checks the
 * WhatsApp number. Nothing else in the site should hard-code these values.
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});

  // Used when config.json is missing, broken, or leaves a field out.
  var DEFAULTS = {
    shopName: "BAZARIYAA",
    tagline: "Ghar Ka Bazaar",
    whatsappNumber: "",
    freeShippingAbove: 499,
    currencySymbol: "₹",
    sheetCsvUrl: "",
    fallbackCsv: "data/products.csv",
    imageExtension: "webp",
    pageSize: 24,
    maxQtyPerItem: 99,
    defaultLanguage: "en",
    languages: ["en", "hi", "gu"],
  };

  /*
   * Turn "+91 98XXX-XXXXX" into "9198XXXXXXXX".
   * Returns "" if it does not look like a phone number with country code
   * (10 to 15 digits after removing spaces, dashes, brackets and "+").
   */
  function normalizeNumber(raw) {
    var digits = String(raw || "").replace(/[\s\-().+]/g, "");
    return /^\d{10,15}$/.test(digits) ? digits : "";
  }

  // "919876543210" -> "+91 98765 43210" (Indian style); other lengths: "+<digits>".
  function formatNumber(digits) {
    if (!digits) return "";
    if (digits.length === 12 && digits.indexOf("91") === 0) {
      return "+91 " + digits.slice(2, 7) + " " + digits.slice(7);
    }
    return "+" + digits;
  }

  // Use the given number if it is a sensible positive number, else the default.
  function positive(value, fallback) {
    var n = Number(value);
    return isFinite(n) && n > 0 ? n : fallback;
  }

  function clean(raw) {
    var c = {};
    Object.keys(DEFAULTS).forEach(function (k) {
      c[k] = raw && raw[k] !== undefined && raw[k] !== null ? raw[k] : DEFAULTS[k];
    });
    c.shopName = String(c.shopName).trim() || DEFAULTS.shopName;
    c.tagline = String(c.tagline).trim();
    c.freeShippingAbove = positive(c.freeShippingAbove, DEFAULTS.freeShippingAbove);
    c.pageSize = Math.round(positive(c.pageSize, DEFAULTS.pageSize));
    c.maxQtyPerItem = Math.round(positive(c.maxQtyPerItem, DEFAULTS.maxQtyPerItem));
    c.sheetCsvUrl = String(c.sheetCsvUrl || "").trim();
    c.fallbackCsv = String(c.fallbackCsv || DEFAULTS.fallbackCsv).trim();
    c.imageExtension = String(c.imageExtension || DEFAULTS.imageExtension).replace(/^\./, "");

    // WhatsApp number: digits only, or "" if missing/invalid.
    c.whatsappDigits = normalizeNumber(c.whatsappNumber);
    c.whatsappDisplay = formatNumber(c.whatsappDigits);
    c.canOrder = c.whatsappDigits !== "";
    return c;
  }

  // Returns a Promise that always resolves (never rejects) with a config object.
  function load() {
    return fetch("config.json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (json) {
        var c = clean(json);
        c.loadedFromFile = true;
        return c;
      })
      .catch(function (err) {
        console.warn("config.json could not be loaded, using defaults:", err.message);
        var c = clean(null);
        c.loadedFromFile = false;
        return c;
      });
  }

  // Format a rupee amount for display: 1599 -> "₹1,599" (Indian grouping).
  function money(amount, config) {
    var symbol = (config && config.currencySymbol) || DEFAULTS.currencySymbol;
    return symbol + Math.round(amount).toLocaleString("en-IN");
  }

  BZ.config = { load: load, money: money };
})();
