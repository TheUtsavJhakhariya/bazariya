/* The cart drawer (or full-screen cart on a phone), notes, and remove confirmation.
   The "added" popover sits under the cart button on a wide screen.
   On a phone that same moment is a dark toast with Undo. */

var CartView = (function () {
  var openCart = false;
  var editing = '';
  var draft = '';
  var removing = null;
  var popTimer = 0;
  var away = null;

  function lines() {
    return Cart.lines(Data.products());
  }

  function totals(rows) {
    var count = 0;
    var total = 0;
    rows.forEach(function (line) {
      count += line.qty;
      total += line.price * line.qty;
    });
    return { count: count, total: total };
  }

  function freeAt() {
    return Config.get().freeDeliveryAbove || 0;
  }

  function city() {
    return Config.get().city || 'Surat';
  }

  function thumb(line) {
    var product = Data.byId(line.id);
    var img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = product && product.images.length ? product.images[0] : 'images/placeholder.svg';
    img.addEventListener('error', function onErr() {
      img.removeEventListener('error', onErr);
      img.src = 'images/placeholder.svg';
    });
    return img;
  }

  function freeNote(total, mount) {
    var left = freeAt() - total;
    var text = UI.el('p', 'free-note');
    var sentence;
    var bits;
    if (left <= 0) {
      text.textContent = I18n.format('freeYes', { city: city() });
      mount.classList.add('is-free');
      return text;
    }
    sentence = I18n.format('addMoreFree', { amount: '\u0001', city: city() });
    bits = sentence.split('\u0001');
    text.appendChild(document.createTextNode(bits[0] || ''));
    text.appendChild(UI.el('strong', null, Config.money(left)));
    text.appendChild(document.createTextNode(bits[1] || ''));
    return text;
  }

  function meter(total) {
    var bar = UI.el('div', 'meter');
    var fill = UI.el('span');
    var goal = freeAt();
    var width = goal ? Math.max(0, Math.min(100, (total / goal) * 100)) : 0;
    fill.style.width = width + '%';
    bar.appendChild(fill);
    bar.hidden = total >= goal;
    return bar;
  }

  function refresh() {
    var drawer = document.getElementById('cart-drawer');
    if (!drawer || !openCart) return;
    var scroller = drawer.querySelector('.cart-scroll');
    var y = scroller ? scroller.scrollTop : 0;
    drawer.replaceWith(build());
    var next = document.querySelector('.cart-scroll');
    if (next) next.scrollTop = y;
  }

  function build() {
    var rows = lines();
    var sum = totals(rows);
    var drawer = UI.el('aside', 'cart-drawer');
    var head = UI.el('div', 'cart-head');
    var title = UI.el('h2', 'cart-title');
    var back = UI.el('button', 'btn btn-outline cart-back');
    var close = UI.el('button', 'btn btn-outline cart-close', I18n.t('close'));
    drawer.id = 'cart-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'cart-title');
    title.id = 'cart-title';
    title.appendChild(document.createTextNode(I18n.t('yourCartTitle') + ' '));
    title.appendChild(UI.el('em', null, I18n.t('cartWord')));
    back.type = 'button';
    back.appendChild(Icons.el('back', 18));
    back.appendChild(document.createTextNode(I18n.t('back')));
    back.addEventListener('click', function () { UI.close(); });
    close.type = 'button';
    close.insertBefore(Icons.el('close', 16), close.firstChild);
    close.addEventListener('click', function () { UI.close(); });
    head.appendChild(back);
    head.appendChild(title);
    head.appendChild(close);
    drawer.appendChild(head);
    if (!rows.length) {
      drawer.appendChild(emptyState());
      return drawer;
    }
    var banner = UI.el('div', 'free-card');
    var row = UI.el('div', 'free-row');
    row.appendChild(Icons.el('truck', 18));
    row.appendChild(freeNote(sum.total, banner));
    banner.appendChild(row);
    banner.appendChild(meter(sum.total));
    drawer.appendChild(banner);
    var scroller = UI.el('div', 'cart-scroll');
    rows.forEach(function (line) { scroller.appendChild(itemCard(line)); });
    drawer.appendChild(scroller);
    drawer.appendChild(footer(sum));
    drawer.addEventListener('click', onClick);
    drawer.addEventListener('change', onChange);
    return drawer;
  }

  function emptyState() {
    var box = UI.el('div', 'cart-empty');
    var title = UI.el('h2');
    var button = UI.el('button', 'btn btn-primary', I18n.t('startShopping'));
    box.appendChild(Icons.el('cart', 36));
    title.appendChild(document.createTextNode(I18n.t('cartEmpty') + ' '));
    title.appendChild(UI.el('em', null, I18n.t('emptyWord')));
    button.type = 'button';
    button.addEventListener('click', shop);
    box.appendChild(title);
    box.appendChild(button);
    return box;
  }

  function shop() {
    UI.closeAll();
    var section = document.getElementById('shop');
    if (section) section.scrollIntoView({ block: 'start' });
    else window.location.href = 'index.html#shop';
  }

  function itemCard(line) {
    var card = UI.el('article', 'cart-item');
    var top = UI.el('div', 'cart-item-top');
    var copy = UI.el('div');
    var tools = UI.el('div', 'cart-tools');
    var stepper = UI.el('div', 'stepper');
    var minus = UI.el('button', 'step-btn', '−');
    var input = UI.el('input', 'qty-input');
    var plus = UI.el('button', 'step-btn is-plus', '+');
    var noteBtn = UI.el('button', 'note-btn');
    var remove = UI.el('button', 'btn btn-danger', I18n.t('remove'));
    card.setAttribute('data-id', line.id);
    top.appendChild(thumb(line));
    copy.appendChild(UI.el('p', 'cart-name', line.name));
    copy.appendChild(UI.el('p', 'cart-meta', I18n.format('lineMeta', {
      id: Data.padId(line.id),
      price: Config.money(line.price),
      qty: String(line.qty)
    })));
    top.appendChild(copy);
    top.appendChild(UI.el('p', 'cart-line-price', Config.money(line.price * line.qty)));
    minus.type = 'button';
    minus.setAttribute('data-cart', 'dec');
    minus.setAttribute('aria-label', I18n.t('decrease'));
    plus.type = 'button';
    plus.setAttribute('data-cart', 'inc');
    plus.setAttribute('aria-label', I18n.t('increase'));
    plus.disabled = line.qty >= (Config.get().maxQtyPerItem || 99);
    input.className = 'qty-input';
    input.value = String(line.qty);
    input.inputMode = 'numeric';
    input.setAttribute('aria-label', I18n.t('quantity'));
    input.setAttribute('data-cart', 'qty');
    stepper.appendChild(minus);
    stepper.appendChild(input);
    stepper.appendChild(plus);
    noteBtn.type = 'button';
    noteBtn.setAttribute('data-cart', 'note');
    noteBtn.appendChild(Icons.el('note', 16));
    noteBtn.appendChild(document.createTextNode(line.note ? line.note : I18n.t('addNote')));
    remove.type = 'button';
    remove.setAttribute('data-cart', 'remove');
    tools.appendChild(stepper);
    tools.appendChild(noteBtn);
    tools.appendChild(remove);
    card.appendChild(top);
    card.appendChild(tools);
    if (editing === line.id) card.appendChild(noteBox(line));
    return card;
  }

  function noteBox(line) {
    var box = UI.el('div', 'note-box');
    var field = document.createElement('textarea');
    var counter = UI.el('span', 'note-count');
    var save = UI.el('button', 'btn btn-primary', I18n.t('save'));
    var max = Config.get().noteMaxLength || 120;
    field.value = draft;
    field.maxLength = max;
    field.placeholder = I18n.t('notePlaceholder');
    field.setAttribute('aria-label', I18n.format('noteFor', { name: line.name }));
    field.addEventListener('input', function () {
      draft = field.value.slice(0, max);
      counter.textContent = draft.length + ' / ' + max;
    });
    counter.textContent = draft.length + ' / ' + max;
    save.type = 'button';
    save.setAttribute('data-cart', 'save-note');
    box.appendChild(field);
    var row = UI.el('div', 'note-row');
    row.appendChild(counter);
    row.appendChild(save);
    box.appendChild(row);
    return box;
  }

  function footer(sum) {
    var box = UI.el('div', 'cart-foot');
    var row = UI.el('div', 'cart-foot-row');
    var send = UI.el('button', 'btn btn-accent btn-lg cart-send');
    row.appendChild(UI.el('span', null, I18n.format('totalItems', { items: I18n.items(sum.count) })));
    row.appendChild(UI.el('span', 'cart-grand', Config.money(sum.total)));
    box.appendChild(row);
    box.appendChild(UI.el('p', null, sum.total >= freeAt() ? I18n.t('deliveryFree') : I18n.t('deliveryConfirm')));
    send.type = 'button';
    send.disabled = !Config.phoneOk();
    send.appendChild(Icons.el('chat', 18));
    send.appendChild(document.createTextNode(I18n.t('sendOrder')));
    send.addEventListener('click', function () { WhatsApp.sendCart(); });
    box.appendChild(send);
    return box;
  }

  function onClick(event) {
    var button = event.target.closest('[data-cart]');
    if (!button) return;
    var card = button.closest('.cart-item');
    var id = card ? card.getAttribute('data-id') : '';
    var action = button.getAttribute('data-cart');
    var rows = lines();
    var line = null;
    rows.forEach(function (item) { if (item.id === id) line = item; });
    if (!line) return;
    if (action === 'inc') {
      Cart.setQty(id, line.qty + 1);
      sync();
    } else if (action === 'dec') {
      if (line.qty <= 1) askRemove(line);
      else {
        Cart.setQty(id, line.qty - 1);
        sync();
      }
    } else if (action === 'remove') {
      askRemove(line);
    } else if (action === 'note') {
      editing = id;
      draft = line.note || '';
      refresh();
      var field = document.querySelector('.note-box textarea');
      if (field) field.focus();
    } else if (action === 'save-note') {
      saveNote(line);
    }
  }

  function onChange(event) {
    var input = event.target;
    if (!input.getAttribute || input.getAttribute('data-cart') !== 'qty') return;
    var card = input.closest('.cart-item');
    var id = card ? card.getAttribute('data-id') : '';
    var number = Math.round(Number(input.value) || 0);
    if (number < 1) number = 1;
    Cart.setQty(id, number);
    sync();
  }

  function sync() {
    if (window.Shell) Shell.updateCart();
    else refresh();
  }

  function saveNote(line) {
    var previous = line.note || '';
    var text = draft.slice(0, Config.get().noteMaxLength || 120);
    Cart.setNote(line.id, text);
    editing = '';
    sync();
    UI.toast({
      tone: 'sage',
      icon: 'check',
      title: I18n.t('noteSaved'),
      body: I18n.format('noteSavedBody', { name: line.name, note: text }),
      action: I18n.t('undo'),
      actionClass: 'btn-light',
      timeout: 5000,
      onAction: function () {
        Cart.setNote(line.id, previous);
        UI.clearToast();
        sync();
      }
    });
  }

  function askRemove(line) {
    removing = line;
    var dialog = UI.el('div', 'remove-dialog');
    var top = UI.el('div', 'remove-top');
    var copy = UI.el('div');
    var title = UI.el('h2', 'remove-title');
    var actions = UI.el('div', 'remove-actions');
    var keep = UI.el('button', 'btn btn-primary btn-lg', I18n.t('keepIt'));
    var yes = UI.el('button', 'btn btn-danger btn-lg', I18n.t('yesRemove'));
    title.id = 'remove-title';
    title.appendChild(document.createTextNode(I18n.t('removeTitle') + ' '));
    title.appendChild(UI.el('em', null, I18n.t('removeTitleEm')));
    copy.appendChild(UI.el('p', 'cart-meta', I18n.format('lineMeta', {
      id: Data.padId(line.id),
      price: Config.money(line.price),
      qty: String(line.qty)
    })));
    copy.appendChild(UI.el('p', 'cart-name', line.name));
    top.appendChild(thumb(line));
    top.appendChild(copy);
    keep.type = 'button';
    yes.type = 'button';
    keep.addEventListener('click', function () { UI.close(); });
    yes.addEventListener('click', function () {
      Cart.remove(line.id);
      if (editing === line.id) editing = '';
      UI.close();
      sync();
    });
    actions.appendChild(keep);
    actions.appendChild(yes);
    dialog.appendChild(top);
    dialog.appendChild(title);
    if (line.note) dialog.appendChild(UI.el('p', 'remove-note', I18n.format('removeNote', { note: line.note })));
    dialog.appendChild(actions);
    UI.open({
      kind: 'modal',
      node: dialog,
      labelledBy: 'remove-title',
      focus: '.btn-primary',
      onBack: function () { UI.close(); },
      onClose: function () { removing = null; }
    });
  }

  function open() {
    if (openCart && document.getElementById('cart-drawer')) return;
    closePopover();
    openCart = true;
    editing = '';
    UI.open({
      kind: 'drawer',
      node: build(),
      labelledBy: 'cart-title',
      focus: UI.phone() ? '.cart-back' : '.cart-close',
      onClose: function () { openCart = false; editing = ''; }
    });
  }

  function feedback(product, qty, snapshot) {
    if (UI.phone()) phoneToast(product, qty, snapshot);
    else popover(product, qty, snapshot);
  }

  function undo(snapshot) {
    Cart.restore(snapshot);
    closePopover();
    UI.clearToast();
    if (window.Shell) Shell.updateCart();
  }

  function phoneToast(product, qty, snapshot) {
    UI.toast({
      tone: 'dark',
      icon: 'check',
      title: I18n.format('addedToast', { name: product.name }),
      body: I18n.format('addedToastBody', { qty: String(qty), price: Config.money(product.price) }),
      action: I18n.t('undo'),
      actionClass: 'btn-light',
      timeout: 5000,
      onAction: function () { undo(snapshot); }
    });
  }

  function popover(product, qty, snapshot) {
    closePopover();
    var rows = lines();
    var sum = totals(rows);
    var pop = UI.el('div', 'added-pop');
    var head = UI.el('div', 'added-head');
    var mark = UI.el('span', 'added-check');
    var item = UI.el('div', 'added-item');
    var copy = UI.el('div');
    var delivery = UI.el('div', 'added-free');
    var actions = UI.el('div', 'added-actions');
    var keep = UI.el('button', 'btn btn-outline', I18n.t('keepShopping'));
    var view = UI.el('button', 'btn btn-primary', I18n.format('viewCart', { n: String(sum.count) }));
    pop.id = 'added-pop';
    pop.setAttribute('role', 'status');
    mark.appendChild(Icons.el('check', 18));
    head.appendChild(mark);
    head.appendChild(UI.el('strong', null, I18n.t('addedTitle')));
    item.appendChild(thumb({ id: product.id }));
    copy.appendChild(UI.el('p', 'cart-name', product.name));
    copy.appendChild(UI.el('p', 'cart-meta', I18n.format('addedTimes', {
      qty: String(qty),
      price: Config.money(product.price)
    })));
    item.appendChild(copy);
    item.appendChild(UI.el('p', 'added-total', Config.money(product.price * qty)));
    delivery.appendChild(freeNote(sum.total, delivery));
    delivery.appendChild(meter(sum.total));
    keep.type = 'button';
    view.type = 'button';
    keep.addEventListener('click', closePopover);
    view.addEventListener('click', function () {
      closePopover();
      open();
    });
    actions.appendChild(keep);
    actions.appendChild(view);
    pop.appendChild(head);
    pop.appendChild(item);
    pop.appendChild(delivery);
    pop.appendChild(actions);
    document.body.appendChild(pop);
    place(pop);
    arm(pop);
    pop.addEventListener('mouseenter', function () { window.clearTimeout(popTimer); });
    pop.addEventListener('mouseleave', function () { arm(pop); });
    pop.addEventListener('focusin', function () { window.clearTimeout(popTimer); });
    pop.addEventListener('focusout', function (event) {
      if (!pop.contains(event.relatedTarget)) arm(pop);
    });
    window.setTimeout(function () {
      away = function (event) {
        if (!pop.contains(event.target)) closePopover();
      };
      document.addEventListener('click', away);
    }, 0);
    document.addEventListener('keydown', onPopKey);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
  }

  function place(pop) {
    var button = document.querySelector('.cart-btn');
    if (!button) return;
    var rect = button.getBoundingClientRect();
    var top = rect.bottom + 10;
    var right = window.innerWidth - rect.right;
    /* If the cart button has scrolled away, keep the note on the screen. */
    if (top < 12 || top > window.innerHeight - 120) top = 12;
    if (right < 12 || rect.left > window.innerWidth) right = 12;
    pop.style.top = Math.round(top) + 'px';
    pop.style.right = Math.max(12, Math.round(right)) + 'px';
  }

  function onResize() {
    var pop = document.getElementById('added-pop');
    if (pop) place(pop);
  }

  function arm(pop) {
    window.clearTimeout(popTimer);
    popTimer = window.setTimeout(function () {
      if (pop && pop.isConnected) closePopover();
    }, 5000);
  }

  function onPopKey(event) {
    if (event.key === 'Escape' && !document.body.classList.contains('has-layer')) closePopover();
  }

  function closePopover() {
    window.clearTimeout(popTimer);
    var pop = document.getElementById('added-pop');
    if (pop) pop.remove();
    if (away) document.removeEventListener('click', away);
    away = null;
    document.removeEventListener('keydown', onPopKey);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onResize, true);
  }

  function askSent(info) {
    if (document.getElementById('did-send')) return;
    var dialog = UI.el('div', 'did-dialog');
    var title = UI.el('h2', 'did-title');
    var summary = UI.el('div', 'did-summary');
    var yes = UI.el('button', 'btn btn-primary btn-lg');
    var no = UI.el('button', 'btn btn-outline btn-lg', I18n.t('notYet'));
    dialog.id = 'did-send';
    title.id = 'did-title';
    title.appendChild(document.createTextNode(I18n.t('didBefore')));
    title.appendChild(UI.el('em', null, I18n.t('didEm')));
    title.appendChild(document.createTextNode(I18n.t('didAfter')));
    summary.appendChild(UI.el('span', null, I18n.format('inYourOrder', { items: I18n.items(info.count) })));
    summary.appendChild(UI.el('strong', null, Config.money(info.total)));
    yes.type = 'button';
    no.type = 'button';
    yes.appendChild(Icons.el('check', 18));
    yes.appendChild(document.createTextNode(I18n.t('yesSent')));
    yes.addEventListener('click', function () { WhatsApp.yesSent(); });
    no.addEventListener('click', function () { WhatsApp.notYet(); });
    dialog.appendChild(UI.el('p', 'did-kicker', I18n.t('welcomeBack')));
    dialog.appendChild(title);
    dialog.appendChild(summary);
    dialog.appendChild(UI.el('p', 'did-body', I18n.t('didBody')));
    dialog.appendChild(yes);
    dialog.appendChild(no);
    UI.open({
      kind: UI.phone() ? 'sheet' : 'modal',
      node: dialog,
      labelledBy: 'did-title',
      focus: '.btn-primary',
      onBack: function () { WhatsApp.notYet(); }
    });
  }

  return {
    open: open,
    refresh: refresh,
    feedback: feedback,
    closePopover: closePopover,
    askSent: askSent
  };
})();
