/*
 * whatsapp.js — builds the order message (BUILD_BRIEF section 12) and
 * opens WhatsApp with it.
 *
 * lines = [{ product, qty, note }]  (prices always come from the current catalogue)
 *
 * Length safety: links longer than MAX_URL_LENGTH characters can be cut off
 * by some browsers / WhatsApp. So:
 *   1. try the normal message
 *   2. if too long, try the compact one (no numbering, no #id)
 *   3. if still too long, split into parts: "Order part 1 of 2", each with
 *      its own send button.
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});

  var MAX_URL_LENGTH = 2000;

  // Work in paise (whole numbers) so 99.5 × 3 never becomes 298.49999.
  function paise(rupees) { return Math.round(rupees * 100); }
  function money(paiseAmount, config, round) { return BZ.config.money(paiseAmount / 100, config, round); }

  function totalPaise(lines) {
    return lines.reduce(function (sum, l) { return sum + paise(l.product.price) * l.qty; }, 0);
  }

  // The lines for one item. number = 1, 2, 3… or null in compact mode.
  function itemText(line, number, config) {
    var p = line.product;
    var unit = paise(p.price);
    var head = number === null ? p.name : number + ". " + p.name + " (#" + p.id + ")";
    var indent = number === null ? "" : "   ";
    var out = [head, indent + money(unit, config) + " × " + line.qty + " = " + money(unit * line.qty, config)];
    if (line.note) out.push(indent + "Note: " + line.note);
    return out.join("\n");
  }

  // The closing block: total, shipping, and empty fields for the customer.
  function footerText(allLines, config) {
    var total = totalPaise(allLines);
    var free = total >= paise(config.freeShippingAbove);
    return [
      "TOTAL AMOUNT: " + money(total, config, true),
      free ? "Shipping: Free" : "Shipping: To be confirmed",
      "",
      "My Name:",
      "Address:",
      "Phone:",
    ].join("\n");
  }

  /*
   * One complete message.
   * opts.compact: drop numbering and #id
   * opts.part / opts.parts: "Order part 1 of 2"
   * opts.startNumber: numbering continues across parts
   * opts.allLines: the whole order (for the total in the last part)
   */
  function buildMessage(lines, config, opts) {
    opts = opts || {};
    var start = opts.startNumber || 1;
    var head = ["Hello " + config.shopName + "!"];
    if (opts.parts > 1) head.push("Order part " + opts.part + " of " + opts.parts);
    head.push("I want to order these items:");

    var items = lines.map(function (l, i) { return itemText(l, opts.compact ? null : start + i, config); });
    var isLast = !opts.parts || opts.part === opts.parts;
    var tail = isLast
      ? footerText(opts.allLines || lines, config)
      : "(continued in part " + (opts.part + 1) + ")";

    return head.join("\n") + "\n\n" + items.join("\n") + "\n\n" + tail;
  }

  function linkFor(message, config) {
    return "https://wa.me/" + config.whatsappDigits + "?text=" + encodeURIComponent(message);
  }

  /*
   * Returns an array of messages (usually just one).
   */
  function planMessages(lines, config) {
    var normal = buildMessage(lines, config);
    if (linkFor(normal, config).length <= MAX_URL_LENGTH) return [normal];

    var compact = buildMessage(lines, config, { compact: true });
    if (linkFor(compact, config).length <= MAX_URL_LENGTH) return [compact];

    // Split: fill each part with as many items as fit. We don't know the
    // number of parts in advance, so try 2, 3, 4… until every part fits.
    for (var parts = 2; parts <= lines.length; parts++) {
      var result = splitInto(lines, config, parts);
      if (result) return result;
    }
    // Last resort: one item per message.
    return lines.map(function (l, i) {
      return buildMessage([l], config, { part: i + 1, parts: lines.length, startNumber: i + 1, allLines: lines });
    });
  }

  // Greedy split into exactly `parts` messages; null if it doesn't fit.
  function splitInto(lines, config, parts) {
    var messages = [];
    var index = 0;
    for (var part = 1; part <= parts; part++) {
      var chunk = [];
      while (index < lines.length) {
        var tryChunk = chunk.concat([lines[index]]);
        var msg = buildMessage(tryChunk, config, {
          part: part, parts: parts, startNumber: index - chunk.length + 1, allLines: lines,
        });
        if (linkFor(msg, config).length > MAX_URL_LENGTH) break;
        chunk = tryChunk;
        index++;
      }
      if (!chunk.length) return null;
      messages.push(buildMessage(chunk, config, {
        part: part, parts: parts, startNumber: index - chunk.length + 1, allLines: lines,
      }));
    }
    return index === lines.length ? messages : null;
  }

  /*
   * Open WhatsApp. window.open(url, "_blank") returns null when a popup
   * blocker stops it; then we go there in the same tab instead.
   * (We clear .opener ourselves, which is what "noopener" does.)
   */
  function openLink(url) {
    var win = null;
    try { win = window.open(url, "_blank"); } catch (e) { win = null; }
    if (win) {
      try { win.opener = null; } catch (e) { /* ignore */ }
      return true;
    }
    window.location.href = url;
    return false;
  }

  // Copy text to the clipboard. Resolves true/false.
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  BZ.whatsapp = {
    MAX_URL_LENGTH: MAX_URL_LENGTH,
    buildMessage: buildMessage,
    planMessages: planMessages,
    linkFor: linkFor,
    openLink: openLink,
    copyText: copyText,
    totalPaise: totalPaise,
  };
})();
