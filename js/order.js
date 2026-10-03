/*
 * order.js — what happens when someone taps "Order on WhatsApp" or
 * "Send order on WhatsApp":
 *
 *   1. WhatsApp opens with the message already typed (whatsapp.js)
 *   2. An "Opening WhatsApp…" popup explains the next steps and offers
 *      "Copy order text" / "Try again" in case WhatsApp didn't open.
 *      Very long orders get one "Send part X" button per part instead.
 *   3. Cart orders only: when the customer comes back to the site, we ask
 *      "Did you press Send in WhatsApp?" — Yes clears the cart, Not yet keeps it.
 *
 * The cart is NEVER changed by a single-item "Order on WhatsApp" (Buy now).
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});
  var t = function (k, v) { return BZ.i18n.t(k, v); };
  var el, icon;

  var PENDING_KEY = "bazariya_pending_order";
  var config = null;
  var waitingForReturn = false;

  // sessionStorage can be blocked (private mode); never let that break ordering.
  function setPending(on) {
    try {
      if (on) sessionStorage.setItem(PENDING_KEY, "1");
      else sessionStorage.removeItem(PENDING_KEY);
    } catch (e) { /* ignore */ }
  }
  function isPending() {
    try { return sessionStorage.getItem(PENDING_KEY) === "1"; } catch (e) { return false; }
  }

  // Open the popup, or replace the popup that is already on top.
  function present(layer, opts) {
    if (opts && opts.replaceTop) BZ.ui.swapDialog(layer, opts);
    else BZ.ui.openDialog(layer, opts);
  }

  // ---------- "Opening WhatsApp…" ----------

  function openingLayer(message, fromCart) {
    var step = function (n, key) {
      return el("li", { class: "steps__item" }, [el("span", { class: "steps__num", text: String(n) }), el("span", { text: t(key) })]);
    };
    var copyBtn = el("button", { type: "button", class: "button button--outline" }, [icon("copy"), el("span", { text: t("copyOrderText") })]);
    var retryBtn = el("button", { type: "button", class: "button button--accent", "data-autofocus": true }, [icon("chat"), el("span", { text: t("tryAgain") })]);

    copyBtn.addEventListener("click", function () { copyOrder(message); });
    retryBtn.addEventListener("click", function () { BZ.whatsapp.openLink(BZ.whatsapp.linkFor(message, config)); });

    return BZ.ui.makeLayer("center", "opening-title", [
      el("div", { class: "dialog__band" }, [
        el("span", { class: "round-icon round-icon--accent" }, [icon("chat")]),
        el("div", {}, [
          el("h2", { class: "poster-title", id: "opening-title", text: t("openingWhatsApp") }),
          el("p", { class: "dialog__band-text", text: t("orderAlreadyTyped") }),
        ]),
      ]),
      el("div", { class: "dialog__body" }, [
        el("ol", { class: "steps" }, [step(1, "stepWriteDetails"), step(2, "stepPressSend"), step(3, "stepWeReply")]),
        el("p", { class: "dialog__center-text", text: t("didntOpen") }),
        el("div", { class: "dialog__actions dialog__actions--two" }, [copyBtn, retryBtn]),
        el("button", { type: "button", class: "text-link", "data-close": true, text: fromCart ? t("backToShopCartSaved") : t("backToShop") }),
      ]),
    ]);
  }

  // ---------- long order: several parts ----------

  function partsLayer(messages, fromCart) {
    var list = el("ol", { class: "parts" });
    messages.forEach(function (msg, i) {
      var btn = el("button", { type: "button", class: "button button--accent button--block", "data-autofocus": i === 0 ? true : null }, [
        icon("chat"),
        el("span", { text: t("sendPart", { part: i + 1, parts: messages.length }) }),
      ]);
      btn.addEventListener("click", function () {
        BZ.whatsapp.openLink(BZ.whatsapp.linkFor(msg, config));
        btn.classList.remove("button--accent");
        btn.classList.add("button--outline");
        btn.lastChild.textContent = t("partSentAgain", { part: i + 1, parts: messages.length });
      });
      list.appendChild(el("li", {}, [btn]));
    });

    return BZ.ui.makeLayer("center", "parts-title", [
      el("div", { class: "dialog__body" }, [
        el("div", { class: "dialog__head" }, [
          el("h2", { class: "dialog__title", id: "parts-title", text: t("longOrderTitle") }),
          el("button", { type: "button", class: "button button--outline button--close", "data-close": true }, [icon("close"), el("span", { text: t("close") })]),
        ]),
        el("p", { class: "dialog__text", text: t("longOrderText", { parts: messages.length }) }),
        list,
        fromCart ? doneButton() : null,
      ]),
    ]);
  }

  // "I've sent all parts" -> ask whether to clear the cart.
  function doneButton() {
    var btn = el("button", { type: "button", class: "button button--primary button--block", text: t("sentAllParts") });
    btn.addEventListener("click", function () { askIfSent(true); });
    return btn;
  }

  // ---------- "Did you press Send?" ----------

  function didYouSendLayer() {
    var summary = BZ.cart.summary();
    var yes = el("button", { type: "button", class: "button button--primary button--block button--lg", "data-autofocus": true }, [icon("check"), el("span", { text: t("yesSentClearCart") })]);
    var notYet = el("button", { type: "button", class: "button button--outline button--block button--lg", text: t("notYetKeepCart") });

    yes.addEventListener("click", function () {
      setPending(false);
      BZ.cart.clear();
      BZ.ui.closeDialog();
      BZ.ui.toast(t("thanksOrderSent"), { tone: "sage" });
    });
    notYet.addEventListener("click", function () {
      setPending(false);
      BZ.ui.closeDialog();
    });

    return BZ.ui.makeLayer("center", "sent-title", [
      el("div", { class: "dialog__body" }, [
        el("p", { class: "mono-label", text: t("welcomeBack") }),
        el("h2", { class: "dialog__serif-title", id: "sent-title" }, [t("didYouPressA") + " ", el("em", { text: t("didYouPressB") }), " " + t("didYouPressC")]),
        el("div", { class: "summary-box" }, [
          el("span", { text: t(summary.count === 1 ? "oneItemInOrder" : "itemsInOrder", { count: summary.count }) }),
          el("strong", { text: BZ.config.money(summary.total, config, true) }),
        ]),
        el("p", { class: "dialog__text", text: t("ifYesClear") }),
        el("div", { class: "dialog__actions" }, [yes, notYet]),
      ]),
    ]);
  }

  function askIfSent(replaceTop) {
    if (!BZ.cart.summary().count) { setPending(false); return; }
    present(didYouSendLayer(), { replaceTop: replaceTop, fallbackFocus: document.getElementById("cart-button") });
  }

  // When the customer comes back from WhatsApp to this tab.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible" || !waitingForReturn) return;
    waitingForReturn = false;
    // Replace the "Opening WhatsApp…" popup if it is still showing.
    askIfSent(true);
  });

  // ---------- copy ----------

  function copyOrder(message) {
    BZ.whatsapp.copyText(message).then(function (ok) {
      if (ok) {
        BZ.ui.toast(t("orderCopied"), {
          detail: t("pasteInChat", { number: config.whatsappDisplay }),
          icon: "copy",
          actionLabel: t("openWhatsApp"),
          onAction: function () { BZ.whatsapp.openLink("https://wa.me/" + config.whatsappDigits); },
        });
      } else {
        BZ.ui.toast(t("copyFailed"), { tone: "warning" });
      }
    });
  }

  // ---------- public ----------

  /*
   * send(lines, opts)
   *   lines: [{ product, qty, note }]
   *   opts.fromCart: true for the cart's "Send order" button
   *   opts.replaceTop: true to replace the popup that is open now
   *   opts.trigger: button to focus again afterwards
   */
  function send(lines, opts) {
    opts = opts || {};
    if (!config.canOrder) {
      BZ.ui.toast(t("bannerNoNumber"), { tone: "warning" });
      return;
    }
    if (!lines.length) return;

    var messages = BZ.whatsapp.planMessages(lines, config);
    var dialogOpts = { replaceTop: opts.replaceTop, trigger: opts.trigger, fallbackFocus: document.getElementById("cart-button") };

    // Remember a cart order is on its way, so we can ask "Did you send it?"
    // when the customer comes back (even if this tab is replaced by WhatsApp).
    if (opts.fromCart) {
      setPending(true);
      // Long orders are sent part by part, so don't interrupt them on return;
      // the "I've sent all parts" button asks instead.
      waitingForReturn = messages.length === 1;
    }

    if (messages.length === 1) {
      // Open WhatsApp first, straight from the tap (popup blockers allow that).
      var opened = BZ.whatsapp.openLink(BZ.whatsapp.linkFor(messages[0], config));
      if (!opened) return; // the page is going to WhatsApp in this tab
      present(openingLayer(messages[0], !!opts.fromCart), dialogOpts);
    } else {
      present(partsLayer(messages, !!opts.fromCart), dialogOpts);
    }
  }

  function init(cfg) {
    config = cfg;
    el = BZ.ui.el;
    icon = BZ.ui.icon;
    // Came back after WhatsApp opened in this same tab (or the page reloaded)?
    if (isPending()) askIfSent(false);
  }

  BZ.order = { init: init, send: send };
})();
