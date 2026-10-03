/*
 * catalogue.js — search, category filter, product grid, "Show more",
 * and the loading / no results / error states.
 *
 * Product text from the CSV is ALWAYS put on the page with textContent
 * (never innerHTML), so it can't break the page or run code.
 *
 * Card buttons carry data-action="buy" / "add" and data-id. One click
 * listener on the grid (event delegation) handles all cards; the popup that
 * opens is built in milestone M3 (BZ.onProductAction).
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});
  var t = function (k, v) { return BZ.i18n.t(k, v); };

  var state = {
    config: null,
    products: [],     // everything, already sorted
    categories: [],   // [{ name, count }]
    category: "",     // "" = All
    query: "",
    results: [],      // products matching category + query
    shown: 0,         // how many of results are on the page
  };

  var els = {};

  // ---------- small DOM helper ----------
  // el("p", { class: "x", text: "hello" }, [child, child])
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else if (attrs[k] !== false && attrs[k] != null) node.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  // Name in the chosen language if the Sheet has it, else English.
  function displayName(p) {
    var lang = BZ.i18n.lang();
    if (lang === "hi" && p.nameHi) return p.nameHi;
    if (lang === "gu" && p.nameGu) return p.nameGu;
    return p.name;
  }

  // ---------- searching and filtering ----------

  // Lowercase, trim, collapse spaces.
  function normalizeQuery(q) {
    return String(q || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  // Punctuation becomes a space, so "hot-water" and "(pack" split into words.
  // Hindi/Gujarati letters are kept.
  function splitWords(s) {
    return s.replace(/[\s\-_/\\(),.*&+:;'"!?|#[\]{}<>=~`@$%^]+/g, " ").trim();
  }

  function compute() {
    var q = normalizeQuery(state.query);
    // "No. 154", "no 154", "#154" all mean item 154
    var idMatch = q.replace(/^(no\.?|#)\s*/, "");
    var exactId = /^\d+$/.test(idMatch) ? parseInt(idMatch, 10) : null;
    var words = splitWords(q).split(" ").filter(function (w) { return w && w !== "no"; });

    var list = state.products.filter(function (p) {
      if (state.category && p.category !== state.category) return false;
      if (!words.length) return true;
      if (exactId !== null && p.id === exactId) return true;
      // Every word must match the START of a word in the product (AND).
      // So "mat" finds "Bath Mat" but not "Automatic"; "garl" finds "Garlic".
      return words.every(function (w) { return p.searchWords.indexOf(" " + w) !== -1; });
    });

    // An exact item-number match goes to the top.
    if (exactId !== null) {
      var i = list.findIndex(function (p) { return p.id === exactId; });
      if (i > 0) list.unshift(list.splice(i, 1)[0]);
    }
    state.results = list;
  }

  // ---------- rendering ----------

  function renderCategories() {
    var list = els.categoryList;
    list.textContent = "";
    var all = [{ name: "", label: t("all"), count: state.products.length }].concat(
      state.categories.map(function (c) { return { name: c.name, label: c.name, count: c.count }; })
    );
    all.forEach(function (c) {
      var btn = el("button", {
        type: "button",
        class: "chip",
        "data-category": c.name,
        "aria-pressed": String(c.name === state.category),
      }, [
        el("span", { text: c.label }),
        el("span", { class: "chip__count", text: "(" + c.count + ")" }),
      ]);
      list.appendChild(el("li", {}, [btn]));
    });
  }

  function updateCategoryButtons() {
    els.categoryList.querySelectorAll(".chip").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-category") === state.category));
    });
  }

  function productCard(p) {
    var name = displayName(p);
    var img = el("img", {
      src: p.image,
      alt: name,
      width: "300",
      height: "300",
      loading: "lazy",
      decoding: "async",
    });

    var media = el("div", { class: "card__media" }, [
      img,
      el("span", { class: "card__number", text: t("itemNo", { id: p.id }) }),
      p.inStock ? null : el("span", { class: "card__oos-badge", text: t("outOfStock") }),
    ]);

    var actions;
    if (p.inStock) {
      actions = el("div", { class: "card__actions" }, [
        el("button", { type: "button", class: "button button--primary", "data-action": "buy", "data-id": p.id, text: t("buyNow") }),
        el("button", { type: "button", class: "button button--secondary", "data-action": "add", "data-id": p.id, text: t("addToCart") }),
      ]);
    } else {
      // One disabled button, as in the styleguide's out-of-stock card.
      actions = el("div", { class: "card__actions" }, [
        el("button", { type: "button", class: "button", disabled: true, text: t("outOfStock") }),
      ]);
    }

    var article = el("article", { class: "card" + (p.inStock ? "" : " card--oos") }, [
      media,
      el("div", { class: "card__body" }, [
        el("h3", { class: "card__name", id: "p-" + p.id, tabindex: "-1", title: name, text: name }),
        el("p", { class: "card__price", text: BZ.config.money(p.price, state.config) }),
        actions,
      ]),
    ]);
    article.setAttribute("aria-labelledby", "p-" + p.id);
    return el("li", {}, [article]);
  }

  // Add the next batch of cards. Returns the first new card's heading.
  function appendBatch() {
    var next = state.results.slice(state.shown, state.shown + state.config.pageSize);
    var frag = document.createDocumentFragment();
    next.forEach(function (p) { frag.appendChild(productCard(p)); });
    els.grid.appendChild(frag);
    var first = next.length ? document.getElementById("p-" + next[0].id) : null;
    state.shown += next.length;
    updateCount();
    return first;
  }

  function updateCount() {
    var total = state.results.length;
    els.count.textContent = total ? t("showingXofY", { shown: state.shown, total: total }) : "";
    var left = total - state.shown;
    els.showMore.hidden = left <= 0;
    if (left > 0) els.showMoreLabel.textContent = t("showMore", { count: Math.min(left, state.config.pageSize) });
  }

  function announce() {
    var n = state.results.length;
    els.live.textContent = n === 1 ? t("oneProductFound") : t("productsFound", { count: n });
  }

  // Redraw the grid from the start (after search/filter changes).
  function render() {
    compute();
    els.grid.textContent = "";
    els.stateBox.textContent = "";
    state.shown = 0;
    if (state.results.length) appendBatch();
    else {
      updateCount();
      showNoResults();
    }
    announce();
  }

  // ---------- states ----------

  function showLoading() {
    els.stateBox.textContent = "";
    els.grid.textContent = "";
    els.grid.setAttribute("aria-busy", "true");
    els.live.textContent = t("loading");
    for (var i = 0; i < 6; i++) {
      els.grid.appendChild(el("li", { "aria-hidden": "true" }, [
        el("div", { class: "card card--skeleton" }, [
          el("div", { class: "card__media" }),
          el("div", { class: "skeleton-line" }),
          el("div", { class: "skeleton-line skeleton-line--short" }),
          el("div", { class: "skeleton-line skeleton-line--button" }),
        ]),
      ]));
    }
  }

  function showNoResults() {
    var q = normalizeQuery(state.query);
    var title = q
      ? (state.category ? t("noMatchInCategory", { query: state.query.trim(), category: state.category }) : t("noMatchTitle", { query: state.query.trim() }))
      : t("emptyCategory");
    var actions = el("div", { class: "state__actions" }, [
      q ? el("button", { type: "button", class: "button button--primary", "data-state-action": "clear-search", text: t("clearSearch") }) : null,
      q && state.category ? el("button", { type: "button", class: "button button--outline", "data-state-action": "all-categories", text: t("showAllCategories") }) : null,
      state.config.canOrder
        ? el("a", {
            class: "button button--outline",
            href: "https://wa.me/" + state.config.whatsappDigits,
            target: "_blank",
            rel: "noopener",
            text: t("askOnWhatsApp"),
          })
        : null,
    ]);
    els.stateBox.appendChild(el("div", { class: "state", role: "status" }, [
      el("h3", { class: "state__title", text: title }),
      q ? el("p", { class: "state__text", text: t("noMatchText") }) : null,
      actions,
    ]));
  }

  // onRetry: function to call when the Retry button is pressed.
  function showError(onRetry) {
    els.grid.textContent = "";
    els.grid.removeAttribute("aria-busy");
    els.showMore.hidden = true;
    els.count.textContent = "";
    els.stateBox.textContent = "";
    var retry = el("button", { type: "button", class: "button button--primary", text: t("retry") });
    retry.addEventListener("click", onRetry);
    els.stateBox.appendChild(el("div", { class: "state", role: "alert" }, [
      el("h3", { class: "state__title", text: t("loadFailedTitle") }),
      el("p", { class: "state__text", text: t("loadFailedText") }),
      el("div", { class: "state__actions" }, [retry]),
    ]));
    els.live.textContent = t("loadFailedTitle");
  }

  // ---------- events ----------

  var searchTimer = null;

  function setQuery(value, immediately) {
    state.query = value;
    els.clear.hidden = value === "";
    clearTimeout(searchTimer);
    if (immediately) render();
    else searchTimer = setTimeout(render, 180); // wait until typing pauses
  }

  function bindEvents() {
    els.input.addEventListener("input", function () { setQuery(els.input.value, false); });

    // Enter / the orange arrow: run the search now, hide the phone keyboard,
    // and scroll to the results.
    els.form.addEventListener("submit", function (e) {
      e.preventDefault();
      setQuery(els.input.value, true);
      els.input.blur();
      document.getElementById("catalogue-title").scrollIntoView({ block: "start" });
    });

    els.clear.addEventListener("click", function () {
      els.input.value = "";
      setQuery("", true);
      els.input.focus();
    });

    els.categoryList.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      state.category = btn.getAttribute("data-category");
      updateCategoryButtons();
      render();
    });

    els.showMore.addEventListener("click", function () {
      var first = appendBatch();
      // Move focus to the first new card so keyboard users continue from there.
      if (first) first.focus({ preventScroll: false });
    });

    // One listener for every card button (event delegation).
    els.grid.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn || btn.disabled) return;
      var id = parseInt(btn.getAttribute("data-id"), 10);
      var product = findById(id);
      if (product && typeof BZ.onProductAction === "function") {
        BZ.onProductAction(btn.getAttribute("data-action"), product, btn);
      }
    });

    // Broken or missing photo -> placeholder. "error" does not bubble, so
    // listen in the capture phase on the grid (one listener for all images).
    els.grid.addEventListener("error", function (e) {
      var img = e.target;
      if (img.tagName === "IMG" && img.getAttribute("src") !== BZ.data.PLACEHOLDER_IMAGE) {
        img.src = BZ.data.PLACEHOLDER_IMAGE;
      }
    }, true);

    // Buttons inside the "no results" box
    els.stateBox.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-state-action]");
      if (!btn) return;
      var action = btn.getAttribute("data-state-action");
      if (action === "clear-search") {
        els.input.value = "";
        setQuery("", true);
        els.input.focus();
      } else if (action === "all-categories") {
        state.category = "";
        updateCategoryButtons();
        render();
      }
    });
  }

  function findById(id) {
    for (var i = 0; i < state.products.length; i++) if (state.products[i].id === id) return state.products[i];
    return null;
  }

  // ---------- public ----------

  var ready = false;

  // Safe to call more than once: page elements and listeners are set up only
  // the first time; later calls just update the config.
  function init(config) {
    state.config = config;
    if (ready) return;
    ready = true;
    els = {
      form: document.getElementById("search-form"),
      input: document.getElementById("search-input"),
      clear: document.getElementById("search-clear"),
      categoryList: document.getElementById("category-list"),
      grid: document.getElementById("product-grid"),
      stateBox: document.getElementById("catalogue-state"),
      count: document.getElementById("result-count"),
      live: document.getElementById("live-region"),
      showMore: document.getElementById("show-more"),
      showMoreLabel: document.getElementById("show-more-label"),
    };
    bindEvents();
  }

  function setProducts(products, categories) {
    // Pre-split each product's text once: " panda night lamp 154 lights electronics"
    products.forEach(function (p) { p.searchWords = " " + splitWords(p.searchText); });
    // In stock first, then by item number.
    state.products = products.slice().sort(function (a, b) {
      if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
      return a.id - b.id;
    });
    state.categories = categories;
    els.grid.removeAttribute("aria-busy");
    // Keep whatever was typed while the data was loading.
    state.query = els.input.value;
    els.clear.hidden = state.query === "";
    renderCategories();
    render();
  }

  BZ.catalogue = {
    init: init,
    setProducts: setProducts,
    showLoading: showLoading,
    showError: showError,
    findById: findById,
  };
})();
