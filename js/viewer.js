/* Full-screen photo viewer, and the out-of-stock dialog.
   Out-of-stock items never open the viewer. */

var Viewer = (function () {
  function shopName() {
    return Config.get().shopName || 'BAZARIYAA';
  }

  function safeImg(src, alt) {
    var img = document.createElement('img');
    img.alt = alt || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = src || 'images/placeholder.svg';
    img.addEventListener('error', function onErr() {
      img.removeEventListener('error', onErr);
      img.src = 'images/placeholder.svg';
    });
    return img;
  }

  function open(id) {
    var product = Data.byId(id);
    var photos;
    var index = 0;
    var dialog;
    var big;
    var counter;
    var prev;
    var next;
    var strip;
    var startX = 0;
    if (!product || !product.inStock) return;
    if (document.getElementById('photo-viewer')) return;
    photos = (product.images || []).filter(function (url) {
      return url && !/placeholder\.(png|svg|jpe?g|webp)(\?|$)/i.test(url);
    });
    if (!photos.length) return;

    dialog = UI.el('div', 'photo-viewer');
    dialog.id = 'photo-viewer';
    counter = UI.el('p', 'photo-count', '');
    prev = UI.el('button', 'photo-nav photo-prev');
    next = UI.el('button', 'photo-nav photo-next');
    prev.type = 'button';
    next.type = 'button';
    prev.setAttribute('aria-label', I18n.t('prevPhoto'));
    next.setAttribute('aria-label', I18n.t('nextPhoto'));
    prev.appendChild(Icons.el('back', 22));
    next.appendChild(Icons.el('arrow', 22));

    var closeBtn = UI.el('button', 'btn btn-light photo-close', I18n.t('close'));
    closeBtn.type = 'button';
    closeBtn.addEventListener('click', function () { UI.close(); });

    var stage = UI.el('div', 'photo-stage');
    big = safeImg(photos[0], product.name);
    stage.appendChild(prev);
    stage.appendChild(big);
    stage.appendChild(next);

    strip = UI.el('div', 'photo-strip');
    photos.forEach(function (src, i) {
      var thumb = UI.el('button', 'photo-thumb');
      thumb.type = 'button';
      thumb.appendChild(safeImg(src, ''));
      thumb.setAttribute('aria-label', I18n.format('photoCount', {
        id: Data.padId(product.id),
        n: String(i + 1),
        total: String(photos.length)
      }));
      thumb.addEventListener('click', function () {
        index = i;
        paint();
      });
      strip.appendChild(thumb);
    });

    var buy = UI.el('button', 'btn btn-accent', I18n.t('buyNow'));
    buy.type = 'button';
    buy.disabled = !Config.phoneOk();
    buy.addEventListener('click', function () {
      if (window.Quantity) Quantity.open(product.id, 'buy', true);
    });

    var foot = UI.el('div', 'photo-foot');
    var copy = UI.el('div');
    copy.appendChild(UI.el('p', 'photo-name', product.name));
    copy.appendChild(UI.el('p', 'photo-price', Config.money(product.price)));
    foot.appendChild(copy);
    foot.appendChild(buy);

    var top = UI.el('div', 'photo-top');
    top.appendChild(counter);
    top.appendChild(closeBtn);
    dialog.appendChild(top);
    dialog.appendChild(stage);
    dialog.appendChild(strip);
    dialog.appendChild(foot);

    function paint() {
      big.src = photos[index];
      counter.textContent = I18n.format('photoCount', {
        id: Data.padId(product.id),
        n: String(index + 1),
        total: String(photos.length)
      });
      prev.disabled = index === 0;
      next.disabled = index === photos.length - 1;
      Array.prototype.forEach.call(strip.children, function (thumb, i) {
        thumb.classList.toggle('is-on', i === index);
        if (i === index) thumb.setAttribute('aria-current', 'true');
        else thumb.removeAttribute('aria-current');
      });
    }

    function step(delta) {
      var nextIndex = index + delta;
      if (nextIndex < 0 || nextIndex >= photos.length) return;
      index = nextIndex;
      paint();
    }

    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      }
    });
    stage.addEventListener('pointerdown', function (event) { startX = event.clientX; });
    stage.addEventListener('pointerup', function (event) {
      var dx = event.clientX - startX;
      if (dx > 50) step(-1);
      if (dx < -50) step(1);
    });

    UI.open({
      kind: 'viewer',
      node: dialog,
      label: product.name,
      focus: '.photo-close'
    });
    paint();
  }

  function soldOut(product, swap) {
    var dialog;
    var meta;
    var photoWrap;
    var closeBtn;
    var tell;
    var similar;
    if (!product) return;
    meta = Data.meta(product.category);
    dialog = UI.el('div', 'oos-dialog');
    dialog.id = 'oos-dialog';

    photoWrap = UI.el('div', 'oos-photo');
    photoWrap.appendChild(safeImg(product.images && product.images[0], ''));
    photoWrap.appendChild(UI.el('span', 'oos-pill', I18n.t('outOfStock')));
    closeBtn = UI.el('button', 'btn btn-light oos-close', I18n.t('close'));
    closeBtn.type = 'button';
    closeBtn.addEventListener('click', function () { UI.close(); });
    photoWrap.appendChild(closeBtn);

    var heading = UI.el('h2', 'serif-heading');
    heading.id = 'oos-name';
    heading.appendChild(document.createTextNode(I18n.t('soldLead') + ' '));
    heading.appendChild(UI.el('em', null, I18n.t('soldEm')));

    tell = UI.el('button', 'btn btn-accent btn-lg', I18n.t('tellMe'));
    tell.type = 'button';
    tell.disabled = !Config.phoneOk();
    tell.addEventListener('click', function () {
      if (window.WhatsApp) {
        WhatsApp.ask(I18n.format('backStock', {
          shop: shopName(),
          id: String(product.id),
          name: product.name
        }));
      }
      UI.close();
    });

    similar = UI.el('button', 'btn btn-outline btn-lg', I18n.t('seeSimilar'));
    similar.type = 'button';
    similar.addEventListener('click', function () {
      UI.close();
      if (window.Home && Home.showCategory) Home.showCategory(product.category);
      else location.href = 'index.html#shop';
    });

    dialog.appendChild(photoWrap);
    dialog.appendChild(UI.el('p', 'oos-meta', 'NO. ' + Data.padId(product.id) + ' · ' + (meta ? meta.tag : '') + ' · ' + Config.money(product.price)));
    dialog.appendChild(UI.el('p', 'oos-product', product.name));
    dialog.appendChild(heading);
    dialog.appendChild(UI.el('p', 'oos-body', I18n.t('soldBody')));
    dialog.appendChild(tell);
    dialog.appendChild(similar);

    UI.open({
      kind: UI.phone() ? 'sheet' : 'modal',
      node: dialog,
      labelledBy: 'oos-name',
      focus: '.oos-close',
      swap: !!swap
    });
  }

  return { open: open, soldOut: soldOut };
})();
