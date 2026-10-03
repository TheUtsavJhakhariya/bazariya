/*
 * data.js — loads the product CSV and turns each row into a clean product.
 *
 * A product looks like:
 *   { id: 154, name: "Panda Night Lamp", nameHi: "", nameGu: "", description: "",
 *     price: 290, category: "Lights & Electronics", image: "images/154.webp",
 *     inStock: true, searchText: "panda night lamp 154 lights & electronics" }
 *
 * Bad rows never crash the site: they are skipped and summed up in ONE
 * console.warn line.
 *
 * Milestone M4 adds loading from the published Google Sheet (with a
 * timeout) before falling back to data/products.csv.
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});

  // Fixed category order (BUILD_BRIEF 9.3). Unknown categories go after these.
  var CATEGORY_ORDER = [
    "Kitchen",
    "Cleaning",
    "Bathroom & Personal Care",
    "Car",
    "Lights & Electronics",
    "Kids & Toys",
    "Bags & Storage",
    "Home & Wall Decor",
    "Umbrellas & Rain",
    "Health & Massagers",
  ];

  var PLACEHOLDER_IMAGE = "images/placeholder.svg";

  function text(value) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  // "1,599" / "₹ 290" -> number; anything unclear -> null
  function parsePrice(raw) {
    var s = text(raw).replace(/₹|rs\.?|inr/gi, "").replace(/,/g, "").trim();
    if (!/^\d+(\.\d+)?$/.test(s)) return null;
    var n = Number(s);
    return n > 0 ? n : null;
  }

  // Y / yes / true / 1 -> true; N / no / false / 0 -> false; empty -> true
  function parseStock(raw) {
    var s = text(raw).toLowerCase();
    if (s === "n" || s === "no" || s === "false" || s === "0") return false;
    return true;
  }

  /*
   * Work out a safe image address.
   * Allowed: a full https:// link, or a plain file name inside images/.
   * Anything else (http://, "../", "javascript:" ...) -> placeholder.
   */
  function imageFor(raw, id, ext) {
    var s = text(raw);
    if (!s) return "images/" + id + "." + ext;
    if (/^https:\/\/[^\s"'<>]+$/i.test(s)) return s;
    var file = s.replace(/^images\//i, "");
    if (/^[\w\-. ]+\.(webp|jpg|jpeg|png|gif|avif)$/i.test(file) && file.indexOf("..") === -1) {
      return "images/" + file;
    }
    return PLACEHOLDER_IMAGE;
  }

  // Match a category case-insensitively to the fixed list, keep unknown ones as typed.
  function canonicalCategory(raw) {
    var s = text(raw);
    var lower = s.toLowerCase();
    for (var i = 0; i < CATEGORY_ORDER.length; i++) {
      if (CATEGORY_ORDER[i].toLowerCase() === lower) return CATEGORY_ORDER[i];
    }
    return s;
  }

  // Turn parsed CSV rows (objects keyed by header) into products.
  function buildProducts(rows, config) {
    var products = [];
    var seen = {};
    var problems = { noIdOrName: 0, badId: 0, badPrice: 0, duplicateId: 0, noCategory: 0 };

    rows.forEach(function (row) {
      var rawId = text(row.id);
      var name = text(row.name);
      if (!rawId && !name) return; // fully blank row
      if (!rawId || !name) { problems.noIdOrName++; return; }
      if (!/^\d+$/.test(rawId)) { problems.badId++; return; }
      var id = parseInt(rawId, 10);
      if (seen[id]) { problems.duplicateId++; return; }
      var price = parsePrice(row.price);
      if (price === null) { problems.badPrice++; return; }
      var category = canonicalCategory(row.category);
      if (!category) { problems.noCategory++; category = "Other"; }

      seen[id] = true;
      var p = {
        id: id,
        name: name,
        nameHi: text(row.name_hi),
        nameGu: text(row.name_gu),
        description: text(row.description),
        price: price,
        category: category,
        image: imageFor(row.image, id, config.imageExtension),
        inStock: parseStock(row.in_stock),
      };
      // One lowercase string to search in.
      p.searchText = [p.name, p.id, p.category, p.description, p.nameHi, p.nameGu].join(" ").toLowerCase();
      products.push(p);
    });

    // One summary line instead of one warning per row.
    var skipped = Object.keys(problems).filter(function (k) { return problems[k] > 0; });
    if (skipped.length) {
      console.warn(
        "Product data: kept " + products.length + " rows. Skipped: " +
        skipped.map(function (k) { return problems[k] + " " + k; }).join(", ") +
        ". Check the Sheet (see data/data-report.md)."
      );
    }
    return products;
  }

  // Categories actually in the data, in the fixed order, unknown ones after.
  function categoriesIn(products) {
    var present = {};
    products.forEach(function (p) { present[p.category] = (present[p.category] || 0) + 1; });
    var known = CATEGORY_ORDER.filter(function (c) { return present[c]; });
    var unknown = Object.keys(present).filter(function (c) { return CATEGORY_ORDER.indexOf(c) === -1; }).sort();
    return known.concat(unknown).map(function (c) { return { name: c, count: present[c] }; });
  }

  // Fetch a CSV file and parse it with PapaParse. Rejects on any failure.
  function fetchCsv(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
      return res.text();
    }).then(function (csvText) {
      if (!window.Papa) throw new Error("PapaParse did not load");
      var result = window.Papa.parse(csvText.replace(/^﻿/, ""), {
        header: true,
        skipEmptyLines: "greedy",
        // " Name " -> "name", so small header typos in the Sheet still work
        transformHeader: function (h) { return text(h).toLowerCase(); },
      });
      if (!result.data.length || !("id" in result.data[0]) || !("name" in result.data[0])) {
        throw new Error("CSV has no id/name columns: " + url);
      }
      return result.data;
    });
  }

  // Load products. Resolves with { products, categories }; rejects if nothing loads.
  function load(config) {
    return fetchCsv(config.fallbackCsv).then(function (rows) {
      var products = buildProducts(rows, config);
      if (!products.length) throw new Error("No valid products in " + config.fallbackCsv);
      return { products: products, categories: categoriesIn(products) };
    });
  }

  BZ.data = { load: load, PLACEHOLDER_IMAGE: PLACEHOLDER_IMAGE };
})();
