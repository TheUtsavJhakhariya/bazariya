/* Quantity dialog. Buy now and Add to cart both open this.
   Order now sends only this item and does not change the cart.
   Add to cart keeps the quantity and then shows the added confirmation. */

var Quantity = (function () {
  var PICKS = [1, 2, 3, 5, 10];
  var current = null;

  function maxQty() {
    return Config.get().maxQtyPerItem || 99;
  }

  function clamp(value) {
    var number = Math.round(Number(value) || 0);
    if (number < 1) return 1;
    return Math.min(maxQty(), number);
  }

  function photo(product) {
    var frame = UI.el('div', 'qty-photo');
    var img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = product.images.length ? product.images[0] : 'images/placeholder.svg';
    img.addEventListener('error', function onErr() {
      img.removeEventListener('error', onErr);
      img.src = 'images/placeholder.svg';
    });
    frame.appendChild(UI.el('span', 'qty-tag', 'No. ' + Data.padId(product.id)));
    frame.appendChild(img);
    return frame;
  }

  function paint() {
    var dialog = document.getElementById('qty-dialog');
    if (!dialog || !current) return;
    var picks = dialog.querySelectorAll('[data-pick]');
    picks.forEach(function (button) {
      var on = Number(button.getAttribute('data-pick')) === current.qty;
      button.classList.toggle('is-on', on);
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var input = dialog.querySelector('.qty-input');
    if (input && document.activeElement !== input) input.value = String(current.qty);
    var minus = dialog.querySelector('[data-step="-1"]');
    var plus = dialog.querySelector('[data-step="1"]');
    if (minus) minus.disabled = current.qty <= 1;
    if (plus) plus.disabled = current.qty >= maxQty();
    var times = dialog.querySelector('.qty-times');
    var big = dialog.querySelector('.qty-big');
    if (times) {
      times.textContent = I18n.format('totalTimes', {
        qty: String(current.qty),
        price: Config.money(current.product.price)
      });
    }
    if (big) big.textContent = Config.money(current.product.price * current.qty);
  }

  function setQty(value) {
    current.qty = clamp(value);
    paint();
  }

  function choice(className, icon, title, sub, action) {
    var button = UI.el('button', 'btn qty-choice ' + className);
    var text = UI.el('span', 'qty-choice-text');
    button.type = 'button';
    button.setAttribute('data-qty', action);
    button.appendChild(Icons.el(icon, 18));
    text.appendChild(UI.el('strong', null, title));
    text.appendChild(UI.el('small', null, sub));
    button.appendChild(text);
    return button;
  }

  function build(product, mode) {
    var dialog = UI.el('div', 'qty-dialog');
    var top = UI.el('div', 'qty-top');
    var info = UI.el('div', 'qty-info');
    var head = UI.el('div', 'qty-head');
    var close = UI.el('button', 'btn btn-outline', I18n.t('close'));
    var price = UI.el('p', 'qty-price');
    var how = UI.el('div', 'qty-how');
    var picks = UI.el('div', 'qty-picks');
    var stepper = UI.el('div', 'stepper is-lg');
    var minus = UI.el('button', 'step-btn', '−');
    var input = UI.el('input', 'qty-input');
    var plus = UI.el('button', 'step-btn is-plus', '+');
    var total = UI.el('div', 'qty-total');
    var actions = UI.el('div', 'qty-actions');
    var addClass = mode === 'add' ? 'btn-primary' : 'btn-outline';
    var addBtn = choice(addClass, 'cart', I18n.t('addToCart'), I18n.t('addKeep'), 'add');
    var orderBtn = choice('btn-accent', 'chat', I18n.t('orderNow'), I18n.t('onlyThis'), 'order');
    var name = UI.el('h2', 'qty-name', product.name);
    dialog.id = 'qty-dialog';
    name.id = 'qty-name';
    close.type = 'button';
    close.setAttribute('data-qty', 'close');
    close.insertBefore(Icons.el('close', 16), close.firstChild);
    head.appendChild(UI.el('p', 'qty-cat', Data.tagFor(product.category)));
    head.appendChild(close);
    price.appendChild(UI.el('span', null, Config.money(product.price)));
    price.appendChild(UI.el('small', null, I18n.t('each')));
    info.appendChild(head);
    info.appendChild(name);
    if (product.description) info.appendChild(UI.el('p', 'qty-desc', product.description));
    info.appendChild(price);
    top.appendChild(photo(product));
    top.appendChild(info);
    how.appendChild(UI.el('p', null, I18n.t('howMany')));
    PICKS.forEach(function (number) {
      var pick = UI.el('button', 'qty-pick', String(number));
      pick.type = 'button';
      pick.setAttribute('data-pick', String(number));
      pick.disabled = number > maxQty();
      picks.appendChild(pick);
    });
    how.appendChild(picks);
    minus.type = 'button';
    minus.setAttribute('data-step', '-1');
    minus.setAttribute('aria-label', I18n.t('decrease'));
    plus.type = 'button';
    plus.setAttribute('data-step', '1');
    plus.setAttribute('aria-label', I18n.t('increase'));
    input.type = 'text';
    input.inputMode = 'numeric';
    input.setAttribute('aria-label', I18n.t('quantity'));
    input.value = String(current.qty);
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '');
      if (digits) current.qty = clamp(digits);
      paint();
    });
    input.addEventListener('blur', function () {
      setQty(input.value);
      input.value = String(current.qty);
    });
    stepper.appendChild(minus);
    stepper.appendChild(input);
    stepper.appendChild(plus);
    how.appendChild(stepper);
    total.setAttribute('aria-live', 'polite');
    total.appendChild(UI.el('span', 'qty-times', ''));
    total.appendChild(UI.el('span', 'qty-big', ''));
    if (!Config.phoneOk()) orderBtn.disabled = true;
    if (UI.phone() && mode === 'buy') {
      actions.appendChild(orderBtn);
      actions.appendChild(addBtn);
    } else {
      actions.appendChild(addBtn);
      actions.appendChild(orderBtn);
    }
    if (UI.phone()) {
      var handle = UI.el('div', 'sheet-handle');
      handle.setAttribute('aria-hidden', 'true');
      dialog.appendChild(handle);
      handle.addEventListener('pointerdown', function (event) {
        handle.setPointerCapture(event.pointerId);
        handle.dataset.y = String(event.clientY);
      });
      handle.addEventListener('pointerup', function (event) {
        if (event.clientY - Number(handle.dataset.y || 0) > 70) UI.close();
      });
    }
    dialog.appendChild(top);
    dialog.appendChild(how);
    dialog.appendChild(total);
    dialog.appendChild(actions);
    dialog.addEventListener('click', onClick);
    return dialog;
  }

  function onClick(event) {
    var target = event.target.closest('button');
    if (!target || !current) return;
    if (target.getAttribute('data-qty') === 'close') {
      UI.close();
      return;
    }
    if (target.getAttribute('data-pick')) {
      setQty(target.getAttribute('data-pick'));
      return;
    }
    if (target.getAttribute('data-step')) {
      setQty(current.qty + Number(target.getAttribute('data-step')));
      return;
    }
    if (target.getAttribute('data-qty') === 'add') addNow();
    if (target.getAttribute('data-qty') === 'order') orderNow();
  }

  function addNow() {
    var product = current.product;
    var before = Cart.snapshot();
    var added = Cart.add(product.id, current.qty);
    UI.close();
    if (!added) return;
    if (window.Shell) Shell.updateCart();
    if (window.CartView) CartView.feedback(product, added, before);
  }

  function orderNow() {
    var product = current.product;
    var line = {
      id: product.id,
      name: product.name,
      price: product.price,
      qty: current.qty,
      note: ''
    };
    WhatsApp.sendLines([line], false, true);
  }

  function open(id, mode, swap) {
    var product = Data.byId(id);
    if (!product || !product.inStock) return;
    current = { product: product, qty: 1, mode: mode === 'buy' ? 'buy' : 'add' };
    var dialog = build(product, current.mode);
    UI.open({
      kind: UI.phone() ? 'sheet' : 'modal',
      node: dialog,
      labelledBy: 'qty-name',
      focus: current.mode === 'buy' ? '[data-qty="order"]' : '[data-qty="add"]',
      swap: !!swap,
      onClose: function () { current = null; }
    });
    paint();
  }

  return { open: open };
})();
