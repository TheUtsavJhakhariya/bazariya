/* Home page. Buy now still does not change the cart. */

var Home = (function () {
  var HOME_AREAS = ['Adajan', 'Vesu', 'Pal', 'Piplod', 'Athwa', 'Varachha', 'Katargam', 'Udhna'];
  var UNDER = 120;
  var TRY = ['Garlic Press', 'Magic Towel', 'Umbrella', 'No. 154'];

  var filter = 'popular';
  var shown = null;
  var orderQuery = '';
  var searchQuery = '';
  var lastDept = '';
  var hoverDept = '';
  var focusDept = '';
  var pendingFocus = -1;
  var hashDone = false;
  var bound = false;

  function fill(key, map) {
    var text = I18n.t(key);
    Object.keys(map).forEach(function (name) {
      text = text.split('{' + name + '}').join(map[name]);
    });
    return text;
  }

  function cfg() {
    return Config.get();
  }

  function city() {
    return cfg().city || 'Surat';
  }

  function moneyOf(key) {
    return Config.money(cfg()[key]);
  }

  function present(products) {
    var have = {};
    products.forEach(function (product) { have[product.category] = true; });
    return Data.categories().filter(function (category) { return have[category.id]; });
  }

  function ensureDept(products) {
    var cats = present(products);
    var i;
    if (!cats.length) return;
    for (i = 0; i < cats.length; i += 1) {
      if (cats[i].id === lastDept) return;
    }
    lastDept = cats[0].id;
  }

  function minPrice(products) {
    var min = null;
    products.forEach(function (product) {
      if (min === null || product.price < min) min = product.price;
    });
    return min;
  }

  function findByNumber(raw) {
    var text = String(raw || '').replace(/#/g, '').replace(/no\.?/ig, '').trim();
    if (!/^\d+$/.test(text)) return null;
    return Data.byId(String(parseInt(text, 10)));
  }

  function pad2(n) {
    var text = String(n);
    return text.length < 2 ? '0' + text : text;
  }

  function lazyImg(src) {
    var img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', function onErr() {
      img.removeEventListener('error', onErr);
      img.src = 'images/placeholder.svg';
    });
    return img;
  }

  function button(className, text, action) {
    var node = UI.el('button', className, text);
    node.type = 'button';
    if (action) node.setAttribute('data-action', action);
    return node;
  }

  function buyBtn(product, className, label) {
    var node = button(className, label || I18n.t('buyNow'), 'buy');
    node.setAttribute('data-id', String(product.id));
    node.setAttribute('aria-label', I18n.t('buyNow') + ', ' + product.name);
    if (!product.inStock || !Config.phoneOk()) node.disabled = true;
    return node;
  }

  function addBtn(product, className, label) {
    var node = button(className, label || I18n.t('addToCart'), 'add');
    node.setAttribute('data-id', String(product.id));
    node.setAttribute('aria-label', I18n.t('addToCart') + ', ' + product.name);
    return node;
  }

  function serifHeading(plain, em) {
    var heading = UI.el('h2', 'serif-heading');
    if (plain) heading.appendChild(document.createTextNode(plain + ' '));
    heading.appendChild(UI.el('em', null, em));
    return heading;
  }

  function catalogueView(products) {
    var base = cfg().popularCount || 8;
    var step = cfg().showMoreStep || 20;
    var popular = [];
    var rest = [];
    var items;
    var count;
    if (filter === 'search') {
      items = window.Search ? Search.filter(products, searchQuery) : [];
      return { items: items, remaining: 0, step: step, mode: 'search' };
    }
    products.forEach(function (product) {
      if (product.popular) popular.push(product);
      else rest.push(product);
    });
    if (filter === 'popular') {
      var ordered = popular.concat(rest);
      count = Math.min(ordered.length, shown == null ? base : shown);
      return { items: ordered.slice(0, count), remaining: ordered.length - count, step: step, mode: 'popular' };
    }
    if (filter === 'all') {
      return { items: products.slice(), remaining: 0, step: step, mode: 'all' };
    }
    items = products.filter(function (product) { return product.category === filter; });
    return { items: items, remaining: 0, step: step, mode: 'category' };
  }

  function shopHeading() {
    var meta;
    var bits;
    var em;
    if (filter === 'search') return serifHeading(I18n.t('resultsFor'), '"' + searchQuery + '"');
    if (filter === 'popular') return serifHeading(I18n.t('popular'), I18n.t('thisWeek'));
    if (filter === 'all') return serifHeading(I18n.t('allWord'), I18n.t('itemsSerif'));
    meta = Data.meta(filter);
    bits = String(meta ? meta.department : filter).trim().split(/\s+/);
    em = bits.pop();
    return serifHeading(bits.join(' '), em);
  }

  function heroSub(tagline) {
    var line = UI.el('p', 'hero-sub');
    var words = String(tagline || 'Ghar ka bazaar').trim().split(/\s+/);
    var first = words.shift() || '';
    if (first.toLowerCase() === 'ghar') {
      line.appendChild(UI.el('span', 'hero-ghar', first));
      if (words.length) line.appendChild(document.createTextNode(' ' + words.join(' ')));
    } else {
      line.textContent = String(tagline || '');
    }
    return line;
  }

  function buildHero() {
    var section = UI.el('section', 'hero');
    var inner = UI.el('div', 'wrap');
    var copy = UI.el('div', 'hero-copy');
    section.setAttribute('aria-label', cfg().shopName || 'BAZARIYAA');
    copy.appendChild(UI.el('p', 'hero-title', (cfg().shopName || 'BAZARIYAA').toUpperCase()));
    copy.appendChild(heroSub(cfg().tagline));
    inner.appendChild(copy);
    section.appendChild(inner);
    return section;
  }

  function buildSearch(products) {
    var section = UI.el('section', 'band');
    var inner = UI.el('div', 'wrap');
    var statement = UI.el('p', 'band-statement');
    var form = UI.el('form', 'search-pill');
    var input = UI.el('input');
    var go = button('search-go', '', 'search-open');
    var tries = UI.el('div', 'try-row');
    var amount = moneyOf('freeDeliveryAbove');
    section.setAttribute('aria-label', I18n.t('searchLabel'));
    form.id = 'home-search';
    form.setAttribute('role', 'search');
    input.id = 'home-search-input';
    input.type = 'search';
    input.value = searchQuery;
    input.setAttribute('placeholder', I18n.t('searchPlaceholder'));
    input.setAttribute('aria-label', I18n.t('searchLabel'));
    go.setAttribute('aria-label', I18n.t('searchLabel'));
    go.appendChild(Icons.el('arrow', 20));
    inner.appendChild(UI.el('p', 'band-kicker', fill('namasteCity', { city: city().toUpperCase() })));
    statement.appendChild(UI.el('span', 'is-dim', I18n.t('weHave') + ' '));
    statement.appendChild(bandIcon('box'));
    statement.appendChild(UI.el('strong', null, fill('homeEssentials', { n: String(products.length) })));
    statement.appendChild(document.createTextNode(' '));
    statement.appendChild(bandIcon('truck'));
    statement.appendChild(UI.el('strong', null, fill('freeDeliveryPhrase', { city: city() })));
    statement.appendChild(UI.el('span', 'is-dim', ' ' + fill('aboveAnd', { amount: amount }) + ' '));
    statement.appendChild(bandIcon('cash'));
    statement.appendChild(document.createTextNode(' '));
    statement.appendChild(UI.el('strong', null, I18n.t('cashEnd')));
    inner.appendChild(statement);
    form.appendChild(Icons.el('search', 20));
    form.appendChild(input);
    form.appendChild(go);
    inner.appendChild(form);
    tries.appendChild(UI.el('span', 'try-label', I18n.t('tryLabel')));
    TRY.forEach(function (query) {
      var chip = button('try-chip', query, 'try');
      chip.setAttribute('data-query', query);
      tries.appendChild(chip);
    });
    inner.appendChild(tries);
    section.appendChild(inner);
    return section;
  }

  function twoLine(top, bottom, className) {
    var node = UI.el('p', className);
    node.appendChild(document.createTextNode(top));
    node.appendChild(document.createElement('br'));
    node.appendChild(document.createTextNode(bottom));
    return node;
  }

  function bandIcon(name) {
    var span = UI.el('span', 'band-icon');
    span.appendChild(Icons.el(name, 18));
    return span;
  }

  function buildTrio() {
    var section = UI.el('section', 'home-gap');
    var inner = UI.el('div', 'wrap');
    var grid = UI.el('div', 'trio');
    grid.appendChild(buildFreeCard());
    grid.appendChild(buildOrderCard());
    grid.appendChild(buildAreaCard());
    inner.appendChild(grid);
    section.appendChild(inner);
    return section;
  }

  function buildFreeCard() {
    var card = UI.el('article', 'trio-card card-orange');
    var pay = UI.el('div', 'pay-card');
    var amount = moneyOf('freeDeliveryAbove');
    card.appendChild(UI.el('h2', null, I18n.t('freeFrom')));
    card.appendChild(UI.el('p', 'stat', amount));
    card.appendChild(UI.el('p', 'trio-note', fill('freeNote', { amount: amount, city: city() })));
    pay.appendChild(Icons.el('cash', 28));
    pay.appendChild(document.createTextNode(I18n.t('payAtDoor')));
    card.appendChild(pay);
    return card;
  }

  function buildOrderCard() {
    var card = UI.el('article', 'trio-card card-sage');
    var pill = UI.el('div', 'order-pill');
    var input = UI.el('input', 'order-input');
    var go = button('order-go', '', 'buy');
    card.appendChild(UI.el('h2', null, I18n.t('navOrder')));
    card.appendChild(UI.el('p', 'trio-note', I18n.t('orderHelp')));
    card.appendChild(UI.el('p', 'order-big', 'No.154'));
    card.lastChild.id = 'order-big';
    input.id = 'order-by-number';
    input.value = orderQuery;
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('aria-label', I18n.t('orderLabel'));
    input.setAttribute('aria-describedby', 'order-match');
    go.id = 'order-go';
    go.appendChild(Icons.el('arrow', 18));
    pill.appendChild(input);
    var match = UI.el('span', 'order-match');
    match.id = 'order-match';
    match.setAttribute('aria-live', 'polite');
    pill.appendChild(match);
    pill.appendChild(go);
    card.appendChild(pill);
    return card;
  }

  function buildAreaCard() {
    var card = UI.el('article', 'trio-card card-surface');
    var head = UI.el('div', 'card-head');
    var pin = UI.el('span', 'icon');
    var pills = UI.el('div', 'area-pills');
    var allowed = cfg().areas || [];
    var title = UI.el('h2');
    var openArea = button('area-open', fill('deliveringInCity', { city: city() }), 'area');
    title.appendChild(openArea);
    head.appendChild(title);
    pin.appendChild(Icons.el('pin', 22));
    head.appendChild(pin);
    card.appendChild(head);
    card.appendChild(UI.el('p', 'trio-note', fill('onlyCity', { city: city() })));
    HOME_AREAS.forEach(function (area) {
      var pill;
      if (allowed.indexOf(area) === -1) return;
      pill = button('area-pill', area, 'area');
      pill.setAttribute('data-area', area);
      pills.appendChild(pill);
    });
    card.appendChild(pills);
    return card;
  }

  function buildDepartments(products) {
    var section = UI.el('section', 'home-gap');
    var inner = UI.el('div', 'wrap');
    var head = UI.el('div', 'dept-head');
    var all = button('dept-all', I18n.t('allArrow'), 'show-all');
    var cats = present(products);
    section.id = 'departments';
    head.appendChild(UI.el('span', null, '(' + cats.length + ') ' + I18n.t('departmentsLabel')));
    head.appendChild(UI.el('span', null, I18n.t('tapToBrowse')));
    head.appendChild(all);
    inner.appendChild(UI.el('h2', 'visually-hidden', I18n.t('navDepartments')));
    inner.appendChild(head);
    cats.forEach(function (category) {
      var row = button('dept', category.department, 'department');
      var photo = UI.el('span', 'dept-photo');
      var sample = null;
      products.forEach(function (product) {
        if (!sample && product.category === category.id && product.images.length) sample = product;
      });
      row.setAttribute('data-category', category.id);
      photo.appendChild(lazyImg(sample ? sample.images[0] : 'images/placeholder.svg'));
      row.appendChild(photo);
      inner.appendChild(row);
    });
    section.appendChild(inner);
    return section;
  }

  function buildShop(products, opts) {
    var section = UI.el('section', 'home-gap');
    var inner = UI.el('div', 'wrap');
    var head = UI.el('div', 'shop-head');
    var filters = UI.el('div', 'filter-row');
    var grid = UI.el('div', 'product-grid shop-grid');
    var view = catalogueView(products);
    var cats = present(products);
    var words = [{ id: 'all', label: I18n.t('allWord') + ' (' + products.length + ')' }];
    section.id = 'shop';
    grid.id = 'product-grid';
    filters.setAttribute('aria-label', I18n.t('navDepartments'));
    head.appendChild(shopHeading());
    head.appendChild(button('view-all', I18n.t('viewAll'), 'view-all'));
    inner.appendChild(head);
    cats.forEach(function (category) {
      words.push({ id: category.id, label: category.filter });
    });
    words.forEach(function (word, index) {
      var pressed = false;
      if (filter !== 'search') {
        pressed = word.id === 'all' ? (filter === 'all' || filter === 'popular') : filter === word.id;
      }
      var control = button('filter-word' + (pressed ? ' is-active' : ''), word.label, 'filter');
      control.setAttribute('data-filter', word.id);
      control.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      filters.appendChild(control);
      if (index < words.length - 1) filters.appendChild(UI.el('span', 'filter-comma', ','));
    });
    inner.appendChild(filters);
    if (opts.error) {
      inner.appendChild(errorPanel());
    } else if (opts.loading) {
      Catalogue.fill(grid, 8);
      inner.appendChild(grid);
    } else {
      view.items.forEach(function (product) {
        grid.appendChild(Catalogue.card(product, 'photo'));
      });
      inner.appendChild(grid);
      if (view.mode === 'search' && !view.items.length) {
        inner.appendChild(UI.el('p', 'search-empty', I18n.t('noMatchFor') + ' "' + searchQuery + '"'));
      }
      if (view.mode === 'popular' && view.remaining > 0) {
        var moreWrap = UI.el('div', 'shop-more');
        var n = Math.min(view.step, view.remaining);
        var more = button('btn btn-outline show-more', '', 'show-more');
        more.appendChild(document.createTextNode(fill('showMore', { n: String(n) }) + ' '));
        more.appendChild(Icons.el('chevron-down', 18));
        moreWrap.appendChild(more);
        inner.appendChild(moreWrap);
      }
    }
    section.appendChild(inner);
    return section;
  }

  function errorPanel() {
    var panel = UI.el('div', 'error-panel');
    var icon = UI.el('div', 'error-icon');
    var retry = button('btn btn-primary', I18n.t('retry'), 'retry');
    icon.appendChild(Icons.el('alert', 24));
    panel.appendChild(icon);
    panel.appendChild(UI.el('h2', null, I18n.t('couldntLoad')));
    panel.appendChild(UI.el('p', null, I18n.t('checkInternet')));
    panel.appendChild(retry);
    return panel;
  }

  function underList(products) {
    return products.filter(function (product) {
      return product.inStock && product.price < UNDER;
    }).sort(function (a, b) {
      if (a.price !== b.price) return a.price - b.price;
      return Number(a.id) - Number(b.id);
    }).slice(0, 4);
  }

  function buildUnder(products) {
    var items = underList(products);
    var section = UI.el('section', 'home-gap');
    var inner = UI.el('div', 'wrap');
    var panel = UI.el('div', 'small-panel');
    var head = UI.el('div', 'small-head');
    var grid = UI.el('div', 'small-grid');
    if (!items.length) return null;
    head.appendChild(UI.el('h2', null, I18n.t('underToday')));
    head.appendChild(UI.el('span', 'small-kicker', I18n.t('smallHelp')));
    panel.appendChild(head);
    items.forEach(function (product, index) {
      grid.appendChild(smallRow(product, index === 0));
    });
    panel.appendChild(grid);
    inner.appendChild(panel);
    section.appendChild(inner);
    return section;
  }

  function smallRow(product, featured) {
    var row = UI.el('article', 'small-row' + (featured ? ' is-featured' : ''));
    var copy = UI.el('div');
    var actions = UI.el('div', 'small-actions');
    var meta = Data.meta(product.category);
    row.appendChild(UI.el('p', 'small-price', Config.money(product.price)));
    copy.appendChild(UI.el('p', 'small-name', product.name));
    copy.appendChild(UI.el('p', 'small-meta', 'No. ' + Data.padId(product.id) + ' · ' + (meta ? meta.filter : product.category)));
    row.appendChild(copy);
    actions.appendChild(addBtn(product, featured ? 'btn btn-ghost' : 'btn btn-outline'));
    actions.appendChild(buyBtn(product, featured ? 'btn btn-accent' : 'btn btn-primary'));
    row.appendChild(actions);
    return row;
  }

  function mostList(products) {
    return products.filter(function (product) {
      return product.mostOrdered != null && !isNaN(product.mostOrdered);
    }).sort(function (a, b) {
      return a.mostOrdered - b.mostOrdered;
    });
  }

  function buildMost(products) {
    var items = mostList(products);
    var section = UI.el('section', 'home-gap');
    var inner = UI.el('div', 'wrap');
    var head = UI.el('div', 'most-head');
    var title = UI.el('h2', 'most-title');
    var list = UI.el('div', 'most-list');
    if (!items.length) return null;
    title.appendChild(document.createTextNode(I18n.t('most')));
    title.appendChild(document.createElement('br'));
    title.appendChild(document.createTextNode(I18n.t('ordered')));
    head.appendChild(title);
    head.appendChild(UI.el('span', 'most-count', pad2(items.length)));
    inner.appendChild(head);
    items.forEach(function (product) {
      list.appendChild(mostRow(product));
    });
    inner.appendChild(list);
    section.appendChild(inner);
    return section;
  }

  function mostRow(product) {
    var row = UI.el('article', 'most-row');
    var meta = UI.el('div', 'most-meta');
    var actions = UI.el('div', 'most-actions');
    var add = addBtn(product, 'btn btn-outline btn-mono most-add', I18n.t('addMono'));
    var buy = buyBtn(product, 'btn btn-primary btn-round btn-mono most-buy', I18n.t('buyMono'));
    row.appendChild(UI.el('p', 'most-name', product.name));
    meta.appendChild(UI.el('span', 'most-id', Data.padId(product.id)));
    meta.appendChild(UI.el('span', 'most-tag', Data.tagFor(product.category)));
    row.appendChild(meta);
    row.appendChild(UI.el('span', 'most-price', Config.money(product.price)));
    actions.appendChild(add);
    actions.appendChild(buy);
    row.appendChild(actions);
    return row;
  }

  function buildMarquee() {
    var section = UI.el('div', 'marquee');
    var track = UI.el('div', 'marquee-track');
    section.setAttribute('aria-hidden', 'true');
    track.appendChild(marqueeHalf());
    track.appendChild(marqueeHalf());
    section.appendChild(track);
    return section;
  }

  function marqueeHalf() {
    var half = UI.el('div', 'marquee-half');
    half.appendChild(UI.el('span', null, I18n.t('marqueeCash')));
    half.appendChild(UI.el('span', 'marquee-dot'));
    half.appendChild(UI.el('span', null, fill('marqueeFree', { city: city().toUpperCase() })));
    half.appendChild(UI.el('span', 'marquee-dot'));
    return half;
  }

  function buildHelp() {
    var section = UI.el('section', 'band help');
    var inner = UI.el('div', 'wrap');
    var head = UI.el('div', 'help-head');
    var steps = UI.el('div', 'steps');
    section.id = 'help';
    head.appendChild(UI.el('h2', null, I18n.t('howTitle')));
    head.appendChild(UI.el('p', 'help-kicker', I18n.t('noLogin')));
    inner.appendChild(head);
    steps.appendChild(stepCard('cart', I18n.t('stepPick'), I18n.t('pickBody'), '1'));
    steps.appendChild(stepCard('chat', I18n.t('stepSend'), I18n.t('sendBody'), '2'));
    steps.appendChild(stepCard('cash', I18n.t('stepPay'), I18n.t('payBody'), '3'));
    inner.appendChild(steps);
    section.appendChild(inner);
    return section;
  }

  function stepCard(icon, title, body, n) {
    var card = UI.el('article', 'step');
    var mark = UI.el('span', 'step-icon');
    mark.appendChild(Icons.el(icon, 22));
    card.appendChild(mark);
    card.appendChild(UI.el('p', 'step-kicker', title));
    card.appendChild(UI.el('p', 'step-body', body));
    card.appendChild(UI.el('p', 'step-foot', fill('stepOf', { n: n })));
    return card;
  }

  function buildPromise() {
    var section = UI.el('section', 'home-gap');
    var inner = UI.el('div', 'wrap');
    var card = UI.el('div', 'promise');
    var label = UI.el('div', 'promise-label');
    var notes = UI.el('div', 'notes');
    label.appendChild(UI.el('h2', null, I18n.t('ourPromise')));
    label.appendChild(UI.el('span', null, I18n.t('promiseCount')));
    card.appendChild(lazyImg('https://picsum.photos/seed/bzpromise/1400/800'));
    card.appendChild(label);
    notes.appendChild(note(I18n.t('packed'), '', false));
    notes.appendChild(note(I18n.t('checked'), '', false));
    notes.appendChild(note(I18n.t('replaced'), I18n.t('replacedBody'), true));
    card.appendChild(notes);
    inner.appendChild(card);
    section.appendChild(inner);
    return section;
  }

  function note(title, body, front) {
    var card = UI.el('article', 'note' + (front ? ' is-front' : ''));
    card.appendChild(UI.el('h3', null, title));
    if (body) card.appendChild(UI.el('p', null, body));
    if (front) card.appendChild(UI.el('strong', null, I18n.t('noCard')));
    return card;
  }

  function buildPoster() {
    var section = UI.el('section', 'home-gap poster');
    var inner = UI.el('div', 'wrap');
    var title = UI.el('p', 'poster-line');
    var link;
    var number = cfg().whatsappNumber || '';
    var digits = Config.digits(number);
    title.appendChild(document.createTextNode(I18n.t('orderOn')));
    var second = UI.el('span', 'poster-line', I18n.t('whatsappWord'));
    inner.appendChild(title);
    inner.appendChild(second);
    if (Config.phoneOk()) {
      link = UI.el('a', 'say-namaste');
      link.href = 'https://wa.me/' + digits + '?text=' + encodeURIComponent('Namaste ' + (cfg().shopName || 'BAZARIYAA') + '!');
      link.target = '_blank';
      link.rel = 'noopener';
    } else {
      link = UI.el('span', 'say-namaste is-disabled');
      link.setAttribute('aria-disabled', 'true');
    }
    link.appendChild(Icons.el('chat', 18));
    link.appendChild(document.createTextNode(Config.phoneOk() ? number + ' — ' + I18n.t('sayNamaste') : I18n.t('sayNamaste')));
    inner.appendChild(link);
    section.appendChild(inner);
    return section;
  }

  function paintDept() {
    var id = hoverDept || focusDept || lastDept;
    var rows = document.querySelectorAll('.dept');
    rows.forEach(function (row) {
      row.classList.toggle('is-active', row.getAttribute('data-category') === id);
    });
  }

  function syncOrder() {
    var big = document.getElementById('order-big');
    var match = document.getElementById('order-match');
    var go = document.getElementById('order-go');
    var query = orderQuery.trim();
    var product = query ? findByNumber(query) : Data.byId('154');
    var digits = query.replace(/\D/g, '');
    if (!big || !match || !go) return;
    big.textContent = 'No.' + Data.padId(digits || '154');
    if (product && (!query || findByNumber(query))) {
      match.textContent = product.name + ' · ' + Config.money(product.price);
      go.disabled = !product.inStock || !Config.phoneOk();
      go.setAttribute('data-id', product.id);
      go.setAttribute('aria-label', I18n.t('buyNow') + ', ' + product.name);
    } else {
      match.textContent = I18n.t('noItemNumber');
      go.disabled = true;
      go.removeAttribute('data-id');
      go.setAttribute('aria-label', I18n.t('buyNow'));
    }
  }

  function focusNew() {
    var cards;
    var card;
    var control;
    var index = pendingFocus;
    pendingFocus = -1;
    if (index < 0) return;
    cards = document.querySelectorAll('#product-grid .product-card');
    card = cards[index];
    if (!card) return;
    control = card.querySelector('.card-actions button');
    if (control) control.focus();
  }

  function scrollToId(id) {
    var node = document.getElementById(id);
    var reduce;
    if (!node) return;
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  function setMode(next) {
    filter = next || 'all';
    shown = null;
    updateShop();
    scrollToId('shop');
  }

  function updateShop() {
    var old = document.getElementById('shop');
    var next = buildShop(Data.products(), {});
    if (old) old.replaceWith(next);
    else render();
    focusNew();
  }

  function revealHash() {
    var id;
    var node;
    if (hashDone) return;
    hashDone = true;
    id = (location.hash || '').replace('#', '');
    if (!id) return;
    node = document.getElementById(id);
    if (!node) return;
    if (id === 'order-by-number') node.focus();
    else scrollToId(id);
  }

  function render(opts) {
    var main = document.getElementById('main');
    var products = Data.products();
    var y = window.scrollY;
    var nodes;
    opts = opts || {};
    if (!main) return;
    bind();
    if (opts.loading) products = [];
    if (!opts.loading && !opts.error) ensureDept(products);
    nodes = [
      buildHero(),
      buildSearch(products),
      buildTrio(),
      buildDepartments(products),
      buildShop(products, opts),
      buildUnder(products),
      buildMost(products),
      buildMarquee(),
      buildHelp(),
      buildPromise(),
      buildPoster()
    ];
    main.className = 'home';
    main.replaceChildren();
    nodes.forEach(function (node) {
      if (node) main.appendChild(node);
    });
    syncOrder();
    paintDept();
    focusNew();
    if (y > 0) window.scrollTo(0, y);
    revealHash();
  }

  function onClick(event) {
    var target;
    var action;
    var view;
    if (event.target && event.target.id === 'home-search-input') {
      window.setTimeout(function () {
        if (window.Search && !document.getElementById('search-overlay')) Search.open();
      }, 0);
      return;
    }
    target = event.target.closest('[data-action]');
    if (!target || target.disabled) return;
    action = target.getAttribute('data-action');
    if (action === 'try') {
      if (window.Search) Search.open(target.getAttribute('data-query') || '');
      return;
    }
    if (action === 'search-open') return;
    if (action === 'filter') {
      setMode(target.getAttribute('data-filter'));
      return;
    }
    if (action === 'view-all' || action === 'show-all') {
      setMode('all');
      return;
    }
    if (action === 'department') {
      lastDept = target.getAttribute('data-category') || '';
      hoverDept = '';
      focusDept = lastDept;
      paintDept();
      setMode(lastDept);
      return;
    }
    if (action === 'show-more') {
      view = catalogueView(Data.products());
      pendingFocus = view.items.length;
      shown = view.items.length + Math.min(view.step, view.remaining);
      updateShop();
    }
  }

  function onInput(event) {
    if (!event.target) return;
    if (event.target.id === 'home-search-input') {
      searchQuery = event.target.value;
      return;
    }
    if (event.target.id !== 'order-by-number') return;
    orderQuery = event.target.value;
    syncOrder();
  }

  function onSubmit(event) {
    if (event.target && event.target.id === 'home-search') event.preventDefault();
  }

  function onOver(event) {
    var row = event.target.closest && event.target.closest('[data-action="department"]');
    var id;
    if (!row) return;
    id = row.getAttribute('data-category');
    if (id === hoverDept) return;
    hoverDept = id;
    paintDept();
  }

  function onOut(event) {
    var row = event.target.closest && event.target.closest('[data-action="department"]');
    var next;
    var nextRow;
    if (!row) return;
    if (hoverDept !== row.getAttribute('data-category')) return;
    next = event.relatedTarget;
    nextRow = next && next.closest && next.closest('[data-action="department"]');
    if (nextRow) return;
    hoverDept = '';
    paintDept();
  }

  function onFocusIn(event) {
    var row;
    if (event.target && event.target.id === 'home-search-input' && event.target.matches(':focus-visible')) {
      window.setTimeout(function () {
        if (window.Search && !document.getElementById('search-overlay')) Search.open();
      }, 0);
      return;
    }
    row = event.target.closest && event.target.closest('[data-action="department"]');
    if (row) {
      focusDept = row.getAttribute('data-category');
      paintDept();
      return;
    }
    if (focusDept) {
      focusDept = '';
      paintDept();
    }
  }

  function bind() {
    if (bound) return;
    bound = true;
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    document.addEventListener('focusin', onFocusIn);
  }

  function loading() {
    var board = document.getElementById('product-grid');
    var more;
    bind();
    if (board && board.closest('.home')) {
      Catalogue.fill(board, 8);
      more = document.querySelector('.show-more');
      if (more) more.hidden = true;
      return;
    }
    render({ loading: true });
  }

  function show() {
    if (!Data.products().length) {
      showError();
      return;
    }
    render();
  }

  function showError() {
    render({ error: true });
  }

  function remember(query) {
    searchQuery = String(query || '');
    var input = document.getElementById('home-search-input');
    if (input) input.value = searchQuery;
  }

  function showResults(query) {
    remember(query);
    filter = 'search';
    shown = null;
    updateShop();
    scrollToId('shop');
  }

  return {
    loading: loading,
    show: show,
    showError: showError,
    remember: remember,
    showResults: showResults,
    showCategory: setMode
  };
})();
