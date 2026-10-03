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

      // Shared
      close: "Close",
      undo: "Undo",
      remove: "Remove",
      decreaseQty: "One less {name}",
      increaseQty: "One more {name}",
      quantityIs: "Quantity {qty}",

      // Quantity popup
      quantity: "Quantity",
      howMany: "How many?",
      each: "each",
      totalQtyTimes: "Total · {qty} × {price}",
      keepShoppingSendLater: "Keep shopping, send later",
      orderNowWhatsApp: "Order now on WhatsApp",
      onlyThisItem: "Only this item",
      itemAdded: "{name} added",
      qtyTimesPrice: "{qty} × {price}",

      // Cart
      openCartCount: "Open cart, {count} items",
      yourCartA: "Your",
      yourCartB: "cart",
      addMoreA: "Add",
      addMoreB: "more for free delivery",
      youGetFreeDelivery: "You get free delivery",
      freeDeliveryProgress: "Progress to free delivery",
      addNote: "Add note",
      noteLabel: "Add a note (optional)",
      notePlaceholder: "e.g. blue colour please",
      removeItem: "Remove {name}",
      totalItems: "Total · {count} items",
      totalOneItem: "Total · 1 item",
      deliveryConfirmedPayCash: "Delivery charge confirmed on WhatsApp. Pay cash at your door.",
      freeDeliveryPayCash: "Free delivery. Pay cash at your door.",
      sendOrderWhatsApp: "Send order on WhatsApp",
      cartEmptyA: "Your cart is",
      cartEmptyB: "empty",
      cartEmptyText: "Pick a few things and send the list to us on WhatsApp.",
      startShopping: "Start shopping",
      itemsNoLongerAvailable: "Some items in your cart are no longer available and were removed.",

      // Remove item
      removeThisA: "Remove this",
      removeThisB: "from your cart?",
      noteRemovedToo: "Your note “{note}” will be removed too.",
      keepIt: "Keep it",
      yesRemove: "Yes, remove",

      // Ordering
      openingWhatsApp: "Opening WhatsApp…",
      orderAlreadyTyped: "Your order is already typed in.",
      stepWriteDetails: "Below the list, write your name, address and phone.",
      stepPressSend: "Press Send in WhatsApp.",
      stepWeReply: "We reply to confirm. Pay cash when it arrives.",
      didntOpen: "Didn't open?",
      copyOrderText: "Copy order text",
      tryAgain: "Try again",
      backToShop: "Back to shop",
      backToShopCartSaved: "Back to shop · your cart is saved",
      orderCopied: "Order text copied",
      pasteInChat: "Paste it in a chat with {number}.",
      openWhatsApp: "Open WhatsApp",
      copyFailed: "Couldn't copy. Please try again.",
      longOrderTitle: "Your order is long",
      longOrderText: "WhatsApp can't take it in one message, so it is split into {parts} parts. Tap each button in turn and press Send in WhatsApp each time.",
      sendPart: "Send part {part} of {parts}",
      partSentAgain: "Part {part} of {parts} opened · tap to open again",
      sentAllParts: "I've sent all parts",
      welcomeBack: "Welcome back",
      didYouPressA: "Did you press",
      didYouPressB: "Send",
      didYouPressC: "in WhatsApp?",
      itemsInOrder: "{count} items in your order",
      oneItemInOrder: "1 item in your order",
      ifYesClear: "If yes, we'll clear your cart. We'll reply on WhatsApp to confirm your order.",
      yesSentClearCart: "Yes, I sent it · clear cart",
      notYetKeepCart: "Not yet · keep my cart",
      thanksOrderSent: "Thank you! We'll reply on WhatsApp to confirm.",
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
