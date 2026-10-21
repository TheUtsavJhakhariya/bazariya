/* Header, footer and the sticky cart bar. Drawn on every page. */

var Shell = (function () {
  var listening = false;
  var cartBarTimer = null;
  var cartBarKey = '';

  var NAV = [
    { page: 'home', href: 'index.html', key: 'navShop' },
    { page: 'about', href: 'about.html', key: 'about' },
    { page: 'return', href: 'return-policy.html', key: 'returnPolicy' },
    { page: 'terms', href: 'terms.html', key: 'terms' }
  ];

  var FOOTER_LINKS = [
    { page: 'about', href: 'about.html', key: 'about' },
    { page: 'return', href: 'return-policy.html', key: 'returnPolicy' },
    { page: 'terms', href: 'terms.html', key: 'terms' }
  ];

  function page() {
    return document.body.getAttribute('data-page') || 'home';
  }

  function areaName() {
    try {
      return localStorage.getItem('bazariyaa-area') || '';
    } catch (err) {
      return '';
    }
  }

  function deliveryText(withCash) {
    var area = areaName();
    var main = area ? I18n.t('deliveringTo') + ' ' + area : I18n.t('delivering');
    if (withCash) return main + ' · ' + I18n.t('cashShort');
    return main;
  }

  function brandLink() {
    var cfg = Config.get();
    var word = String(cfg.shopName || 'BAZARIYAA').toLocaleLowerCase();
    var link = UI.el('a', 'brand');
    /* Always the shop home, on every page. */
    link.href = 'index.html';
    var mark = UI.el('span', 'brand-mark');
    var logo = UI.el('img');
    logo.src = 'images/Logo.svg';
    logo.alt = '';
    mark.appendChild(logo);
    link.appendChild(mark);
    var text = UI.el('span', 'brand-text');
    text.appendChild(UI.el('span', 'brand-name', word));
    text.appendChild(UI.el('span', 'brand-tag', cfg.tagline || ''));
    link.appendChild(text);
    return link;
  }

  function deliveryButton(className, withCash) {
    var button = UI.el('button', 'pill delivery ' + className);
    button.type = 'button';
    button.setAttribute('data-action', 'area');
    var label = deliveryText(withCash);
    button.setAttribute('aria-label', label);
    button.appendChild(Icons.el('pin', 20));
    button.appendChild(UI.el('span', 'delivery-label', label));
    return button;
  }

  function trustItem(icon, label) {
    var item = UI.el('li');
    item.appendChild(Icons.el(icon, 20));
    item.appendChild(UI.el('span', null, label));
    return item;
  }

  function trustStrip() {
    var cfg = Config.get();
    var strip = UI.el('div', 'trust-strip');
    var list = UI.el('ul', 'trust-strip__list');
    list.appendChild(trustItem('cash', I18n.t('cod')));
    list.appendChild(trustItem('truck', I18n.t('freeAbove') + ' ' + Config.money(cfg.freeDeliveryAbove)));
    if (Config.phoneOk()) {
      var contact = UI.el('li');
      var link = UI.el('a');
      contact.appendChild(Icons.el('chat', 20));
      link.href = 'https://wa.me/' + Config.digits(cfg.whatsappNumber);
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = cfg.whatsappNumber;
      contact.appendChild(link);
      list.appendChild(contact);
    }
    strip.appendChild(list);
    return strip;
  }

  function renderHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;
    header.className = 'site-header';
    header.replaceChildren();

    var wrap = UI.el('div', 'wrap');
    var row = UI.el('div', 'header-row');
    var left = UI.el('div', 'header-left');
    left.appendChild(brandLink());
    left.appendChild(deliveryButton('delivery-desktop', false));
    row.appendChild(left);

    var nav = UI.el('nav', 'header-nav');
    nav.id = 'header-nav';
    nav.setAttribute('aria-label', Config.get().shopName || 'BAZARIYAA');
    var here = page();
    NAV.forEach(function (item) {
      var on = item.page === here;
      var link = UI.el('a', 'nav-link' + (on ? ' is-active' : ''), I18n.t(item.key));
      link.href = item.href;
      if (on) link.setAttribute('aria-current', 'page');
      nav.appendChild(link);
    });
    row.appendChild(nav);

    var tools = UI.el('div', 'header-tools');
    var menu = UI.el('button', 'nav-toggle');
    menu.type = 'button';
    menu.setAttribute('data-action', 'nav-toggle');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-controls', 'header-nav');
    menu.setAttribute('aria-label', I18n.t('menu'));
    menu.appendChild(Icons.el('menu', 22));
    tools.appendChild(menu);

    var lang = UI.el('button', 'pill lang-btn');
    lang.type = 'button';
    lang.setAttribute('data-action', 'lang-open');
    lang.setAttribute('aria-label', I18n.t('language'));
    lang.appendChild(Icons.el('language', 20));
    lang.appendChild(UI.el('span', null, I18n.code()));
    tools.appendChild(lang);

    var cart = UI.el('button', 'cart-btn');
    cart.type = 'button';
    cart.setAttribute('data-action', 'open-cart');
    cart.appendChild(Icons.el('cart', 22));
    cart.appendChild(UI.el('span', 'cart-badge', '0'));
    tools.appendChild(cart);
    row.appendChild(tools);
    wrap.appendChild(row);
    wrap.appendChild(deliveryButton('delivery-phone', true));

    var title = UI.el('h1', 'visually-hidden', Config.get().shopName || 'BAZARIYAA');
    header.appendChild(trustStrip());
    header.appendChild(title);
    header.appendChild(wrap);
  }

  function footerMark() {
    var tagline = String(Config.get().tagline || 'Ghar ka bazaar').trim();
    var parts = tagline.split(/\s+/);
    var last = parts.pop() || '';
    var mark = UI.el('p', 'footer-mark');
    if (parts.length) {
      mark.appendChild(document.createTextNode(parts.join(' ')));
    }
    var em = document.createElement('em');
    em.textContent = last.replace(/\.$/, '') + '.';
    mark.appendChild(em);
    return mark;
  }

  function renderFooter() {
    var footer = document.getElementById('site-footer');
    if (!footer) return;
    footer.className = 'site-footer';
    footer.replaceChildren();

    var cfg = Config.get();
    var card = UI.el('div', 'footer-card');
    var top = UI.el('div', 'footer-top');
    top.appendChild(footerMark());

    var facts = UI.el('p', 'footer-facts');
    facts.appendChild(document.createTextNode(I18n.t('cod')));
    facts.appendChild(document.createElement('br'));
    facts.appendChild(document.createTextNode(I18n.t('freeAbove') + ' ' + Config.money(cfg.freeDeliveryAbove)));
    facts.appendChild(document.createElement('br'));
    facts.appendChild(document.createTextNode(String(cfg.city || 'Surat').toUpperCase() + ', GUJARAT'));
    top.appendChild(facts);
    card.appendChild(top);
    card.appendChild(UI.el('hr', 'footer-rule'));

    var bottom = UI.el('div', 'footer-bottom');
    var links = UI.el('nav', 'footer-links');
    links.setAttribute('aria-label', I18n.t('about'));
    FOOTER_LINKS.forEach(function (item) {
      var link = UI.el('a', null, I18n.t(item.key));
      link.href = item.href;
      if (item.page === page()) link.setAttribute('aria-current', 'page');
      links.appendChild(link);
    });
    bottom.appendChild(links);

    var switcher = UI.el('div', 'lang-switch');
    var codes = [
      { lang: 'en', label: 'EN' },
      { lang: 'hi', label: 'हिं' },
      { lang: 'gu', label: 'ગુ' }
    ];
    codes.forEach(function (item, index) {
      if (index > 0) switcher.appendChild(UI.el('span', 'lang-slash', '/'));
      var button = UI.el('button', null, item.label);
      button.type = 'button';
      button.setAttribute('data-action', 'lang');
      button.setAttribute('data-lang', item.lang);
      if (I18n.get() === item.lang) button.setAttribute('aria-current', 'true');
      button.setAttribute('aria-label', item.lang === 'en' ? 'English' : item.lang === 'hi' ? 'हिंदी' : 'ગુજરાતી');
      switcher.appendChild(button);
    });
    bottom.appendChild(switcher);
    card.appendChild(bottom);

    var wrap = UI.el('div', 'wrap');
    wrap.appendChild(card);
    footer.appendChild(wrap);
  }

  function renderCartBar() {
    var bar = document.getElementById('cart-bar');
    if (!bar) return;
    bar.className = 'cart-bar';
    bar.replaceChildren();

    var textBtn = UI.el('button', 'cart-bar-text');
    textBtn.type = 'button';
    textBtn.setAttribute('data-action', 'open-cart');
    textBtn.appendChild(UI.el('span', 'cart-bar-kicker', I18n.t('yourCart')));
    textBtn.appendChild(UI.el('span', 'cart-bar-total', ''));
    bar.appendChild(textBtn);

    var send = UI.el('button', 'btn btn-accent');
    send.type = 'button';
    send.setAttribute('data-action', 'send-cart');
    send.appendChild(Icons.el('chat', 20));
    send.appendChild(UI.el('span', 'send-long', I18n.t('sendOrder')));
    send.appendChild(UI.el('span', 'send-short', I18n.t('sendShort')));
    bar.appendChild(send);
    bar.hidden = true;
  }

  function updateCart() {
    var products = Data.products();
    var rows = Cart.lines(products);
    var count = 0;
    var total = 0;
    rows.forEach(function (line) {
      count += line.qty;
      total += line.price * line.qty;
    });

    var badge = document.querySelector('.cart-badge');
    var cartBtn = document.querySelector('.cart-btn');
    if (badge) badge.textContent = String(count);
    if (cartBtn) {
      cartBtn.classList.toggle('has-count', count > 0);
      cartBtn.setAttribute('aria-label', count ? I18n.t('cart') + ', ' + I18n.items(count) : I18n.t('cart'));
    }

    var bar = document.getElementById('cart-bar');
    if (!bar) return;
    var totalEl = bar.querySelector('.cart-bar-total');
    if (totalEl) totalEl.textContent = I18n.items(count) + ' · ' + Config.money(total);
    var send = bar.querySelector('[data-action="send-cart"]');
    if (send) send.disabled = !Config.phoneOk();
    flashCartBar(rows);
    if (window.CartView) CartView.refresh();
  }

  /* The header cart stays. This bar is only a short reminder after a change. */
  function cartKey(rows) {
    return rows.map(function (line) {
      return line.id + 'x' + line.qty;
    }).join('|');
  }

  function hideCartBar() {
    cartBarTimer = null;
    var bar = document.getElementById('cart-bar');
    if (bar) bar.hidden = true;
    document.body.classList.remove('has-cart');
  }

  function flashCartBar(rows) {
    var bar = document.getElementById('cart-bar');
    if (!bar) return;
    var key = cartKey(rows);
    if (!key) {
      if (cartBarTimer) clearTimeout(cartBarTimer);
      cartBarKey = '';
      hideCartBar();
      return;
    }
    if (key === cartBarKey) return;
    cartBarKey = key;
    bar.hidden = false;
    document.body.classList.add('has-cart');
    if (cartBarTimer) clearTimeout(cartBarTimer);
    cartBarTimer = setTimeout(hideCartBar, 5000);
  }

  function droppedToast(count) {
    if (!count) return;
    UI.toast({
      icon: 'alert',
      title: I18n.t('cartUpdated'),
      body: I18n.t(count === 1 ? 'cartDroppedOne' : 'cartDroppedMany'),
      timeout: 6000
    });
  }

  function reload() {
    UI.clearToast();
    if (window.Home) Home.loading();
    Data.load().then(function (result) {
      var dropped = Cart.prune(Data.products());
      updateCart();
      if (result.source === 'cache') UI.offlineToast();
      else droppedToast(dropped);
      if (window.Home) Home.show();
    }).catch(function () {
      updateCart();
      if (window.Home) Home.showError();
    });
  }

  function closeNav() {
    var nav = document.getElementById('header-nav');
    var button = document.querySelector('.nav-toggle');
    if (nav) nav.classList.remove('is-open');
    if (button) button.setAttribute('aria-expanded', 'false');
  }

  function onClick(event) {
    var inNav = event.target.closest('#header-nav');
    var toggle = event.target.closest('.nav-toggle');
    if (!inNav && !toggle) closeNav();
    var target = event.target.closest('[data-action]');
    if (!target || target.disabled) return;
    var action = target.getAttribute('data-action');
    if (action === 'nav-toggle') {
      var nav = document.getElementById('header-nav');
      if (!nav) return;
      var open = nav.classList.toggle('is-open');
      target.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    if (action === 'add') {
      if (window.Quantity) Quantity.open(target.getAttribute('data-id'), 'add');
      return;
    }
    if (action === 'buy') {
      if (window.Quantity) Quantity.open(target.getAttribute('data-id'), 'buy');
      return;
    }
    if (action === 'open-cart') {
      if (window.CartView) CartView.open();
      return;
    }
    if (action === 'send-cart') {
      if (window.WhatsApp) WhatsApp.sendCart();
      return;
    }
    if (action === 'lang') {
      I18n.set(target.getAttribute('data-lang'));
      return;
    }
    if (action === 'retry') {
      reload();
      return;
    }
    if (action === 'search-open') {
      event.preventDefault();
      if (window.Search) Search.open();
      return;
    }
    if (action === 'area') {
      if (window.Area) Area.open(target.getAttribute('data-area') || '');
      return;
    }
    if (action === 'photo') {
      var product = Data.byId(target.getAttribute('data-id'));
      if (!product || !window.Viewer) return;
      if (!product.inStock) Viewer.soldOut(product);
      else Viewer.open(product.id);
      return;
    }
    if (action === 'lang-open') {
      if (window.Language) Language.open();
    }
  }

  function render() {
    if (window.CartView) CartView.closePopover();
    renderHeader();
    renderFooter();
    renderCartBar();
    updateCart();
  }

  function init() {
    if (!listening) {
      listening = true;
      document.addEventListener('click', onClick);
      I18n.onChange(function () {
        render();
        syncInfoLanguage();
        if (window.Home && Data.products().length) Home.show();
        if (window.Info) Info.show();
      });
      if (window.BZ && BZ.i18n) {
        BZ.i18n.onChange(function (lang) {
          if (I18n.get() !== lang) I18n.set(lang);
        });
      }
    }
    render();
    syncInfoLanguage();
  }

  /* About, Return and Terms keep their own translated text. Follow the header language. */
  function syncInfoLanguage() {
    if (!window.BZ || !BZ.i18n) return;
    if (BZ.i18n.lang() !== I18n.get()) BZ.i18n.set(I18n.get());
  }

  return { init: init, render: render, updateCart: updateCart, reload: reload };
})();

document.addEventListener('DOMContentLoaded', function () {
  Config.load().then(function () {
    I18n.init();
    Shell.init();
    return Data.load();
  }).then(function (result) {
    var dropped = Cart.prune(Data.products());
    Shell.updateCart();
    if (result.source === 'cache') UI.offlineToast();
    else if (dropped) {
      UI.toast({
        icon: 'alert',
        title: I18n.t('cartUpdated'),
        body: I18n.t(dropped === 1 ? 'cartDroppedOne' : 'cartDroppedMany'),
        timeout: 6000
      });
    }
    if (window.WhatsApp) WhatsApp.watch();
    if (window.Home) Home.show();
    if (window.Info) Info.show();
  }).catch(function () {
    Shell.updateCart();
    if (window.Home) Home.showError();
    if (window.Info) Info.show();
  });
});
