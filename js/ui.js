/* Dialogs, the dimmed page behind them, and toasts.
   One dialog sits on top of another. Escape, the backdrop, and the
   Android back button close the top one and put focus back. */

var UI = (function () {
  var stack = [];
  var ignorePop = false;
  var bound = false;
  var toastTimer = 0;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function phone() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function root() {
    var node = document.getElementById('layer-root');
    if (!node) {
      node = el('div', 'layer-root');
      node.id = 'layer-root';
      node.hidden = true;
      document.body.appendChild(node);
    }
    return node;
  }

  function focusable(layer) {
    var list = layer.querySelectorAll('button, a[href], input, textarea, select');
    var out = [];
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i].disabled) continue;
      if (list[i].getAttribute('aria-hidden') === 'true') continue;
      if (!list[i].getClientRects().length) continue;
      out.push(list[i]);
    }
    return out;
  }

  function open(opts) {
    bind();
    var box = root();
    var wrap = el('div', 'layer is-' + (opts.kind || 'modal'));
    var back = el('div', 'layer-back');
    var dialog = opts.node;
    var reuseHistory = false;
    var opener = document.activeElement;
    if (opts.swap && stack.length) {
      var prev = stack.pop();
      if (prev.opener) opener = prev.opener;
      prev.wrap.remove();
      if (prev.onClose) prev.onClose();
      reuseHistory = prev.history;
    }
    back.addEventListener('click', function () {
      if (opts.onBack) opts.onBack();
      else close();
    });
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    if (opts.label) dialog.setAttribute('aria-label', opts.label);
    if (opts.labelledBy) dialog.setAttribute('aria-labelledby', opts.labelledBy);
    wrap.appendChild(back);
    wrap.appendChild(dialog);
    box.appendChild(wrap);
    box.hidden = false;
    document.body.classList.add('has-layer');
    var layer = {
      wrap: wrap,
      opener: opener,
      onClose: opts.onClose || null,
      history: false
    };
    stack.push(layer);
    try {
      if (reuseHistory) history.replaceState({ bazariyaa: stack.length }, '');
      else history.pushState({ bazariyaa: stack.length }, '');
      layer.history = true;
    } catch (err) {
      /* Some browsers block history. Escape still closes the dialog. */
    }
    window.setTimeout(function () {
      var target = opts.focus ? dialog.querySelector(opts.focus) : null;
      if (!target) target = focusable(dialog)[0];
      if (target) target.focus();
    }, 0);
    return layer;
  }

  function close(fromPop) {
    var layer = stack.pop();
    if (!layer) return;
    layer.wrap.remove();
    if (layer.onClose) layer.onClose();
    if (!stack.length) {
      root().hidden = true;
      document.body.classList.remove('has-layer');
    }
    if (!fromPop && layer.history) {
      ignorePop = true;
      history.back();
    }
    if (layer.opener && layer.opener.focus) {
      try { layer.opener.focus(); } catch (err) { /* The opener may be gone. */ }
    }
  }

  function closeAll() {
    var steps = 0;
    stack.forEach(function (layer) {
      layer.wrap.remove();
      if (layer.onClose) layer.onClose();
      if (layer.history) steps += 1;
    });
    stack = [];
    root().hidden = true;
    document.body.classList.remove('has-layer');
    if (steps) {
      ignorePop = true;
      history.go(-steps);
    }
  }

  function onKey(event) {
    if (!stack.length) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      var top = stack[stack.length - 1];
      var back = top.wrap.querySelector('.layer-back');
      if (back) back.click();
      else close();
      return;
    }
    if (event.key !== 'Tab') return;
    var dialog = stack[stack.length - 1].wrap.querySelector('[role="dialog"]');
    var items = focusable(dialog);
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onPop() {
    if (ignorePop) {
      ignorePop = false;
      return;
    }
    if (stack.length) close(true);
  }

  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener('keydown', onKey);
    window.addEventListener('popstate', onPop);
  }

  function toastWrap() {
    var node = document.getElementById('toast-wrap');
    if (!node) {
      node = el('div', 'toast-wrap');
      node.id = 'toast-wrap';
      document.body.appendChild(node);
    }
    return node;
  }

  function clearToast() {
    window.clearTimeout(toastTimer);
    var node = document.getElementById('toast-wrap');
    if (node) node.replaceChildren();
  }

  /* One toast at a time. timeout is in milliseconds; leave it out to keep the toast. */
  function toast(opts) {
    var box = toastWrap();
    var node = el('div', 'toast' + (opts.tone ? ' toast-' + opts.tone : ''));
    var icon = el('span', 'toast-icon');
    var copy = el('div', 'toast-copy');
    node.setAttribute('role', 'status');
    if (opts.icon) icon.appendChild(Icons.el(opts.icon, 20));
    copy.appendChild(el('strong', null, opts.title || ''));
    if (opts.body) copy.appendChild(el('span', null, opts.body));
    node.appendChild(icon);
    node.appendChild(copy);
    if (opts.action) {
      var button = el('button', 'btn ' + (opts.actionClass || 'btn-primary'), opts.action);
      button.type = 'button';
      button.addEventListener('click', function () {
        if (opts.onAction) opts.onAction();
      });
      node.appendChild(button);
    }
    box.replaceChildren(node);
    window.clearTimeout(toastTimer);
    function arm() {
      if (!opts.timeout) return;
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(clearToast, opts.timeout);
    }
    node.addEventListener('mouseenter', function () { window.clearTimeout(toastTimer); });
    node.addEventListener('mouseleave', arm);
    node.addEventListener('focusin', function () { window.clearTimeout(toastTimer); });
    node.addEventListener('focusout', arm);
    arm();
  }

  function offlineToast() {
    toast({
      icon: 'offline',
      title: I18n.t('offlineTitle'),
      body: I18n.t('offlineBody'),
      action: I18n.t('tryAgain'),
      onAction: function () {
        if (window.Shell) Shell.reload();
      }
    });
  }

  return {
    el: el,
    phone: phone,
    open: open,
    close: close,
    closeAll: closeAll,
    toast: toast,
    clearToast: clearToast,
    offlineToast: offlineToast
  };
})();
