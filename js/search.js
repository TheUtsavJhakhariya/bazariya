/* Search overlay. Sits at the top of the dimmed page.
   Empty box shows five common searches. A number shows the item card.
   Words show up to six rows. Search all filters the home catalogue. */

var Search = (function () {
  var OFTEN = ['tawa', 'bottle', 'umbrella', 'छाता', 'brush'];
  var NOMATCH = ['tawa', 'bottle', 'brush'];

  function shopName() {
    return Config.get().shopName || 'BAZARIYAA';
  }

  /* "154", "No. 154" and "#154" are item numbers. Anything else is words. */
  function digitsOf(raw) {
    var text = String(raw || '').trim();
    var match = text.match(/^(?:no\.?\s*|#\s*)?(\d+)$/i);
    if (!match) return '';
    return String(parseInt(match[1], 10));
  }

  function filter(products, query) {
    var q = String(query || '').trim();
    if (!q) return [];
    return products.filter(function (product) { return Data.matchesQuery(product, q); });
  }

  function photo(product) {
    var img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = product.images && product.images.length ? product.images[0] : 'images/placeholder.svg';
    img.addEventListener('error', function onErr() {
      img.removeEventListener('error', onErr);
      img.src = 'images/placeholder.svg';
    });
    return img;
  }

  function openItem(product, mode) {
    if (!product.inStock) {
      if (window.Viewer) Viewer.soldOut(product, true);
      return;
    }
    if (window.Quantity) Quantity.open(product.id, mode, true);
  }

  function open(preset) {
    var home = document.getElementById('home-search-input');
    var existing = document.getElementById('search-input');
    var start = preset == null ? (home ? home.value : '') : String(preset);
    if (existing) {
      existing.value = start;
      existing.dispatchEvent(new Event('input'));
      existing.focus();
      return;
    }
    if (home && document.activeElement === home) home.blur();

    var dialog = UI.el('div', 'search-dialog');
    var form = UI.el('form', 'search-bar');
    var field = UI.el('input', 'search-field');
    var clearBtn = UI.el('button', 'btn btn-outline', I18n.t('clear'));
    var cancelBtn = UI.el('button', 'btn btn-primary', I18n.t('cancel'));
    var results = UI.el('div', 'search-results');
    var title = UI.el('h2', 'visually-hidden', I18n.t('searchLabel'));

    dialog.id = 'search-overlay';
    title.id = 'search-title';
    field.id = 'search-input';
    field.type = 'search';
    field.value = start;
    field.setAttribute('placeholder', I18n.t('searchPlaceholder'));
    field.setAttribute('aria-label', I18n.t('searchLabel'));
    field.setAttribute('autocomplete', 'off');
    clearBtn.type = 'button';
    cancelBtn.type = 'button';
    results.setAttribute('aria-live', 'polite');

    form.appendChild(Icons.el('search', 20));
    form.appendChild(field);
    form.appendChild(clearBtn);
    form.appendChild(cancelBtn);
    dialog.appendChild(title);
    dialog.appendChild(form);
    dialog.appendChild(results);

    function remember() {
      if (home) home.value = field.value;
      if (window.Home && Home.remember) Home.remember(field.value);
    }

    function goAll() {
      var q = field.value.trim();
      if (!q) return;
      remember();
      UI.close();
      if (window.Home && Home.showResults) Home.showResults(q);
    }

    function chip(label) {
      var button = UI.el('button', 'search-chip', label);
      button.type = 'button';
      button.addEventListener('click', function () {
        field.value = label;
        paint();
        field.focus();
      });
      return button;
    }

    function chips(labels) {
      var row = UI.el('div', 'search-chips');
      labels.forEach(function (label) { row.appendChild(chip(label)); });
      return row;
    }

    function resultRow(product) {
      var button = UI.el('button', 'search-row');
      var copy = UI.el('span', 'search-row-copy');
      button.type = 'button';
      copy.appendChild(UI.el('span', 'search-row-name', product.name));
      copy.appendChild(UI.el('span', 'search-row-meta', 'No. ' + Data.padId(product.id)));
      button.appendChild(photo(product));
      button.appendChild(copy);
      button.appendChild(UI.el('span', 'search-row-price', Config.money(product.price)));
      button.addEventListener('click', function () { openItem(product, 'add'); });
      return button;
    }

    function allRow(query) {
      var button = UI.el('button', 'search-all');
      button.type = 'button';
      button.appendChild(document.createTextNode(I18n.format('searchAll', { q: query }) + ' '));
      button.appendChild(Icons.el('arrow', 18));
      button.addEventListener('click', goAll);
      return button;
    }

    function matchCard(product) {
      var card = UI.el('article', 'search-hit');
      var copy = UI.el('div', 'search-hit-copy');
      var meta = Data.meta(product.category);
      var buy = UI.el('button', 'btn btn-accent', I18n.t('buyNow'));
      buy.type = 'button';
      buy.disabled = !product.inStock || !Config.phoneOk();
      buy.addEventListener('click', function () { openItem(product, 'buy'); });
      copy.appendChild(UI.el('p', 'search-hit-no', 'NO. ' + Data.padId(product.id)));
      copy.appendChild(UI.el('p', 'search-hit-name', product.name));
      copy.appendChild(UI.el('p', 'search-hit-cat', meta ? meta.filter : product.category));
      copy.appendChild(UI.el('p', 'search-hit-price', Config.money(product.price)));
      card.appendChild(photo(product));
      card.appendChild(copy);
      card.appendChild(buy);
      return card;
    }

    function noMatch(query) {
      var box = UI.el('div', 'search-none');
      var heading = UI.el('h3', 'serif-heading');
      var clearSearch = UI.el('button', 'btn btn-outline', I18n.t('clearSearch'));
      var ask = UI.el('button', 'btn btn-accent', I18n.t('askUs'));
      heading.appendChild(document.createTextNode(I18n.t('noMatchFor') + ' '));
      heading.appendChild(UI.el('em', null, '"' + query + '"'));
      clearSearch.type = 'button';
      ask.type = 'button';
      ask.disabled = !Config.phoneOk();
      clearSearch.addEventListener('click', function () {
        field.value = '';
        paint();
        field.focus();
      });
      ask.addEventListener('click', function () {
        if (window.WhatsApp) {
          WhatsApp.ask(I18n.format('askHave', { shop: shopName(), q: query }));
        }
      });
      box.appendChild(heading);
      box.appendChild(chips(NOMATCH));
      box.appendChild(clearSearch);
      box.appendChild(ask);
      return box;
    }

    function section(label) {
      var block = UI.el('section', 'search-block');
      block.appendChild(UI.el('p', 'search-kicker', label));
      return block;
    }

    function paint() {
      var query = field.value.trim();
      var digits = digitsOf(query);
      var products = Data.products();
      var exact = digits ? Data.byId(digits) : null;
      var rows;
      results.replaceChildren();
      clearBtn.hidden = !query;
      if (!query) {
        var often = section(I18n.t('oftenSearch'));
        often.appendChild(chips(OFTEN));
        results.appendChild(often);
        return;
      }
      if (digits) {
        rows = products.filter(function (product) {
          var id = String(product.id);
          if (exact && String(exact.id) === id) return false;
          return Data.matchesQuery(product, digits);
        }).slice(0, 6);
        if (exact) {
          var hit = section(I18n.t('itemNumberMatch'));
          hit.appendChild(matchCard(exact));
          results.appendChild(hit);
        }
        if (rows.length) {
          var also = section(I18n.format('alsoMatching', { q: digits }));
          rows.forEach(function (product) { also.appendChild(resultRow(product)); });
          results.appendChild(also);
        }
        if (!exact && !rows.length) {
          results.appendChild(noMatch(query));
          return;
        }
        results.appendChild(allRow(query));
        return;
      }
      rows = filter(products, query).slice(0, 6);
      if (!rows.length) {
        results.appendChild(noMatch(query));
        return;
      }
      var block = section(I18n.t('matchingItems'));
      rows.forEach(function (product) { block.appendChild(resultRow(product)); });
      results.appendChild(block);
      results.appendChild(allRow(query));
    }

    field.addEventListener('input', paint);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      goAll();
    });
    clearBtn.addEventListener('click', function () {
      field.value = '';
      paint();
      field.focus();
    });
    cancelBtn.addEventListener('click', function () { UI.close(); });

    UI.open({
      kind: 'top',
      node: dialog,
      labelledBy: 'search-title',
      focus: '#search-input',
      onClose: remember
    });
    paint();
  }

  return { open: open, filter: filter, digitsOf: digitsOf };
})();
