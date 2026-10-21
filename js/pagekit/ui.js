/*
 * ui.js — shared building blocks used by the popup, cart and WhatsApp code:
 *
 *   BZ.ui.el(tag, attrs, children)   build DOM safely (text via textContent)
 *   BZ.ui.img(src, alt)              <img> that falls back to the placeholder
 *   BZ.ui.icon(name)                 inline SVG line icon
 *   BZ.ui.openDialog(layer, opts)    show a popup (focus trap, Esc, backdrop,
 *   BZ.ui.closeDialog()              Android back button, page scroll lock)
 *   BZ.ui.swapDialog(layer, opts)    replace the top popup with another one
 *   BZ.ui.toast(message, opts)       short message at the bottom of the screen
 *
 * Popups can stack (e.g. "Remove this?" on top of the cart). Each open popup
 * adds one browser history entry, so the phone's back button closes it.
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});

  // ---------- DOM helpers ----------

  // el("p", { class: "x", text: "hello" }, [child, child])
  // Attribute value true -> empty attribute; false/null -> left out.
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (k === "text") node.textContent = v;
      else if (v !== false && v != null) node.setAttribute(k, v === true ? "" : v);
    });
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function img(src, alt, attrs) {
    var image = el("img", Object.assign({ src: src, alt: alt || "", decoding: "async" }, attrs || {}));
    image.addEventListener("error", function () {
      if (image.getAttribute("src") !== BZ.data.PLACEHOLDER_IMAGE) image.src = BZ.data.PLACEHOLDER_IMAGE;
    });
    return image;
  }

  // Line icons from the styleguide (24 viewBox, 1.7 stroke).
  var ICONS = {
    close: "M6 6l12 12M18 6L6 18",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    chat: "M5 19l1.2-3.6A7.5 7.5 0 1 1 9 18.3z",
    cart: "M6 8h12l-1 12H7zM9 8V6.5a3 3 0 0 1 6 0V8",
    truck: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19.3a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM17 19.3a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z",
    check: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l2.7 2.7L16 9.8",
    note: "M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z",
    copy: "M9 9h10v10H9zM5 15V5h10",
    alert: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V13M12 16.5h.01",
    trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  };
  function icon(name) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", ICONS[name] || "");
    svg.appendChild(path);
    return svg;
  }

  // ---------- dialogs ----------

  /*
   * A dialog "layer" is built like this (see makeLayer):
   *   <div class="dialog-layer dialog-layer--sheet">
   *     <div class="dialog-backdrop"></div>
   *     <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="...">…</div>
   *   </div>
   */
  function makeLayer(kind, labelId, children) {
    var box = el("div", { class: "dialog dialog--" + kind, role: "dialog", "aria-modal": "true", "aria-labelledby": labelId, tabindex: "-1" }, children);
    var layer = el("div", { class: "dialog-layer dialog-layer--" + kind }, [el("div", { class: "dialog-backdrop" }), box]);
    return layer;
  }

  var stack = [];          // [{ layer, trigger, onClose }]
  var expectedPops = 0;    // history.back() calls we made ourselves

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function focusables(layer) {
    return Array.prototype.filter.call(layer.querySelectorAll(FOCUSABLE), function (n) {
      return n.offsetParent !== null || n === document.activeElement;
    });
  }

  // Make everything behind the popups unreachable for keyboard/screen readers.
  function setBackgroundInert() {
    var top = stack.length ? stack[stack.length - 1].layer : null;
    Array.prototype.forEach.call(document.body.children, function (child) {
      if (child.classList.contains("toast-region")) return;
      var shouldBeInert = !!top && child !== top;
      if (shouldBeInert) {
        child.setAttribute("inert", "");
        child.setAttribute("aria-hidden", "true");
      } else {
        child.removeAttribute("inert");
        child.removeAttribute("aria-hidden");
      }
    });
    document.body.classList.toggle("has-dialog", !!top);
  }

  function show(entry) {
    if (!entry.layer.parentNode) document.body.appendChild(entry.layer);
    entry.layer.hidden = false;
    stack.push(entry);
    setBackgroundInert();
    // Focus the marked button; if it is disabled, the first usable control.
    var marked = entry.layer.querySelector("[data-autofocus]");
    var target = (marked && !marked.disabled ? marked : null) ||
      entry.layer.querySelector(".dialog " + FOCUSABLE) || entry.layer.querySelector(".dialog");
    target.focus();
  }

  function hideTop(restoreFocus) {
    var entry = stack.pop();
    if (!entry) return null;
    entry.layer.hidden = true;
    if (entry.layer.parentNode) entry.layer.parentNode.removeChild(entry.layer);
    setBackgroundInert();
    if (restoreFocus) {
      var back = entry.trigger && document.body.contains(entry.trigger) ? entry.trigger : entry.fallbackFocus;
      if (back && document.body.contains(back)) back.focus();
    }
    if (typeof entry.onClose === "function") entry.onClose();
    return entry;
  }

  // opts: { trigger, fallbackFocus, onClose }
  function openDialog(layer, opts) {
    opts = opts || {};
    var entry = {
      layer: layer,
      trigger: opts.trigger || document.activeElement,
      fallbackFocus: opts.fallbackFocus,
      onClose: opts.onClose,
    };
    try { history.pushState({ bzDialog: stack.length + 1 }, ""); } catch (e) { /* ignore */ }
    show(entry);
  }

  // Close the top popup (from a button, Esc or the backdrop).
  function closeDialog() {
    if (!stack.length) return;
    hideTop(true);
    expectedPops++;
    try { history.back(); } catch (e) { expectedPops--; }
  }

  // Replace the top popup with a new one, keeping the same history entry.
  function swapDialog(layer, opts) {
    opts = opts || {};
    var old = stack.length ? hideTop(false) : null;
    var entry = {
      layer: layer,
      trigger: opts.trigger || (old && old.trigger),
      fallbackFocus: opts.fallbackFocus || (old && old.fallbackFocus),
      onClose: opts.onClose,
    };
    if (!old) {
      try { history.pushState({ bzDialog: 1 }, ""); } catch (e) { /* ignore */ }
    }
    show(entry);
  }

  function isOpen(layer) {
    return stack.some(function (e) { return e.layer === layer; });
  }

  // Phone back button / browser back: close the top popup.
  window.addEventListener("popstate", function () {
    if (expectedPops > 0) { expectedPops--; return; }
    if (stack.length) hideTop(true);
  });

  document.addEventListener("keydown", function (e) {
    if (!stack.length) return;
    var top = stack[stack.length - 1].layer;
    if (e.key === "Escape") {
      e.preventDefault();
      closeDialog();
      return;
    }
    // Keep Tab inside the top popup.
    if (e.key === "Tab") {
      var items = focusables(top);
      if (!items.length) { e.preventDefault(); return; }
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !top.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !top.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Tap on the dark area around a popup closes it; [data-close] buttons too.
  document.addEventListener("click", function (e) {
    if (!stack.length) return;
    var top = stack[stack.length - 1].layer;
    if (!top.contains(e.target)) return;
    if (e.target.classList.contains("dialog-backdrop") || e.target.closest("[data-close]")) {
      closeDialog();
    }
  });

  // ---------- toasts ----------

  var toastRegion = null;
  var toastTimer = null;

  /*
   * toast("Garlic Press added", { detail, actionLabel, onAction, tone, duration })
   * tone: "dark" (default) | "warning" | "sage" | "light"
   */
  function toast(message, opts) {
    opts = opts || {};
    if (!toastRegion) {
      toastRegion = el("div", { class: "toast-region", role: "status", "aria-live": "polite" });
      document.body.appendChild(toastRegion);
    }
    clearTimeout(toastTimer);
    toastRegion.textContent = "";

    var action = null;
    if (opts.actionLabel) {
      action = el("button", { type: "button", class: "toast__action", text: opts.actionLabel });
      action.addEventListener("click", function () {
        hideToast();
        if (opts.onAction) opts.onAction();
      });
    }
    var tone = opts.tone || "dark";
    var box = el("div", { class: "toast toast--" + tone }, [
      icon(opts.icon || (tone === "warning" ? "alert" : "check")),
      el("div", { class: "toast__text" }, [
        el("p", { class: "toast__title", text: message }),
        opts.detail ? el("p", { class: "toast__detail", text: opts.detail }) : null,
      ]),
      action,
    ]);
    toastRegion.appendChild(box);
    // Messages with a button stay a little longer so there is time to tap it.
    toastTimer = setTimeout(hideToast, opts.duration || (action ? 6000 : 4000));
  }

  function hideToast() {
    clearTimeout(toastTimer);
    if (toastRegion) toastRegion.textContent = "";
  }

  BZ.ui = {
    el: el,
    img: img,
    icon: icon,
    makeLayer: makeLayer,
    openDialog: openDialog,
    closeDialog: closeDialog,
    swapDialog: swapDialog,
    isOpen: isOpen,
    toast: toast,
    hideToast: hideToast,
  };
})();
