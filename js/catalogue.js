/* Product card. Same card for a photo, a missing photo, a failed photo,
   out of stock, and the loading skeleton. */

var Catalogue = (function () {
  /* placeholder.png means no real photo was found. */
  function isStandIn(url) {
    var path = String(url || '').split('?')[0].toLowerCase();
    return /placeholder\.(png|svg|jpe?g|webp)$/.test(path);
  }

  function realPhotos(product) {
    var images = product.images || [];
    return images.filter(function (url) { return url && !isStandIn(url); });
  }

  /* A missing, placeholder, or broken photo uses the name poster. */
  function onPhotoError(img, media) {
    function fail() {
      img.removeEventListener('error', fail);
      media.classList.add('is-poster');
    }
    img.addEventListener('error', fail);
  }

  function card(product, mode) {
    var article = UI.el('article', 'product-card');
    var photoBtn = UI.el('button', 'card-photo');
    photoBtn.type = 'button';
    photoBtn.setAttribute('data-action', 'photo');
    photoBtn.setAttribute('data-id', String(product.id));
    photoBtn.setAttribute('aria-label', product.name + ' ' + I18n.t('photo'));

    var media = UI.el('div', 'card-media');
    if (!product.inStock) media.classList.add('is-oos');

    var img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';

    var photos = realPhotos(product);
    if (mode === 'poster' || !photos.length) {
      media.classList.add('is-poster');
    } else if (mode === 'broken') {
      img.src = 'images/no-such-photo.jpg';
      onPhotoError(img, media);
    } else {
      img.src = photos[0];
      onPhotoError(img, media);
    }

    var sticker = UI.el('span', 'card-sticker');
    sticker.appendChild(UI.el('span', 'card-sticker-label', 'ITEM NO.'));
    sticker.appendChild(UI.el('span', 'card-sticker-num', Data.padId(product.id)));

    var posterName = UI.el('span', 'card-poster-name');
    posterName.appendChild(UI.el('span', null, product.name));
    if (product.name.length > 32) posterName.classList.add('is-xlong');
    else if (product.name.length > 18) posterName.classList.add('is-long');

    media.appendChild(UI.el('span', 'card-tag', 'No. ' + Data.padId(product.id)));
    media.appendChild(UI.el('span', 'card-poster-cat', Data.tagFor(product.category)));
    media.appendChild(sticker);
    media.appendChild(posterName);
    media.appendChild(UI.el('span', 'card-oos-pill', I18n.t('outOfStock')));
    if (img.getAttribute('src')) media.appendChild(img);
    photoBtn.appendChild(media);

    var actions = UI.el('div', 'card-actions');
    if (!product.inStock) {
      var soldOut = UI.el('button', 'btn is-oos-btn', I18n.t('outOfStock'));
      soldOut.type = 'button';
      soldOut.disabled = true;
      actions.appendChild(soldOut);
    } else {
      var buy = UI.el('button', 'btn btn-primary', I18n.t('buyNow'));
      buy.type = 'button';
      buy.setAttribute('data-action', 'buy');
      buy.setAttribute('data-id', String(product.id));
      buy.setAttribute('aria-label', I18n.t('buyNow') + ', ' + product.name);
      if (!Config.phoneOk()) buy.disabled = true;

      var add = UI.el('button', 'btn btn-sunken', I18n.t('addToCart'));
      add.type = 'button';
      add.setAttribute('data-action', 'add');
      add.setAttribute('data-id', String(product.id));
      add.setAttribute('aria-label', I18n.t('addToCart') + ', ' + product.name);

      actions.appendChild(buy);
      actions.appendChild(add);
    }

    article.appendChild(photoBtn);
    if (!product.inStock) {
      var nameBtn = UI.el('button', 'card-name', product.name);
      nameBtn.type = 'button';
      nameBtn.setAttribute('data-action', 'photo');
      nameBtn.setAttribute('data-id', String(product.id));
      article.appendChild(nameBtn);
    } else {
      article.appendChild(UI.el('p', 'card-name', product.name));
    }
    article.appendChild(UI.el('p', 'card-price', Config.money(product.price)));
    article.appendChild(actions);
    return article;
  }

  function skeleton() {
    var article = UI.el('article', 'product-card is-skeleton');
    article.setAttribute('aria-hidden', 'true');
    article.appendChild(UI.el('div', 'skel skel-photo'));
    article.appendChild(UI.el('div', 'skel skel-line'));
    article.appendChild(UI.el('div', 'skel skel-line is-short'));
    article.appendChild(UI.el('div', 'skel skel-btn'));
    return article;
  }

  function fill(grid, count) {
    if (!grid) return;
    grid.replaceChildren();
    var i;
    for (i = 0; i < count; i += 1) grid.appendChild(skeleton());
  }

  return { card: card, skeleton: skeleton, fill: fill };
})();
