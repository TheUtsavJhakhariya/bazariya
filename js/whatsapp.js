/* Builds the order message and opens WhatsApp.
   A cart send is remembered until the customer says whether they pressed Send.
   A single item from Buy now never changes the cart and is not remembered. */

var WhatsApp = (function () {
  var SENT_KEY = 'bazariyaa-awaiting-send';
  var LIMIT = 2000;
  var lastText = '';
  var lastUrl = '';
  var leftPage = false;
  var watching = false;
  var holdAsk = false;

  function area() {
    try {
      return localStorage.getItem('bazariyaa-area') || '';
    } catch (err) {
      return '';
    }
  }

  function link(text) {
    var digits = Config.digits(Config.get().whatsappNumber);
    return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(text);
  }

  function summary(lines) {
    var count = 0;
    var total = 0;
    lines.forEach(function (line) {
      count += line.qty;
      total += line.price * line.qty;
    });
    return { count: count, total: total };
  }

  function write(lines, opts) {
    var shop = Config.get().shopName || 'BAZARIYAA';
    var rows = ['Hello ' + shop + '!'];
    if (opts.part) rows.push('Order part ' + opts.part + ' of ' + opts.parts);
    rows.push('I want to order these items:');
    rows.push('');
    lines.forEach(function (line, index) {
      if (opts.compact) rows.push(line.name);
      else rows.push((index + 1) + '. ' + line.name + ' (#' + line.id + ')');
      rows.push('   ' + Config.money(line.price) + ' × ' + line.qty + ' = ' + Config.money(line.price * line.qty));
      if (line.note && String(line.note).trim()) rows.push('   Note: ' + String(line.note).trim());
    });
    rows.push('');
    if (!opts.part || opts.part === opts.parts) {
      var freeAt = Config.get().freeDeliveryAbove || 0;
      rows.push('TOTAL AMOUNT: ' + Config.money(opts.total));
      rows.push(opts.total >= freeAt ? 'Delivery: Free' : 'Delivery: To be confirmed');
      if (opts.area) rows.push('Area: ' + opts.area);
      rows.push('');
      rows.push('My Name:');
      rows.push('Address:');
      rows.push('Phone:');
    } else {
      rows.push('Continued in the next message.');
    }
    return rows.join('\n');
  }

  /* One message if it fits. Otherwise drop the numbers, then split into two parts. */
  function pack(lines) {
    var totals = summary(lines);
    var opts = { total: totals.total, area: area(), compact: false };
    var full = write(lines, opts);
    if (link(full).length <= LIMIT) return [full];
    opts.compact = true;
    var compact = write(lines, opts);
    if (link(compact).length <= LIMIT) return [compact];
    var mid = Math.ceil(lines.length / 2);
    var first = write(lines.slice(0, mid), {
      total: totals.total, area: area(), compact: true, part: 1, parts: 2
    });
    var second = write(lines.slice(mid), {
      total: totals.total, area: area(), compact: true, part: 2, parts: 2
    });
    return [first, second];
  }

  /* A real link click is allowed. window.open is often blocked, which
     looks like WhatsApp never connected. */
  function launch(url) {
    var link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
    }
    fallbackCopy(text);
    return Promise.resolve();
  }

  function fallbackCopy(text) {
    var areaBox = document.createElement('textarea');
    areaBox.value = text;
    areaBox.setAttribute('readonly', '');
    areaBox.style.position = 'fixed';
    areaBox.style.left = '-999px';
    document.body.appendChild(areaBox);
    areaBox.select();
    try { document.execCommand('copy'); } catch (err) { /* The toast still explains what to do. */ }
    areaBox.remove();
  }

  function copiedToast() {
    UI.toast({
      tone: 'dark',
      icon: 'copy',
      title: I18n.t('copiedTitle'),
      body: I18n.format('copiedBody', { number: Config.get().whatsappNumber || '' }),
      action: I18n.t('openWhatsApp'),
      actionClass: 'btn-accent',
      timeout: 8000,
      onAction: function () { launch(lastUrl); }
    });
  }

  function failToast() {
    UI.toast({
      tone: 'warn',
      icon: 'alert',
      title: I18n.t('waFailTitle'),
      body: I18n.t('waFailBody'),
      action: I18n.t('copyOrderBtn'),
      timeout: 8000,
      onAction: function () {
        copyText(lastText).then(copiedToast);
      }
    });
  }

  function markSent(info) {
    try {
      sessionStorage.setItem(SENT_KEY, JSON.stringify(info));
    } catch (err) {
      /* If storage is blocked we simply do not ask later. */
    }
  }

  function pending() {
    try {
      var raw = sessionStorage.getItem(SENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function clearPending() {
    try { sessionStorage.removeItem(SENT_KEY); } catch (err) { /* Nothing to clear. */ }
  }

  function opening(texts, urls, cartOrder, info, swap) {
    var dialog = UI.el('div', 'wa-dialog');
    var band = UI.el('div', 'wa-band');
    var mark = UI.el('span', 'wa-mark');
    var title = UI.el('h2', 'wa-title', I18n.t('openingTitle'));
    var steps = UI.el('ol', 'wa-steps');
    var actions = UI.el('div', 'wa-actions');
    var copy = UI.el('button', 'btn btn-outline');
    var back = UI.el('button', 'wa-back', cartOrder ? I18n.t('backShopCart') : I18n.t('backShop'));
    title.id = 'wa-title';
    mark.appendChild(Icons.el('chat', 26));
    band.appendChild(mark);
    var titles = UI.el('div');
    titles.appendChild(title);
    titles.appendChild(UI.el('p', null, I18n.t('openingBody')));
    band.appendChild(titles);
    [I18n.t('opening1'), I18n.t('opening2'), I18n.t('opening3')].forEach(function (text, index) {
      var item = UI.el('li');
      item.appendChild(UI.el('span', null, String(index + 1)));
      item.appendChild(UI.el('p', null, text));
      steps.appendChild(item);
    });
    copy.type = 'button';
    copy.appendChild(Icons.el('copy', 18));
    copy.appendChild(document.createTextNode(I18n.t('copyOrder')));
    copy.addEventListener('click', function () {
      copyText(lastText).then(copiedToast);
    });
    actions.appendChild(copy);
    urls.forEach(function (url, index) {
      var label = urls.length === 1 ? I18n.t('tryAgainWa') : I18n.format('sendPart', { n: String(index + 1) });
      var button = UI.el('a', 'btn btn-accent');
      button.href = url;
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
      if (urls.length === 1) button.appendChild(Icons.el('chat', 18));
      button.appendChild(document.createTextNode(label));
      button.addEventListener('click', function () {
        lastUrl = url;
        if (cartOrder) markSent(info);
      });
      actions.appendChild(button);
    });
    back.type = 'button';
    back.addEventListener('click', function () { UI.close(); });
    dialog.appendChild(band);
    dialog.appendChild(steps);
    dialog.appendChild(UI.el('p', 'wa-miss', I18n.t('didntOpen')));
    dialog.appendChild(actions);
    dialog.appendChild(back);
    UI.open({
      kind: UI.phone() ? 'sheet' : 'modal',
      node: dialog,
      labelledBy: 'wa-title',
      focus: '.btn-accent',
      swap: !!swap
    });
  }

  function sendLines(lines, cartOrder, swap) {
    if (!lines.length || !Config.phoneOk()) return;
    var texts = pack(lines);
    var urls = texts.map(link);
    var info = summary(lines);
    lastText = texts.join('\n\n');
    lastUrl = urls[0];
    holdAsk = true;
    window.setTimeout(function () { holdAsk = false; }, 500);
    opening(texts, urls, cartOrder, info, swap);
    if (!launch(urls[0])) failToast();
    else if (cartOrder) markSent(info);
  }

  function sendCart() {
    sendLines(Cart.lines(Data.products()), true);
  }

  function maybeAsk() {
    var info = pending();
    if (holdAsk || !info || document.getElementById('did-send')) return;
    if (window.CartView) CartView.askSent(info);
  }

  function watch() {
    if (watching) return;
    watching = true;
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') leftPage = true;
      if (document.visibilityState === 'visible' && leftPage) maybeAsk();
    });
    if (pending()) maybeAsk();
  }

  function yesSent() {
    clearPending();
    Cart.clear();
    UI.closeAll();
    UI.clearToast();
    if (window.Shell) Shell.updateCart();
    UI.toast({
      icon: 'check',
      title: I18n.t('thanksSent'),
      timeout: 5000
    });
  }

  function notYet() {
    clearPending();
    UI.closeAll();
  }

  /* A short question, not a shop order. No "did you send it?" afterwards. */
  function ask(text) {
    if (!Config.phoneOk()) return false;
    var url = link(text);
    lastText = text;
    lastUrl = url;
    if (!launch(url)) {
      failToast();
      return false;
    }
    return true;
  }

  return {
    sendLines: sendLines,
    sendCart: sendCart,
    ask: ask,
    watch: watch,
    yesSent: yesSent,
    notYet: notYet,
    clearPending: clearPending
  };
})();
