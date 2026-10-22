/* Sign-in for the admin panel, then the full product list.
   Search looks through every detail we store for a product.
   Category, stock and popular narrow that list further.
   The password check runs in the browser only. This page has no server. */

var Admin = (function () {
  var USERNAME = 'adminpanel';
  var PASSWORD = 'admin123';
  var SESSION_KEY = 'bazariyaa-admin';
  var loaded = false;
  var loading = false;
  var PAGE_SIZE = 20;
  var selected = {};
  var shownIds = [];
  var editingIds = [];
  var bulkRows = [];
  var BULK_FIELDS = ['name', 'price', 'category', 'inStock', 'popular', 'mostOrdered', 'images'];
  var stockMenuOwner = null;
  var photoOwner = null;
  var page = 1;
  var imageChoice = 'keep';
  var pickedImage = '';
  var keptImage = '';

  function remember() {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch (err) {
      /* If storage is blocked, the owner stays signed in until they leave the page. */
    }
  }

  function signedIn() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch (err) {
      return false;
    }
  }

  function forget() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (err) {
      /* Signing out still hides the panel on this page. */
    }
  }

  function show(on) {
    document.getElementById('admin-login').hidden = on;
    document.getElementById('admin-panel').hidden = !on;
  }

  function text(tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    return node;
  }

  /* One lowercase line of everything we know about a product. */
  function details(product) {
    var meta = Data.meta(product.category);
    var bits = [
      product.id,
      Data.padId(product.id),
      'no. ' + Data.padId(product.id),
      product.name,
      product.nameHi,
      product.nameGu,
      product.description,
      product.category,
      meta ? meta.department : '',
      meta ? meta.filter : '',
      meta ? meta.tag : '',
      String(product.price),
      Config.money(product.price),
      product.inStock ? 'in stock yes available' : 'out of stock no sold out unavailable',
      product.popular ? 'popular yes' : 'not popular',
      product.mostOrdered != null ? 'most ordered ' + product.mostOrdered : '',
      (product.images || []).join(' ')
    ];
    return bits.join(' ').toLowerCase();
  }

  /* Every word the owner types must appear somewhere on the product. */
  function matchesSearch(product, query) {
    var words = String(query || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
    var blob;
    var i;
    if (!words.length) return true;
    blob = details(product);
    for (i = 0; i < words.length; i += 1) {
      if (blob.indexOf(words[i]) === -1) return false;
    }
    return true;
  }

  function chosen() {
    return {
      query: document.getElementById('admin-search').value,
      category: document.getElementById('admin-category').value,
      stock: document.getElementById('admin-stock').value,
      popular: document.getElementById('admin-popular').value
    };
  }

  function passes(product, filters) {
    if (filters.category !== 'all' && product.category !== filters.category) return false;
    if (filters.stock === 'in' && !product.inStock) return false;
    if (filters.stock === 'out' && product.inStock) return false;
    if (filters.popular === 'yes' && !product.popular) return false;
    if (filters.popular === 'no' && product.popular) return false;
    return matchesSearch(product, filters.query);
  }

  function byNumber(a, b) {
    var left = Number(a.id);
    var right = Number(b.id);
    if (isFinite(left) && isFinite(right) && left !== right) return left - right;
    return String(a.id).localeCompare(String(b.id));
  }

  function fillCategories() {
    var select = document.getElementById('admin-category');
    var current = select.value || 'all';
    var seen = {};
    var names = [];
    var i;
    var products = Data.products();
    for (i = 0; i < products.length; i += 1) {
      if (!products[i].category || seen[products[i].category]) continue;
      seen[products[i].category] = true;
      names.push(products[i].category);
    }
    names.sort(function (a, b) { return a.localeCompare(b); });
    while (select.firstChild) select.removeChild(select.firstChild);
    select.appendChild(option('all', 'All'));
    for (i = 0; i < names.length; i += 1) {
      select.appendChild(option(names[i], names[i]));
    }
    select.value = current === 'all' || seen[current] ? current : 'all';
  }

  function option(value, label) {
    var node = document.createElement('option');
    node.value = value;
    node.textContent = label;
    return node;
  }

  function photo(product) {
    var img = document.createElement('img');
    var src = product.images && product.images.length ? product.images[0] : 'images/placeholder.svg';
    img.alt = '';
    img.loading = 'lazy';
    img.src = src;
    img.addEventListener('error', function onErr() {
      img.removeEventListener('error', onErr);
      img.src = 'images/placeholder.svg';
    });
    return img;
  }

  function sourceId(product) {
    return String(product.sourceId || product.id);
  }

  function findProduct(key) {
    var products = Data.products();
    var i;
    for (i = 0; i < products.length; i += 1) {
      if (sourceId(products[i]) === String(key)) return products[i];
    }
    return null;
  }

  function row(product) {
    var item = document.createElement('article');
    var copy = document.createElement('div');
    var pick = document.createElement('label');
    var box = document.createElement('input');
    var pickText = document.createElement('span');
    var edit = document.createElement('button');
    var key = sourceId(product);
    var meta = 'No. ' + Data.padId(product.id) + ' · ' + (product.category || 'No category');
    item.className = 'admin-item';
    pick.className = 'admin-check';
    box.type = 'checkbox';
    box.checked = !!selected[key];
    box.setAttribute('data-action', 'pick');
    box.setAttribute('data-source-id', key);
    pickText.className = 'visually-hidden';
    pickText.textContent = 'Select ' + product.name;
    pick.appendChild(box);
    pick.appendChild(pickText);
    item.appendChild(pick);
    item.appendChild(photo(product));
    copy.className = 'admin-copy';
    copy.appendChild(text('p', 'admin-item-name', product.name));
    if (product.nameHi || product.nameGu) {
      copy.appendChild(text('p', 'admin-item-lang', [product.nameHi, product.nameGu].filter(Boolean).join(' · ')));
    }
    if (product.description) copy.appendChild(text('p', 'admin-item-desc', product.description));
    if (product.popular) meta += ' · Popular';
    if (product.mostOrdered != null) meta += ' · Most ordered ' + product.mostOrdered;
    copy.appendChild(text('p', 'admin-item-meta', meta));
    item.appendChild(copy);
    item.appendChild(text('p', 'admin-item-price', Config.money(product.price)));
    item.appendChild(text('p', 'admin-chip ' + (product.inStock ? 'is-in' : 'is-out'), product.inStock ? 'In stock' : 'Out of stock'));
    edit.type = 'button';
    edit.className = 'admin-link admin-edit';
    edit.textContent = 'Edit';
    edit.setAttribute('data-action', 'edit');
    edit.setAttribute('data-source-id', key);
    item.appendChild(edit);
    return item;
  }

  function selectedIds() {
    var products = Data.products();
    var ids = [];
    var i;
    for (i = 0; i < products.length; i += 1) {
      var key = sourceId(products[i]);
      if (selected[key]) ids.push(key);
    }
    return ids;
  }

  function updateBulkButton() {
    var button = document.getElementById('admin-bulk');
    var count = selectedIds().length;
    button.disabled = count === 0;
    button.textContent = count ? 'Bulk edit (' + count + ')' : 'Bulk edit';
  }

  function syncSelectAll() {
    var box = document.getElementById('admin-select-all');
    var picked = 0;
    var i;
    for (i = 0; i < shownIds.length; i += 1) {
      if (selected[shownIds[i]]) picked += 1;
    }
    box.checked = shownIds.length > 0 && picked === shownIds.length;
    box.indeterminate = picked > 0 && picked < shownIds.length;
  }

  function render() {
    var list = document.getElementById('admin-list');
    document.getElementById('admin-note').hidden = true;
    var empty = document.getElementById('admin-empty');
    var count = document.getElementById('admin-count');
    var filters = chosen();
    var products = Data.products().slice().sort(byNumber);
    var shown = [];
    var slice = [];
    var fragment = document.createDocumentFragment();
    var pages;
    var start;
    var i;
    shownIds = [];
    for (i = 0; i < products.length; i += 1) {
      if (passes(products[i], filters)) shown.push(products[i]);
    }
    pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
    if (page > pages) page = pages;
    if (page < 1) page = 1;
    start = (page - 1) * PAGE_SIZE;
    slice = shown.slice(start, start + PAGE_SIZE);
    while (list.firstChild) list.removeChild(list.firstChild);
    for (i = 0; i < slice.length; i += 1) {
      shownIds.push(sourceId(slice[i]));
      fragment.appendChild(row(slice[i]));
    }
    list.appendChild(fragment);
    empty.hidden = shown.length !== 0;
    drawPages(shown.length);
    updateBulkButton();
    syncSelectAll();
    if (!products.length) count.textContent = 'No products loaded.';
    else if (!shown.length) count.textContent = 'Showing 0 of ' + products.length;
    else count.textContent = 'Showing ' + (start + 1) + '–' + (start + slice.length) + ' of ' + shown.length;
  }

  function pageButton(label, id, disabled) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'admin-link';
    button.textContent = label;
    button.disabled = !!disabled;
    if (id) button.id = id;
    return button;
  }

  function drawPages(total) {
    var nav = document.getElementById('admin-pages');
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    var n;
    var button;
    while (nav.firstChild) nav.removeChild(nav.firstChild);
    nav.hidden = pages < 2;
    if (pages < 2) return;
    nav.appendChild(pageButton('Previous', 'admin-prev', page === 1));
    nav.appendChild(text('p', '', 'Page ' + page + ' of ' + pages));
    for (n = 1; n <= pages; n += 1) {
      button = pageButton(String(n), '', false);
      button.setAttribute('data-page', String(n));
      if (n === page) button.setAttribute('aria-current', 'page');
      nav.appendChild(button);
    }
    nav.appendChild(pageButton('Next', 'admin-next', page === pages));
  }

  function field(id) {
    return document.getElementById(id);
  }

  function showError(message) {
    var error = field('admin-edit-error');
    error.hidden = !message;
    error.textContent = message || '';
  }

  function setFieldsEnabled(on) {
    var inputs = field('admin-edit-form').querySelectorAll('input, select, textarea');
    var i;
    for (i = 0; i < inputs.length; i += 1) {
      if (inputs[i].getAttribute('data-apply') != null) continue;
      inputs[i].disabled = !on;
    }
  }

  function categoryNames() {
    var seen = {};
    var names = [];
    var products = Data.products();
    var current = field('edit-category').value.trim();
    var i;
    for (i = 0; i < products.length; i += 1) {
      if (!products[i].category || seen[products[i].category]) continue;
      seen[products[i].category] = true;
      names.push(products[i].category);
    }
    if (current && !seen[current]) names.push(current);
    names.sort(function (a, b) { return a.localeCompare(b); });
    return names;
  }

  function paintCategory() {
    var current = field('edit-category').value.trim();
    field('admin-category-label').textContent = current || 'Choose a category';
  }

  function closeCategoryMenu() {
    var menu = field('admin-category-menu');
    var home = field('admin-category-btn').parentNode;
    menu.hidden = true;
    field('admin-category-btn').setAttribute('aria-expanded', 'false');
    if (home && menu.parentNode !== home) home.appendChild(menu);
  }

  function placeCategoryMenu() {
    var button = field('admin-category-btn');
    var menu = field('admin-category-menu');
    var rect = button.getBoundingClientRect();
    var width = Math.min(280, Math.max(220, Math.round(rect.width)));
    var top;
    var left;
    var height;
    document.body.appendChild(menu);
    menu.hidden = false;
    height = menu.offsetHeight;
    top = rect.bottom + 6;
    if (top + height > window.innerHeight - 8) top = rect.top - 6 - height;
    if (top < 8) top = 8;
    left = rect.right - width;
    if (left < 8) left = 8;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - 8 - width;
    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
    menu.style.width = width + 'px';
  }

  function fillCategoryList() {
    var menu = field('admin-category-menu');
    var names = categoryNames();
    var current = field('edit-category').value.trim();
    var i;
    while (menu.firstChild) menu.removeChild(menu.firstChild);
    for (i = 0; i < names.length; i += 1) {
      var choice = document.createElement('button');
      var selected = names[i] === current;
      choice.type = 'button';
      choice.className = 'admin-cat-option' + (selected ? ' is-on' : '');
      choice.setAttribute('role', 'option');
      choice.setAttribute('data-category', names[i]);
      choice.setAttribute('aria-selected', selected ? 'true' : 'false');
      choice.textContent = names[i];
      menu.appendChild(choice);
    }
    paintCategory();
  }

  function openCategoryMenu() {
    var selected;
    if (field('edit-category').disabled) return;
    fillCategoryList();
    field('admin-category-btn').setAttribute('aria-expanded', 'true');
    placeCategoryMenu();
    selected = field('admin-category-menu').querySelector('.is-on');
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  }

  function showPreview(src) {
    var img = field('edit-preview');
    var drop = field('edit-drop');
    field('admin-photo-clear').hidden = !src;
    if (!src) {
      img.hidden = true;
      img.removeAttribute('src');
      drop.classList.remove('has-preview');
      return;
    }
    img.hidden = false;
    img.src = src;
    drop.classList.add('has-preview');
  }

  /* Forget the photo so a save shows the number tile instead. */
  function clearPhoto() {
    imageChoice = 'none';
    pickedImage = '';
    field('edit-url').value = '';
    field('edit-file').value = '';
    field('admin-url-row').hidden = true;
    showPreview('');
    showError('');
  }

  function useImageFile(file) {
    if (!file) return;
    if (!file.type || file.type.indexOf('image/') !== 0) {
      showError('Choose an image file.');
      return;
    }
    shrinkImage(file).then(function (url) {
      pickedImage = url;
      imageChoice = 'file';
      field('edit-url').value = '';
      field('admin-url-row').hidden = true;
      showPreview(url);
      showError('');
    }).catch(function () {
      showError('That image could not be read.');
    });
  }

  function currentImage() {
    if (imageChoice === 'none') return '';
    if (imageChoice === 'file' && pickedImage) return pickedImage;
    if (imageChoice === 'url') return field('edit-url').value.trim();
    return keptImage;
  }

  /* Shrink a phone photo so it can be saved in the browser. */
  function shrinkImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('read')); };
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var max = 800;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var canvas = document.createElement('canvas');
          var ctx;
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = function () { reject(new Error('image')); };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function paintChoices() {
    var stock = field('edit-stock').value === 'no' ? 'no' : 'yes';
    var popular = field('edit-popular').value === 'yes';
    var pills = document.querySelectorAll('#admin-edit-form [data-stock]');
    var i;
    for (i = 0; i < pills.length; i += 1) {
      var on = pills[i].getAttribute('data-stock') === stock;
      pills[i].classList.toggle('is-on', on);
      pills[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    field('admin-popular-switch').classList.toggle('is-on', popular);
    field('admin-popular-switch').setAttribute('aria-checked', popular ? 'true' : 'false');
    field('admin-popular-text').textContent = popular ? 'In “Popular this week”' : 'Not in “Popular this week”';
  }

  function setRowLock(name, locked) {
    var row = document.querySelector('#admin-edit-form [data-row="' + name + '"]');
    if (row) row.classList.toggle('is-locked', locked);
  }

  function lockAllRows(locked) {
    var rows = field('admin-edit-form').querySelectorAll('[data-row]');
    var i;
    for (i = 0; i < rows.length; i += 1) rows[i].classList.toggle('is-locked', locked);
  }

  function visibleProducts() {
    var filters = chosen();
    var products = Data.products().slice().sort(byNumber);
    var shown = [];
    var i;
    for (i = 0; i < products.length; i += 1) {
      if (passes(products[i], filters)) shown.push(products[i]);
    }
    return shown;
  }

  function placeInList(key) {
    var list = visibleProducts();
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (sourceId(list[i]) === String(key)) return { index: i, total: list.length, list: list };
    }
    return { index: -1, total: list.length, list: list };
  }

  function updateStepper() {
    var place;
    var nav = field('admin-edit-nav');
    if (field('admin-dialog').classList.contains('is-bulk')) {
      nav.hidden = true;
      return;
    }
    nav.hidden = false;
    place = placeInList(editingIds[0]);
    field('admin-edit-pos').textContent = (place.index < 0 ? 1 : place.index + 1) + ' / ' + place.total;
    field('admin-edit-prev').disabled = place.index <= 0;
    field('admin-edit-next').disabled = place.index < 0 || place.index >= place.total - 1;
  }

  function stepProduct(direction) {
    var place = placeInList(editingIds[0]);
    var next = place.index + direction;
    if (next < 0 || next >= place.list.length) return;
    openSingle(sourceId(place.list[next]));
  }

  function fillForm(product) {
    var existing = product && product.images && product.images.length ? product.images[0] : '';
    var url = existing.indexOf('data:') === 0 ? '' : existing;
    field('edit-id').value = product ? product.id : '';
    field('edit-name').value = product ? product.name : '';
    field('edit-price').value = product ? String(product.price) : '';
    field('edit-category').value = product ? product.category || '' : '';
    field('edit-stock').value = !product || product.inStock ? 'yes' : 'no';
    field('edit-popular').value = product && product.popular ? 'yes' : 'no';
    field('edit-rank').value = product && product.mostOrdered != null ? String(product.mostOrdered) : '';
    field('edit-hi').value = product ? product.nameHi || '' : '';
    field('edit-gu').value = product ? product.nameGu || '' : '';
    field('edit-file').value = '';
    imageChoice = 'keep';
    pickedImage = '';
    keptImage = existing;
    field('edit-url').value = url;
    field('admin-url-row').hidden = true;
    field('admin-shop-badge').hidden = !product;
    if (product) field('admin-shop-no').textContent = Data.padId(product.id);
    showPreview(existing);
    paintChoices();
  }

  function clearApplyBoxes() {
    var boxes = field('admin-edit-form').querySelectorAll('[data-apply]');
    var i;
    for (i = 0; i < boxes.length; i += 1) boxes[i].checked = false;
  }

  function openDialog(bulk) {
    var dialog = field('admin-dialog');
    fillCategoryList();
    showError('');
    dialog.classList.toggle('is-bulk', bulk);
    dialog.classList.toggle('is-single', !bulk);
    field('admin-edit-title').textContent = bulk
      ? 'Edit ' + editingIds.length + (editingIds.length === 1 ? ' product' : ' products')
      : 'Edit product';
    field('admin-edit-lead').hidden = !bulk;
    field('admin-edit-lead').textContent = 'Tick Change on each detail to set it for every selected product.';
    updateStepper();
    document.body.classList.add('admin-noscroll');
    dialog.hidden = false;
    window.requestAnimationFrame(function () {
      dialog.classList.add('is-open');
    });
    if (bulk) field('admin-edit-form').querySelector('[data-apply]').focus();
    else field('admin-edit-form').focus();
  }

  function closeDialog() {
    var dialog = field('admin-dialog');
    closeCategoryMenu();
    dialog.classList.remove('is-open');
    dialog.hidden = true;
    document.body.classList.remove('admin-noscroll');
    editingIds = [];
    showError('');
  }

  function openSingle(key) {
    var product = findProduct(key);
    if (!product) return;
    editingIds = [String(key)];
    clearApplyBoxes();
    setFieldsEnabled(true);
    lockAllRows(false);
    fillForm(product);
    openDialog(false);
  }

  /* Centered sheet for many products. One product still opens the drawer. */
  function bulkSnap(product) {
    return {
      name: product.name || '',
      price: String(product.price),
      category: product.category || '',
      inStock: !!product.inStock,
      popular: !!product.popular,
      mostOrdered: product.mostOrdered != null && product.mostOrdered !== '' ? String(product.mostOrdered) : '',
      images: product.images && product.images.length ? product.images[0] : ''
    };
  }

  function copySnap(snap) {
    return {
      name: snap.name,
      price: snap.price,
      category: snap.category,
      inStock: snap.inStock,
      popular: snap.popular,
      mostOrdered: snap.mostOrdered,
      images: snap.images
    };
  }

  function bulkCategoryList(extra) {
    var seen = {};
    var names = [];
    var products = Data.products();
    var i;
    for (i = 0; i < products.length; i += 1) {
      if (!products[i].category || seen[products[i].category]) continue;
      seen[products[i].category] = true;
      names.push(products[i].category);
    }
    if (extra && !seen[extra]) names.push(extra);
    names.sort(function (a, b) { return a.localeCompare(b); });
    return names;
  }

  function bulkDirty(original, draft, fieldName) {
    if (fieldName === 'inStock' || fieldName === 'popular') return !!original[fieldName] !== !!draft[fieldName];
    return String(original[fieldName]) !== String(draft[fieldName]);
  }

  function rowDirty(row) {
    var i;
    for (i = 0; i < BULK_FIELDS.length; i += 1) {
      if (bulkDirty(row.original, row.draft, BULK_FIELDS[i])) return true;
    }
    return false;
  }

  function changeCount() {
    var count = 0;
    var i;
    var f;
    for (i = 0; i < bulkRows.length; i += 1) {
      for (f = 0; f < BULK_FIELDS.length; f += 1) {
        if (bulkDirty(bulkRows[i].original, bulkRows[i].draft, BULK_FIELDS[f])) count += 1;
      }
    }
    return count;
  }

  function bulkRowById(key) {
    var i;
    for (i = 0; i < bulkRows.length; i += 1) {
      if (bulkRows[i].sourceId === String(key)) return bulkRows[i];
    }
    return null;
  }

  function bulkError(message) {
    var error = field('admin-bulk-error');
    error.hidden = !message;
    error.textContent = message || '';
  }

  function isBlankApply(fieldName, el) {
    if (fieldName === 'inStock' || fieldName === 'popular' || fieldName === 'category') return el.value === '';
    return String(el.value).trim() === '';
  }

  function readBulkValue(el, fieldName) {
    if (fieldName === 'inStock' || fieldName === 'popular') return el.value === 'yes';
    return el.value;
  }

  function writeBulkControl(el, value) {
    var fieldName = el.getAttribute('data-bulk-field');
    var next = (fieldName === 'inStock' || fieldName === 'popular') ? (value ? 'yes' : 'no') : String(value == null ? '' : value);
    if (el.value !== next) el.value = next;
  }

  function bulkInput(key, fieldName, value, placeholder, label) {
    var input = document.createElement('input');
    input.className = 'bulk-input';
    input.type = 'text';
    input.value = value == null ? '' : String(value);
    input.autocomplete = 'off';
    input.setAttribute('data-bulk-key', key);
    input.setAttribute('data-bulk-field', fieldName);
    input.setAttribute('aria-label', label);
    if (placeholder) input.placeholder = placeholder;
    if (fieldName === 'price') input.setAttribute('inputmode', 'decimal');
    if (fieldName === 'mostOrdered') input.setAttribute('inputmode', 'numeric');
    return input;
  }

  function bulkSelect(key, fieldName, choices, value, label) {
    var select = document.createElement('select');
    var i;
    select.className = 'bulk-select';
    select.setAttribute('data-bulk-key', key);
    select.setAttribute('data-bulk-field', fieldName);
    select.setAttribute('aria-label', label);
    for (i = 0; i < choices.length; i += 1) select.appendChild(option(choices[i].value, choices[i].label));
    select.value = value;
    return select;
  }

  function bulkChoices(kind, apply, current) {
    var choices = [];
    var names;
    var i;
    if (kind === 'category') {
      if (apply || !current) choices.push({ value: '', label: '—' });
      names = bulkCategoryList(apply ? '' : current);
      for (i = 0; i < names.length; i += 1) choices.push({ value: names[i], label: names[i] });
      return choices;
    }
    if (apply) choices.push({ value: '', label: '—' });
    if (kind === 'stock') {
      choices.push({ value: 'yes', label: 'In stock' });
      choices.push({ value: 'no', label: 'Out of stock' });
      return choices;
    }
    choices.push({ value: 'yes', label: 'Popular' });
    choices.push({ value: 'no', label: 'Not popular' });
    return choices;
  }

  function priceCell(key, value, apply, label) {
    var td = document.createElement('td');
    var wrap = document.createElement('div');
    var rupee = document.createElement('span');
    var old = document.createElement('span');
    td.className = 'bulk-cell';
    td.setAttribute('data-bulk-cell', 'price');
    wrap.className = 'bulk-price';
    if (!apply) {
      old.className = 'bulk-old';
      old.hidden = true;
      wrap.appendChild(old);
    }
    rupee.className = 'bulk-rupee';
    rupee.textContent = '₹';
    wrap.appendChild(rupee);
    wrap.appendChild(bulkInput(key, 'price', apply ? '' : value, apply ? '—' : '', apply ? 'Price for all selected products' : 'Price for ' + label));
    td.appendChild(wrap);
    return td;
  }

  function categoryCell(key, value, apply, label) {
    var td = document.createElement('td');
    td.className = 'bulk-cell';
    td.setAttribute('data-bulk-cell', 'category');
    td.appendChild(bulkSelect(key, 'category', bulkChoices('category', apply, value), apply ? '' : value, apply ? 'Category for all selected products' : 'Category for ' + label));
    return td;
  }

  /* Custom stock control. The browser's own list draws a black box we cannot restyle. */
  function stockCell(key, value, apply, label) {
    var td = document.createElement('td');
    var wrap = document.createElement('div');
    var button = document.createElement('button');
    var dot = document.createElement('span');
    var caption = document.createElement('span');
    var hidden = document.createElement('input');
    td.className = 'bulk-cell';
    td.setAttribute('data-bulk-cell', 'inStock');
    wrap.className = 'bulk-stock';
    button.type = 'button';
    button.className = 'bulk-stock-btn';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', apply ? 'Stock for all selected products' : 'Stock for ' + label);
    dot.className = 'bulk-dot';
    dot.hidden = !!apply;
    caption.className = 'bulk-stock-label';
    caption.textContent = apply ? '—' : (value ? 'In stock' : 'Out of stock');
    hidden.type = 'hidden';
    hidden.value = apply ? '' : (value ? 'yes' : 'no');
    hidden.setAttribute('data-bulk-key', key);
    hidden.setAttribute('data-bulk-field', 'inStock');
    button.appendChild(dot);
    button.appendChild(caption);
    wrap.appendChild(button);
    wrap.appendChild(hidden);
    td.appendChild(wrap);
    return td;
  }

  function photoCell(key, apply, label) {
    var td = document.createElement('td');
    var button = document.createElement('button');
    var img = document.createElement('img');
    var caption = document.createElement('span');
    td.className = 'bulk-cell';
    td.setAttribute('data-bulk-cell', 'images');
    button.type = 'button';
    button.className = 'bulk-photo';
    button.setAttribute('data-bulk-key', key);
    button.setAttribute('data-bulk-field', 'images');
    button.setAttribute('aria-label', apply ? 'Photo for all selected products' : 'Photo for ' + label);
    img.alt = '';
    img.hidden = true;
    caption.className = 'bulk-photo-text';
    caption.textContent = 'Upload';
    button.appendChild(img);
    button.appendChild(caption);
    td.appendChild(button);
    return td;
  }

  function popularCell(key, value, apply, label) {
    var td = document.createElement('td');
    td.className = 'bulk-cell';
    td.setAttribute('data-bulk-cell', 'popular');
    td.appendChild(bulkSelect(
      key,
      'popular',
      bulkChoices('popular', apply),
      apply ? '' : (value ? 'yes' : 'no'),
      apply ? 'Popular for all selected products' : 'Popular for ' + label
    ));
    return td;
  }

  function rankCell(key, value, apply, label) {
    var td = document.createElement('td');
    td.className = 'bulk-cell';
    td.setAttribute('data-bulk-cell', 'mostOrdered');
    td.appendChild(bulkInput(
      key,
      'mostOrdered',
      apply ? '' : value,
      apply ? '—' : 'None',
      apply ? 'Most ordered for all selected products' : 'Most ordered for ' + label
    ));
    return td;
  }

  function buildApplyRow() {
    var tr = document.createElement('tr');
    var lead = document.createElement('td');
    var label = document.createElement('span');
    tr.className = 'bulk-apply';
    lead.colSpan = 2;
    lead.className = 'bulk-apply-lead';
    label.className = 'bulk-apply-label';
    label.appendChild(document.createTextNode('Apply to all ' + bulkRows.length + ' '));
    label.appendChild(text('span', 'bulk-apply-arrow', '↓'));
    lead.appendChild(label);
    tr.appendChild(lead);
    tr.appendChild(photoCell('all', true));
    tr.appendChild(priceCell('all', '', true));
    tr.appendChild(categoryCell('all', '', true));
    tr.appendChild(stockCell('all', '', true));
    tr.appendChild(popularCell('all', '', true));
    tr.appendChild(rankCell('all', '', true));
    return tr;
  }

  function buildProductRow(row) {
    var tr = document.createElement('tr');
    var nameCell = document.createElement('td');
    var name = bulkInput(row.sourceId, 'name', row.draft.name, '', 'Name for ' + row.draft.name);
    tr.className = 'bulk-product';
    tr.appendChild(text('td', 'bulk-no', Data.padId(row.id)));
    name.className = 'bulk-input bulk-name';
    nameCell.className = 'bulk-cell';
    nameCell.setAttribute('data-bulk-cell', 'name');
    nameCell.appendChild(name);
    tr.appendChild(nameCell);
    tr.appendChild(photoCell(row.sourceId, false, row.draft.name));
    tr.appendChild(priceCell(row.sourceId, row.draft.price, false, row.draft.name));
    tr.appendChild(categoryCell(row.sourceId, row.draft.category, false, row.draft.name));
    tr.appendChild(stockCell(row.sourceId, row.draft.inStock, false, row.draft.name));
    tr.appendChild(popularCell(row.sourceId, row.draft.popular, false, row.draft.name));
    tr.appendChild(rankCell(row.sourceId, row.draft.mostOrdered, false, row.draft.name));
    return tr;
  }

  function buildBulkTable() {
    var table = field('admin-bulk-table');
    var thead = document.createElement('thead');
    var head = document.createElement('tr');
    var body = document.createElement('tbody');
    var labels = ['No.', 'Name', 'Photo', 'Price', 'Category', 'Stock', 'Popular', 'Most ordered'];
    var classes = ['bulk-col-no', 'bulk-col-name', 'bulk-col-photo', 'bulk-col-price', 'bulk-col-cat', 'bulk-col-stock', 'bulk-col-pop', 'bulk-col-rank'];
    var i;
    while (table.firstChild) table.removeChild(table.firstChild);
    for (i = 0; i < labels.length; i += 1) {
      var th = text('th', classes[i], labels[i]);
      th.scope = 'col';
      head.appendChild(th);
    }
    thead.appendChild(head);
    table.appendChild(thead);
    body.appendChild(buildApplyRow());
    for (i = 0; i < bulkRows.length; i += 1) body.appendChild(buildProductRow(bulkRows[i]));
    table.appendChild(body);
    paintBulk();
  }

  function paintBulk() {
    var controls = field('admin-bulk-table').querySelectorAll('[data-bulk-key]');
    var count;
    var i;
    for (i = 0; i < controls.length; i += 1) {
      var el = controls[i];
      var key = el.getAttribute('data-bulk-key');
      var fieldName = el.getAttribute('data-bulk-field');
      var cell = el.closest('[data-bulk-cell]');
      var old = cell ? cell.querySelector('.bulk-old') : null;
      if (key === 'all') {
        var blank = isBlankApply(fieldName, el);
        if (cell) {
          cell.classList.toggle('is-set', !blank);
          cell.classList.toggle('is-popular', fieldName === 'popular' && el.value === 'yes');
        }
        if (fieldName === 'inStock') paintStock(cell, el.value);
        if (fieldName === 'images') paintPhoto(cell, cell.getAttribute('data-preview') || '');
        continue;
      }
      var row = bulkRowById(key);
      var dirty;
      if (!row || !cell) continue;
      dirty = bulkDirty(row.original, row.draft, fieldName);
      if (fieldName === 'images') {
        cell.classList.toggle('is-dirty', dirty);
        paintPhoto(cell, row.draft.images);
        continue;
      }
      if (document.activeElement !== el) writeBulkControl(el, row.draft[fieldName]);
      cell.classList.toggle('is-dirty', dirty);
      cell.classList.toggle('is-popular', fieldName === 'popular' && !!row.draft.popular);
      if (old) {
        old.hidden = !dirty;
        old.textContent = '₹' + row.original.price;
      }
      if (fieldName === 'inStock') paintStock(cell, row.draft.inStock ? 'yes' : 'no');
    }
    count = changeCount();
    field('admin-bulk-save').disabled = count === 0;
    field('admin-bulk-clear').disabled = count === 0 && !applyRowUsed();
    field('admin-bulk-save-label').textContent = count === 0 ? 'Save' : 'Save ' + count + (count === 1 ? ' change' : ' changes');
  }

  function paintStock(cell, value) {
    var wrap = cell.querySelector('.bulk-stock');
    var caption = cell.querySelector('.bulk-stock-label');
    var dot = cell.querySelector('.bulk-dot');
    if (!wrap) return;
    wrap.classList.toggle('is-in', value === 'yes');
    wrap.classList.toggle('is-out', value === 'no');
    if (caption) caption.textContent = value === 'yes' ? 'In stock' : (value === 'no' ? 'Out of stock' : '—');
    if (dot) {
      dot.hidden = value !== 'yes' && value !== 'no';
      dot.classList.toggle('is-out', value === 'no');
    }
  }

  function paintPhoto(cell, src) {
    var img = cell.querySelector('img');
    var caption = cell.querySelector('.bulk-photo-text');
    if (!img) return;
    if (src) {
      img.hidden = false;
      if (img.getAttribute('src') !== src) img.src = src;
      if (caption) caption.hidden = true;
    } else {
      img.hidden = true;
      img.removeAttribute('src');
      if (caption) {
        caption.hidden = false;
        caption.textContent = 'Upload';
      }
    }
  }

  function applyRowUsed() {
    var controls = field('admin-bulk-table').querySelectorAll('[data-bulk-key="all"]');
    var i;
    for (i = 0; i < controls.length; i += 1) {
      var cell = controls[i].closest('[data-bulk-cell]');
      if (cell && cell.getAttribute('data-preview')) return true;
      if (controls[i].tagName === 'BUTTON') continue;
      if (String(controls[i].value || '').trim() !== '') return true;
    }
    return false;
  }

  function onBulkInput(event) {
    var el = event.target;
    var key = el.getAttribute ? el.getAttribute('data-bulk-key') : '';
    var fieldName = el.getAttribute ? el.getAttribute('data-bulk-field') : '';
    var value;
    var i;
    var row;
    if (!key || !fieldName || el.type === 'file' || field('admin-bulk-modal').hidden) return;
    value = readBulkValue(el, fieldName);
    if (key === 'all') {
      if (isBlankApply(fieldName, el)) {
        paintBulk();
        return;
      }
      for (i = 0; i < bulkRows.length; i += 1) bulkRows[i].draft[fieldName] = value;
      paintBulk();
      return;
    }
    row = bulkRowById(key);
    if (!row) return;
    row.draft[fieldName] = value;
    paintBulk();
  }

  function closeStockMenu() {
    var menu = field('admin-bulk-stock-menu');
    menu.hidden = true;
    if (stockMenuOwner) stockMenuOwner.setAttribute('aria-expanded', 'false');
    stockMenuOwner = null;
  }

  function openStockMenu(button) {
    var menu = field('admin-bulk-stock-menu');
    var hidden = button.parentNode.querySelector('[data-bulk-field="inStock"]');
    var rect = button.getBoundingClientRect();
    var options = menu.querySelectorAll('[data-stock-choice]');
    var top;
    var i;
    closePhotoPop();
    closeStockMenu();
    stockMenuOwner = button;
    button.setAttribute('aria-expanded', 'true');
    for (i = 0; i < options.length; i += 1) {
      options[i].setAttribute('aria-selected', options[i].getAttribute('data-stock-choice') === hidden.value ? 'true' : 'false');
    }
    menu.hidden = false;
    top = rect.bottom + 6;
    if (top + menu.offsetHeight > window.innerHeight - 8) top = Math.max(8, rect.top - menu.offsetHeight - 6);
    menu.style.top = top + 'px';
    menu.style.left = Math.max(8, rect.left) + 'px';
    menu.style.width = Math.max(rect.width, 168) + 'px';
  }

  function chooseStock(value) {
    var hidden;
    if (!stockMenuOwner) return;
    hidden = stockMenuOwner.parentNode.querySelector('[data-bulk-field="inStock"]');
    hidden.value = value;
    hidden.dispatchEvent(new Event('input', { bubbles: true }));
    closeStockMenu();
  }

  function closePhotoPop() {
    var pop = field('admin-bulk-photo-pop');
    pop.hidden = true;
    photoOwner = null;
    field('admin-bulk-photo-error').hidden = true;
  }

  function openPhotoPop(button) {
    var pop = field('admin-bulk-photo-pop');
    var rect = button.getBoundingClientRect();
    var top;
    var left;
    closeStockMenu();
    closePhotoPop();
    photoOwner = {
      key: button.getAttribute('data-bulk-key'),
      cell: button.closest('[data-bulk-cell]')
    };
    field('admin-bulk-photo-url').value = '';
    field('admin-bulk-photo-file').value = '';
    field('admin-bulk-photo-error').hidden = true;
    pop.hidden = false;
    top = rect.bottom + 6;
    left = rect.left;
    if (left + pop.offsetWidth > window.innerWidth - 8) left = window.innerWidth - pop.offsetWidth - 8;
    if (top + pop.offsetHeight > window.innerHeight - 8) top = Math.max(8, rect.top - pop.offsetHeight - 6);
    pop.style.top = top + 'px';
    pop.style.left = Math.max(8, left) + 'px';
    field('admin-bulk-photo-url').focus();
  }

  function setBulkImage(key, cell, url) {
    var i;
    var row;
    if (key === 'all') {
      for (i = 0; i < bulkRows.length; i += 1) bulkRows[i].draft.images = url;
      if (cell) cell.setAttribute('data-preview', url);
    } else {
      row = bulkRowById(key);
      if (row) row.draft.images = url;
    }
    closePhotoPop();
    paintBulk();
  }

  function photoUrlOk(raw) {
    if (raw.indexOf('../images/') === 0) return raw.slice(3);
    if (raw.indexOf('images/') === 0) return raw;
    try {
      var parsed = new URL(raw);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return raw;
    } catch (err) {
      return '';
    }
    return '';
  }

  function usePhotoUrl() {
    var error = field('admin-bulk-photo-error');
    var url;
    if (!photoOwner) return;
    url = photoUrlOk(field('admin-bulk-photo-url').value.trim());
    if (!url) {
      error.hidden = false;
      error.textContent = 'Paste a full image address, starting with http.';
      return;
    }
    error.hidden = true;
    setBulkImage(photoOwner.key, photoOwner.cell, url);
  }

  function onBulkImage(input) {
    var file = input.files && input.files[0];
    var owner = photoOwner;
    if (!file || !owner) return;
    if (!file.type || file.type.indexOf('image/') !== 0) {
      field('admin-bulk-photo-error').hidden = false;
      field('admin-bulk-photo-error').textContent = 'Choose an image file.';
      input.value = '';
      return;
    }
    field('admin-bulk-photo-error').hidden = true;
    shrinkImage(file).then(function (url) {
      if (field('admin-bulk-modal').hidden) return;
      setBulkImage(owner.key, owner.cell, url);
    }).catch(function () {
      bulkError('That image could not be read.');
    });
  }

  /* Puts the sheet back to the saved values and leaves it open. */
  function clearBulkChanges() {
    var controls;
    var i;
    closeStockMenu();
    closePhotoPop();
    for (i = 0; i < bulkRows.length; i += 1) bulkRows[i].draft = copySnap(bulkRows[i].original);
    controls = field('admin-bulk-table').querySelectorAll('[data-bulk-key="all"]');
    for (i = 0; i < controls.length; i += 1) {
      var cell = controls[i].closest('[data-bulk-cell]');
      if (controls[i].type === 'file') controls[i].value = '';
      else controls[i].value = '';
      if (cell) cell.removeAttribute('data-preview');
    }
    bulkError('');
    paintBulk();
  }

  function closeBulk() {
    var table = field('admin-bulk-table');
    closeStockMenu();
    closePhotoPop();
    field('admin-bulk-modal').hidden = true;
    document.body.classList.remove('admin-noscroll');
    bulkRows = [];
    while (table.firstChild) table.removeChild(table.firstChild);
    bulkError('');
  }

  function saveBulk() {
    var updates = [];
    var i;
    var row;
    var product;
    var current;
    bulkError('');
    if (!bulkRows.length || field('admin-bulk-save').disabled) return;
    for (i = 0; i < bulkRows.length; i += 1) {
      row = bulkRows[i];
      if (!rowDirty(row)) continue;
      if (!String(row.draft.name).trim()) return bulkError('Enter a name for every product.');
      if (!priceOk(row.draft.price)) return bulkError('Enter a price, 0 or more.');
      if (!rankOk(row.draft.mostOrdered)) return bulkError('Most ordered must be a number, or empty.');
      current = findProduct(row.sourceId);
      if (!current) continue;
      product = formProduct(current);
      product.name = String(row.draft.name).trim();
      product.price = String(row.draft.price).trim();
      product.category = String(row.draft.category).trim();
      product.inStock = !!row.draft.inStock;
      product.popular = !!row.draft.popular;
      product.mostOrdered = String(row.draft.mostOrdered).trim();
      if (bulkDirty(row.original, row.draft, 'images')) product.images = row.draft.images || '';
      updates.push({ sourceId: row.sourceId, product: product });
    }
    if (!updates.length) return;
    try {
      Data.saveEdits(updates);
    } catch (err) {
      bulkError('Could not save. This browser blocked storage.');
      return;
    }
    closeBulk();
    fillCategories();
    render();
    field('admin-note').hidden = false;
    field('admin-note').textContent = 'Saved.';
  }

  function openBulk() {
    var ids = selectedIds();
    var products = [];
    var i;
    var product;
    var first;
    if (!ids.length) return;
    for (i = 0; i < ids.length; i += 1) {
      product = findProduct(ids[i]);
      if (product) products.push(product);
    }
    if (!products.length) return;
    products.sort(byNumber);
    bulkRows = products.map(function (item) {
      var snap = bulkSnap(item);
      return {
        sourceId: sourceId(item),
        id: item.id,
        original: snap,
        draft: copySnap(snap)
      };
    });
    field('admin-bulk-title').textContent = 'Editing ' + bulkRows.length + (bulkRows.length === 1 ? ' product' : ' products');
    bulkError('');
    buildBulkTable();
    document.body.classList.add('admin-noscroll');
    field('admin-bulk-modal').hidden = false;
    first = field('admin-bulk-table').querySelector('.bulk-apply [data-bulk-field="price"]');
    if (first) first.focus();
  }

  function priceOk(value) {
    var amount = Number(String(value).replace(/[^\d.]/g, ''));
    return String(value).trim() !== '' && isFinite(amount) && amount >= 0 && amount <= 1000000;
  }

  function rankOk(value) {
    return String(value).trim() === '' || isFinite(Number(value));
  }

  function idTaken(id, exceptSource) {
    var products = Data.products();
    var i;
    for (i = 0; i < products.length; i += 1) {
      if (sourceId(products[i]) === String(exceptSource)) continue;
      if (String(products[i].id) === String(id)) return true;
    }
    return false;
  }

  function formProduct(baseProduct) {
    var product = {
      id: baseProduct ? baseProduct.id : '',
      name: baseProduct ? baseProduct.name : '',
      description: baseProduct ? baseProduct.description || '' : '',
      price: baseProduct ? baseProduct.price : '',
      category: baseProduct ? baseProduct.category || '' : '',
      images: baseProduct && baseProduct.images ? baseProduct.images.join('|') : '',
      inStock: baseProduct ? !!baseProduct.inStock : true,
      popular: baseProduct ? !!baseProduct.popular : false,
      mostOrdered: baseProduct && baseProduct.mostOrdered != null ? baseProduct.mostOrdered : '',
      nameHi: baseProduct ? baseProduct.nameHi || '' : '',
      nameGu: baseProduct ? baseProduct.nameGu || '' : ''
    };
    return product;
  }

  function readControl(id) {
    if (id === 'stock') return field('edit-stock').value === 'yes';
    if (id === 'popular') return field('edit-popular').value === 'yes';
    if (id === 'rank') return field('edit-rank').value.trim();
    if (id === 'images') return currentImage();
    if (id === 'hi') return field('edit-hi').value.trim();
    if (id === 'gu') return field('edit-gu').value.trim();
    return field('edit-' + id).value.trim();
  }

  function applyChange(product, controlId, value) {
    if (controlId === 'name') product.name = value;
    if (controlId === 'price') product.price = value;
    if (controlId === 'category') product.category = value;
    if (controlId === 'images') product.images = value;
    if (controlId === 'stock') product.inStock = value;
    if (controlId === 'popular') product.popular = value;
    if (controlId === 'rank') product.mostOrdered = value;
    if (controlId === 'hi') product.nameHi = value;
    if (controlId === 'gu') product.nameGu = value;
  }

  function checkedChanges() {
    var boxes = field('admin-edit-form').querySelectorAll('[data-apply]');
    var changes = [];
    var i;
    for (i = 0; i < boxes.length; i += 1) {
      if (!boxes[i].checked) continue;
      changes.push(boxes[i].getAttribute('data-apply'));
    }
    return changes;
  }

  function saveForm(event) {
    var updates = [];
    var changes;
    var i;
    var j;
    event.preventDefault();
    showError('');
    if (editingIds.length === 1 && !field('admin-dialog').classList.contains('is-bulk')) {
      var single = formProduct(findProduct(editingIds[0]));
      single.id = field('edit-id').value.trim();
      single.name = field('edit-name').value.trim();
      single.price = field('edit-price').value.trim();
      single.category = field('edit-category').value.trim();
      single.images = currentImage();
      single.inStock = field('edit-stock').value === 'yes';
      single.popular = field('edit-popular').value === 'yes';
      single.mostOrdered = field('edit-rank').value.trim();
      single.nameHi = field('edit-hi').value.trim();
      single.nameGu = field('edit-gu').value.trim();
      if (!single.id) return showError('Enter an item number.');
      if (!single.name) return showError('Enter a name.');
      if (!priceOk(single.price)) return showError('Enter a price, 0 or more.');
      if (!rankOk(single.mostOrdered)) return showError('Most ordered must be a number, or empty.');
      if (idTaken(single.id, editingIds[0])) return showError('That item number is already used.');
      updates.push({ sourceId: editingIds[0], product: single });
    } else {
      changes = checkedChanges();
      if (!changes.length) return showError('Tick at least one detail to change.');
      for (i = 0; i < changes.length; i += 1) {
        var value = readControl(changes[i]);
        if (changes[i] === 'name' && !value) return showError('Enter a name.');
        if (changes[i] === 'images' && !value) return showError('Upload an image or paste an image URL.');
        if (changes[i] === 'price' && !priceOk(value)) return showError('Enter a price, 0 or more.');
        if (changes[i] === 'rank' && !rankOk(value)) return showError('Most ordered must be a number, or empty.');
      }
      for (i = 0; i < editingIds.length; i += 1) {
        var current = findProduct(editingIds[i]);
        var next;
        if (!current) continue;
        next = formProduct(current);
        for (j = 0; j < changes.length; j += 1) applyChange(next, changes[j], readControl(changes[j]));
        updates.push({ sourceId: editingIds[i], product: next });
      }
      if (!updates.length) return showError('Those products are no longer in the list.');
    }
    try {
      Data.saveEdits(updates);
    } catch (err) {
      showError('Could not save. This browser blocked storage.');
      return;
    }
    closeDialog();
    fillCategories();
    render();
    field('admin-note').hidden = false;
    field('admin-note').textContent = 'Saved.';
  }

  function resetFilters() {
    page = 1;
    document.getElementById('admin-search').value = '';
    document.getElementById('admin-category').value = 'all';
    document.getElementById('admin-stock').value = 'all';
    document.getElementById('admin-popular').value = 'all';
    render();
    document.getElementById('admin-search').focus();
  }

  function loadProducts() {
    if (loaded) {
      render();
      return;
    }
    if (loading) return;
    loading = true;
    document.getElementById('admin-count').textContent = 'Loading products…';
    Config.load().then(function () {
      return Data.load();
    }).then(function () {
      loaded = true;
      loading = false;
      if (!signedIn()) return;
      fillCategories();
      render();
    }).catch(function () {
      loading = false;
      document.getElementById('admin-count').textContent = 'Products could not be loaded.';
    });
  }

  function openPanel() {
    show(true);
    loadProducts();
    document.getElementById('admin-search').focus();
  }

  var SHEET_FIELDS = ['id', 'name', 'description', 'price', 'category', 'images', 'in_stock', 'popular', 'most_ordered', 'name_hi', 'name_gu'];

  /* The file uses the same columns as the Google Sheet, with any edits already filled in. */
  function sheetRows() {
    return Data.products().map(function (product) {
      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category || '',
        images: (product.images || []).join('|'),
        in_stock: product.inStock ? 'Y' : 'N',
        popular: product.popular ? 'Y' : 'N',
        most_ordered: product.mostOrdered == null ? '' : product.mostOrdered,
        name_hi: product.nameHi || '',
        name_gu: product.nameGu || ''
      };
    });
  }

  function note(message) {
    field('admin-note').hidden = false;
    field('admin-note').textContent = message;
  }

  function downloadSheet() {
    var csv;
    var blob;
    var url;
    var link;
    if (!window.Papa) return note('The sheet tool is still loading. Try again.');
    csv = '\uFEFF' + Papa.unparse({ fields: SHEET_FIELDS, data: sheetRows() });
    blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    url = URL.createObjectURL(blob);
    link = document.createElement('a');
    link.href = url;
    link.download = 'bazariyaa-products.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function uploadSheet(input) {
    var file = input.files && input.files[0];
    var reader;
    if (!file) return;
    reader = new FileReader();
    reader.onerror = function () {
      input.value = '';
      note('That file could not be read.');
    };
    reader.onload = function () {
      var count;
      input.value = '';
      try {
        count = Data.importCsv(String(reader.result || ''));
      } catch (err) {
        note('This browser could not store that sheet. Try a smaller file.');
        return;
      }
      if (!count) {
        note('That file has no products. Keep the same columns as the product sheet.');
        return;
      }
      page = 1;
      selected = {};
      fillCategories();
      render();
      note('Uploaded ' + count + ' products. This browser now uses that list.');
    };
    reader.readAsText(file);
  }

  function closeAccount() {
    field('admin-account-menu').hidden = true;
    field('admin-account').setAttribute('aria-expanded', 'false');
  }

  function toggleAccount() {
    var menu = field('admin-account-menu');
    var open = menu.hidden;
    var first;
    menu.hidden = !open;
    field('admin-account').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!open) return;
    first = menu.querySelector('[role="menuitem"]');
    if (first) first.focus();
  }

  var sitePage = 'shop';
  var siteHold = '';

  function showSiteNote(text) {
    siteHold = text || '';
    paintSiteNote();
  }

  function paintSiteNote() {
    var note = field('admin-site-note');
    var text = field('admin-site-note-text');
    var count;
    if (!note || !text) return;
    if (siteHold) {
      text.textContent = siteHold;
      note.classList.remove('is-dirty');
      return;
    }
    count = field('admin-site-fields').querySelectorAll('.site-row.is-dirty').length;
    note.classList.toggle('is-dirty', count > 0);
    if (count === 0) text.textContent = 'No unsaved changes';
    else if (count === 1) text.textContent = '1 unsaved change across tabs';
    else text.textContent = count + ' unsaved changes across tabs';
  }

  function siteInput(id) {
    return document.querySelector('[data-site-input="' + id + '"]');
  }

  function sitePages() {
    return [
      { id: 'shop', label: 'Shop' },
      { id: 'home', label: 'Home' },
      { id: 'about', label: 'About' },
      { id: 'return', label: 'Return policy' },
      { id: 'terms', label: 'Terms' }
    ];
  }

  /* Groups match the config design. ids stay the saved field names. */
  function siteSections() {
    return [
      sec('shop', 'identity', '01', 'Identity', 'Identity', [
        rows(['shopName', 'tagline', 'logo'])
      ]),
      sec('shop', 'contact', '02', 'Contact & money', 'Contact & money', [
        rows(['whatsappNumber', 'city', 'freeDeliveryAbove', 'currencySymbol'])
      ]),
      sec('shop', 'areas', '03', 'Delivery areas', 'Delivery areas', [
        rows(['areas'])
      ]),
      sec('home', 'banner', '01', 'Free delivery banner', 'Free delivery banner', [
        rows(['i18n.freeFrom', 'i18n.payAtDoor', 'i18n.freeNote'])
      ]),
      sec('home', 'order', '02', 'Order by number', 'Order by number', [
        rows([
          { id: 'i18n.navOrder', label: 'Heading' },
          { id: 'i18n.orderHelp', label: 'Help' }
        ])
      ]),
      sec('home', 'deliver', '03', 'Delivering', 'Delivering', [
        rows([
          { id: 'i18n.deliveringInCity', label: 'Heading' },
          { id: 'i18n.onlyCity', label: 'Note' }
        ])
      ]),
      sec('home', 'under', '04', 'Under today', 'Under today', [
        rows([
          { id: 'i18n.underToday', label: 'Heading' },
          { id: 'i18n.smallHelp', label: 'Note' }
        ])
      ]),
      sec('home', 'how', '05', 'How ordering works', 'How ordering works', [
        rows([
          { id: 'i18n.howTitle', label: 'Heading' },
          { id: 'i18n.noLogin', label: 'Note' }
        ]),
        card('01 / 03  Step 1', [
          { id: 'i18n.stepPick', label: 'Title' },
          { id: 'i18n.pickBody', label: 'Text' }
        ]),
        card('02 / 03  Step 2', [
          { id: 'i18n.stepSend', label: 'Title' },
          { id: 'i18n.sendBody', label: 'Text' }
        ]),
        card('03 / 03  Step 3', [
          { id: 'i18n.stepPay', label: 'Title' },
          { id: 'i18n.payBody', label: 'Text' }
        ])
      ]),
      sec('home', 'promise', '06', 'Promise', 'Promise', [
        rows([{ id: 'i18n.ourPromise', label: 'Heading' }]),
        card('01 / 03  Promise 1', [{ id: 'i18n.packed', label: 'Text' }]),
        card('02 / 03  Promise 2', [{ id: 'i18n.checked', label: 'Text' }]),
        card('03 / 03  Promise 3', [
          { id: 'i18n.replaced', label: 'Text' },
          { id: 'i18n.replacedBody', label: 'Detail' }
        ]),
        rows([{ id: 'home.promise', label: 'Promise photo' }])
      ]),
      sec('home', 'poster', '07', 'Poster', 'Poster', [
        rows([
          { id: 'i18n.orderOn', label: 'Line 1' },
          { id: 'i18n.whatsappWord', label: 'Line 2' },
          { id: 'i18n.sayNamaste', label: 'Button' }
        ])
      ]),
      sec('about', 'letter', '01', 'Founder letter', 'Founder letter', [
        rows([
          { id: 'about.kicker', label: 'Letter label' },
          { id: 'about.sign', label: 'Sign-off' },
          { id: 'about.quote', label: 'Letter' },
          { id: 'about.founderName', label: 'Founder name' },
          { id: 'about.founderRole', label: 'Founder role' },
          { id: 'about.founderImg', label: 'Founder photo' }
        ])
      ]),
      sec('about', 'photos', '02', 'Shop photos', 'Shop photos', [
        card('01 / 02  Shop photo', [
          { id: 'about.shopImg', label: 'Photo' },
          { id: 'about.shopCap', label: 'Caption' }
        ]),
        card('02 / 02  Packing photo', [
          { id: 'about.packImg', label: 'Photo' },
          { id: 'about.packCap', label: 'Caption' }
        ]),
        rows([{ id: 'about.check', label: 'Checked line' }])
      ]),
      sec('about', 'journey', '03', 'Journey', 'Journey', [
        rows([{ id: 'about.journeyTitle', label: 'Heading' }]),
        card('01 / 04  Journey 1', [
          { id: 'about.y1year', label: 'Year' },
          { id: 'about.y1title', label: 'Title' },
          { id: 'about.y1body', label: 'Text' }
        ]),
        card('02 / 04  Journey 2', [
          { id: 'about.y2year', label: 'Year' },
          { id: 'about.y2title', label: 'Title' },
          { id: 'about.y2body', label: 'Text' }
        ]),
        card('03 / 04  Journey 3', [
          { id: 'about.y3year', label: 'Year' },
          { id: 'about.y3title', label: 'Title' },
          { id: 'about.y3body', label: 'Text' }
        ]),
        card('04 / 04  Journey 4', [
          { id: 'about.y4year', label: 'Year' },
          { id: 'about.y4title', label: 'Title' },
          { id: 'about.y4body', label: 'Text' }
        ])
      ]),
      sec('about', 'delivery', '04', 'Delivery', 'Delivery', [
        rows([
          { id: 'about.deliverKicker', label: 'Label' },
          { id: 'about.deliverTitle', label: 'Heading' },
          { id: 'about.deliverBody', label: 'Text' }
        ])
      ]),
      sec('about', 'chat', '05', 'Chat', 'Chat', [
        rows([
          { id: 'about.hello', label: 'Heading' },
          { id: 'about.chat', label: 'Button' }
        ])
      ]),
      sec('return', 'top', '01', 'Page top', 'Page top', [
        rows([
          { id: 'return.title', label: 'Page heading' },
          { id: 'return.lead', label: 'Page intro' }
        ])
      ]),
      sec('return', 'cases', '02', 'Cases', 'Cases', [
        card('01 / 06  Arrived broken', caseFields('broken')),
        card('02 / 06  Wrong item', caseFields('wrong')),
        card('03 / 06  Something missing', caseFields('missing')),
        card('04 / 06  Changed my mind', caseFields('mind')),
        card('05 / 06  Already used', caseFields('used')),
        card('06 / 06  Too late', caseFields('late'))
      ]),
      sec('return', 'window', '03', 'Return window', 'Return window', [
        rows([
          { id: 'return.daysTitle', label: 'Heading' },
          { id: 'return.daysKicker', label: 'Label' }
        ]),
        card('01 / 03  Day 0', [
          { id: 'return.day0.name', label: 'Name' },
          { id: 'return.day0.body', label: 'Text' }
        ]),
        card('02 / 03  Day 1', [
          { id: 'return.day1.name', label: 'Name' },
          { id: 'return.day1.body', label: 'Text' }
        ]),
        card('03 / 03  Day 2', [
          { id: 'return.day2.name', label: 'Name' },
          { id: 'return.day2.body', label: 'Text' }
        ])
      ]),
      sec('return', 'send', '04', 'What to send', 'What to send', [
        rows([
          { id: 'return.sendTitle', label: 'Heading' },
          { id: 'return.sendKicker', label: 'Label' }
        ]),
        card('01 / 03  Photo 1', photoFields('return.send1')),
        card('02 / 03  Photo 2', photoFields('return.send2')),
        card('03 / 03  Photo 3', photoFields('return.send3'))
      ]),
      sec('return', 'good', '05', 'Good to know', 'Good to know', [
        rows([
          { id: 'return.goodKicker', label: 'Label' },
          { id: 'return.goodTitle', label: 'Heading' },
          { id: 'return.good.lines', label: 'Lines' }
        ])
      ]),
      sec('return', 'chat', '06', 'Chat', 'Chat', [
        rows([
          { id: 'return.chatKicker', label: 'Chat label' },
          { id: 'return.chat1', label: 'Chat heading 1' },
          { id: 'return.chat2', label: 'Chat heading 2' },
          { id: 'return.chat3', label: 'Chat heading 3' },
          { id: 'return.chatLead', label: 'Chat intro' },
          { id: 'return.chatName', label: 'Chat name' },
          { id: 'return.chatReply', label: 'Reply time' },
          { id: 'return.chatCap', label: 'Photo caption' },
          { id: 'return.chatImg', label: 'Chat photo' }
        ]),
        card('01 / 01  Sample conversation', [
          { id: 'return.bubble1', label: 'Shop message 1' },
          { id: 'return.bubble2', label: 'Customer message' },
          { id: 'return.bubble3', label: 'Shop message 2' },
          { id: 'return.chatNote', label: 'Sample note' }
        ])
      ]),
      sec('return', 'choose', '07', 'You choose', 'You choose', [
        rows([
          { id: 'return.chooseTitle', label: 'Heading' },
          { id: 'return.chooseKicker', label: 'Label' }
        ]),
        card('01 / 02  Replace', [
          { id: 'return.replaceWord', label: 'Word' },
          { id: 'return.replaceBody', label: 'Text' }
        ]),
        card('02 / 02  Refund', [
          { id: 'return.refundWord', label: 'Word' },
          { id: 'return.refundBody', label: 'Text' }
        ])
      ]),
      sec('return', 'print', '08', 'Fine print', 'Fine print', [
        rows([
          { id: 'return.receiptShop', label: 'Shop line' },
          { id: 'return.printTitle', label: 'Heading' }
        ]),
        card('01 / 07  Time', pair('return.print.timeL', 'return.print.timeV')),
        card('02 / 07  Damaged', pair('return.print.damageL', 'return.print.damageV')),
        card('03 / 07  Changed mind', pair('return.print.mindL', 'return.print.mindV')),
        card('04 / 07  Pickup', pair('return.print.pickupL', 'return.print.pickupV')),
        card('05 / 07  Refund', pair('return.print.refundL', 'return.print.refundV')),
        card('06 / 07  Forms', pair('return.print.formsL', 'return.print.formsV')),
        card('07 / 07  You pay', pair('return.print.payL', 'return.print.payV')),
        rows([{ id: 'return.print.date', label: 'Date' }])
      ]),
      sec('return', 'cant', '09', "Can't take back", "Can't take back", [
        rows([
          { id: 'return.cantKicker', label: 'Label' },
          { id: 'return.cant1', label: 'Item 1' },
          { id: 'return.cant2', label: 'Item 2' },
          { id: 'return.cant3', label: 'Item 3' },
          { id: 'return.cantNote', label: 'Note' }
        ])
      ]),
      sec('return', 'start', '10', 'Start', 'Start', [
        rows([
          { id: 'return.start', label: 'Heading' },
          { id: 'return.startBtn', label: 'Button' }
        ])
      ]),
      sec('terms', 'top', '01', 'Page top', 'Page top', [
        rows([
          { id: 'i18n.terms', label: 'Page heading' },
          { id: 'terms.intro', label: 'Intro' }
        ])
      ]),
      sec('terms', 'clauses', '02', 'Clauses', 'Clauses', [
        clause('01', 'Acceptance', 'terms.acceptance', 'Text'),
        clause('02', 'Ordering', 'terms.ordering', 'Lines'),
        clause('03', 'Payment', 'terms.payment', 'Lines'),
        clause('04', 'Delivery', 'terms.delivery', 'Lines'),
        clause('05', 'Products', 'terms.products', 'Lines'),
        clause('06', 'Returns', 'terms.returns', 'Text'),
        clause('07', 'Liability', 'terms.liability', 'Text'),
        clause('08', 'Privacy', 'terms.privacy', 'Lines'),
        clause('09', 'Content', 'terms.ip', 'Text'),
        clause('10', 'Changes', 'terms.changes', 'Text'),
        clause('11', 'Contact', 'terms.contact', 'Text')
      ]),
      sec('terms', 'close', '03', 'Closing', 'Closing', [
        rows([
          { id: 'terms.updated', label: 'Last updated line' },
          { id: 'i18n.ctaQuestions', label: 'Questions line' },
          { id: 'terms.agree', label: 'Agreement line' },
          { id: 'i18n.ctaAskUs', label: 'Ask us line' },
          { id: 'i18n.chatOnWhatsApp', label: 'WhatsApp button' }
        ])
      ])
    ];
  }

  function sec(page, id, num, title, chip, blocks) {
    return { page: page, id: id, num: num, title: title, chip: chip, blocks: blocks };
  }

  function rows(ids) {
    return { ids: ids };
  }

  function card(title, ids) {
    return { card: title, ids: ids };
  }

  function caseFields(key) {
    return [
      { id: 'return.' + key + '.label', label: 'Case' },
      { id: 'return.' + key + '.badge', label: 'Answer badge' },
      { id: 'return.' + key + '.title', label: 'Answer title' },
      { id: 'return.' + key + '.body', label: 'Answer text' }
    ];
  }

  function photoFields(prefix) {
    return [
      { id: prefix + '.img', label: 'Photo' },
      { id: prefix + '.title', label: 'Title' },
      { id: prefix + '.body', label: 'Text' }
    ];
  }

  function pair(labelId, valueId) {
    return [
      { id: labelId, label: 'Label' },
      { id: valueId, label: 'Value' }
    ];
  }

  function clause(num, name, prefix, bodyLabel) {
    return card(num + ' / 11  ' + num + ' · ' + name, [
      { id: prefix + '.short', label: 'Short label' },
      { id: prefix + '.title', label: 'Title' },
      { id: prefix + '.body', label: bodyLabel }
    ]);
  }

  function entryOf(entry) {
    if (typeof entry === 'string') return { id: entry, label: '' };
    return entry;
  }

  function kindLabel(kind) {
    if (kind === 'long') return 'Paragraph';
    if (kind === 'lines') return 'One per line';
    if (kind === 'image') return 'Image';
    return 'Short text';
  }

  function labelParts(label) {
    var cut = label.indexOf('. ');
    if (cut === -1) return { name: label, hint: '' };
    return { name: label.slice(0, cut), hint: label.slice(cut + 2) };
  }

  function cleanLines(value) {
    return String(value || '').split(/\n/).map(function (part) {
      return part.trim();
    }).filter(Boolean).join('\n');
  }

  function showSitePage(page) {
    var current = null;
    sitePage = page;
    sitePages().forEach(function (item) {
      if (item.id === page) current = item;
    });
    Array.prototype.forEach.call(field('admin-site-tabs').querySelectorAll('[data-site-page]'), function (btn) {
      var on = btn.getAttribute('data-site-page') === page;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    field('admin-site-search').value = '';
    field('admin-site-search').placeholder = 'Find a field in ' + (current ? current.label : 'Shop') + ' …';
    paintJumps();
    applySiteFilter();
    field('admin-site-fields').scrollTop = 0;
  }

  function paintJumps() {
    var box = field('admin-site-chips');
    var first = true;
    box.textContent = '';
    siteSections().forEach(function (section) {
      var btn;
      if (section.page !== sitePage) return;
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'site-jump' + (first ? ' is-on' : '');
      btn.setAttribute('data-site-jump', section.id);
      btn.textContent = section.chip;
      box.appendChild(btn);
      first = false;
    });
  }

  function applySiteFilter() {
    var query = field('admin-site-search').value.trim().toLowerCase();
    Array.prototype.forEach.call(field('admin-site-fields').querySelectorAll('.site-sec'), function (sec) {
      var any = false;
      if (sec.getAttribute('data-page') !== sitePage) {
        sec.hidden = true;
        return;
      }
      Array.prototype.forEach.call(sec.querySelectorAll('.site-row'), function (row) {
        var hay = row.getAttribute('data-search') || '';
        var match = !query || hay.indexOf(query) !== -1;
        row.hidden = !match;
        if (match) any = true;
      });
      Array.prototype.forEach.call(sec.querySelectorAll('.site-group'), function (group) {
        group.hidden = !group.querySelector('.site-row:not([hidden])');
      });
      sec.hidden = !any;
    });
  }

  function jumpToSection(id) {
    var sec = document.getElementById('site-sec-' + id);
    var scroller;
    field('admin-site-search').value = '';
    applySiteFilter();
    Array.prototype.forEach.call(field('admin-site-chips').querySelectorAll('[data-site-jump]'), function (btn) {
      btn.classList.toggle('is-on', btn.getAttribute('data-site-jump') === id);
    });
    if (!sec) return;
    scroller = field('admin-site-fields');
    scroller.scrollTop = sec.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  }

  function siteTextControl(item, value) {
    var input = item.kind === 'text' ? document.createElement('input') : document.createElement('textarea');
    input.setAttribute('data-site-input', item.id);
    input.setAttribute('aria-label', item.label);
    input.placeholder = 'Empty — keeps original';
    if (item.kind === 'text') input.type = 'text';
    else input.rows = 2;
    input.value = value;
    input.setAttribute('data-base', value);
    return input;
  }

  function siteImageControl(item, value) {
    var block = document.createElement('div');
    var thumb = document.createElement('span');
    var preview = document.createElement('img');
    var fallback = document.createElement('span');
    var url = document.createElement('input');
    var fileLabel = document.createElement('label');
    var file = document.createElement('input');
    var hidden = document.createElement('input');
    block.className = 'site-image';
    thumb.className = 'site-thumb' + (value ? ' is-on' : '');
    preview.className = 'site-preview';
    preview.alt = '';
    if (value) preview.src = value;
    fallback.className = 'site-thumb-fallback';
    fallback.textContent = 'photo';
    thumb.appendChild(preview);
    thumb.appendChild(fallback);
    url.type = 'url';
    url.inputMode = 'url';
    url.autocomplete = 'off';
    url.setAttribute('aria-label', item.label + ' address');
    url.placeholder = value.indexOf('data:image/') === 0
      ? 'Photo from this device'
      : 'https://... or images/photo.jpg';
    if (value.indexOf('data:image/') !== 0) url.value = value;
    url.setAttribute('data-site-url', item.id);
    file.type = 'file';
    file.accept = 'image/*';
    file.className = 'visually-hidden';
    file.setAttribute('data-site-file', item.id);
    fileLabel.className = 'site-file';
    fileLabel.appendChild(document.createTextNode('↑ Upload'));
    fileLabel.appendChild(file);
    hidden.type = 'hidden';
    hidden.setAttribute('data-site-input', item.id);
    hidden.value = value;
    hidden.setAttribute('data-base', value);
    block.appendChild(thumb);
    block.appendChild(url);
    block.appendChild(fileLabel);
    block.appendChild(hidden);
    return block;
  }

  function siteLinesControl(item, value) {
    var cleaned = cleanLines(value);
    var block = document.createElement('div');
    var hidden = document.createElement('input');
    var add = document.createElement('button');
    block.className = 'site-lines';
    hidden.type = 'hidden';
    hidden.setAttribute('data-site-input', item.id);
    hidden.value = cleaned;
    hidden.setAttribute('data-base', cleaned);
    block.appendChild(hidden);
    cleaned.split('\n').forEach(function (line) {
      if (line) block.appendChild(lineChip(item.id, line, false));
    });
    add.type = 'button';
    add.className = 'site-add';
    add.setAttribute('data-site-add', item.id);
    add.textContent = '+ Add';
    block.appendChild(add);
    return block;
  }

  function lineChip(fieldId, text, editing) {
    var chip = document.createElement('span');
    var closer = document.createElement('button');
    chip.className = 'site-chip';
    if (editing) {
      var edit = document.createElement('input');
      edit.type = 'text';
      edit.className = 'site-chip-edit';
      edit.value = text;
      edit.setAttribute('aria-label', 'New line');
      chip.appendChild(edit);
    } else {
      var span = document.createElement('span');
      span.textContent = text;
      chip.appendChild(span);
    }
    closer.type = 'button';
    closer.className = 'site-chip-x';
    closer.setAttribute('data-site-remove', fieldId);
    closer.setAttribute('aria-label', 'Remove ' + (text || 'line'));
    closer.textContent = '×';
    chip.appendChild(closer);
    return chip;
  }

  function syncLines(block) {
    var hidden;
    var parts = [];
    if (!block) return;
    hidden = block.querySelector('[data-site-input]');
    Array.prototype.forEach.call(block.querySelectorAll('.site-chip'), function (chip) {
      var edit = chip.querySelector('.site-chip-edit');
      var span = chip.querySelector('span');
      var text = edit ? edit.value.trim() : (span ? span.textContent.trim() : '');
      if (text) parts.push(text);
    });
    if (hidden) hidden.value = parts.join('\n');
  }

  function addSiteLine(id) {
    var hidden = siteInput(id);
    var block = hidden && hidden.closest('.site-lines');
    var add;
    var chip;
    var edit;
    if (!block) return;
    add = block.querySelector('[data-site-add]');
    chip = lineChip(id, '', true);
    block.insertBefore(chip, add);
    edit = chip.querySelector('.site-chip-edit');
    if (edit) edit.focus();
  }

  function commitChip(edit) {
    var chip = edit.closest('.site-chip');
    var block = edit.closest('.site-lines');
    var text = edit.value.trim();
    var span;
    var closer;
    if (!text) chip.remove();
    else {
      span = document.createElement('span');
      span.textContent = text;
      chip.insertBefore(span, edit);
      edit.remove();
      closer = chip.querySelector('.site-chip-x');
      if (closer) closer.setAttribute('aria-label', 'Remove ' + text);
    }
    syncLines(block);
    siteHold = '';
    refreshDirty();
  }

  function appendSiteRow(parent, item, labelText) {
    var parts;
    var row;
    var label;
    var name;
    var dot;
    var kind;
    var col;
    var hint;
    var control;
    if (!item) return;
    parts = labelParts(labelText || item.label);
    row = document.createElement('div');
    label = document.createElement('div');
    name = document.createElement('span');
    dot = document.createElement('span');
    kind = document.createElement('span');
    col = document.createElement('div');
    row.className = 'site-row';
    row.setAttribute('data-page', item.page);
    row.setAttribute('data-search', (parts.name + ' ' + item.label).toLowerCase());
    label.className = 'site-label';
    name.className = 'site-label-name';
    name.textContent = parts.name;
    dot.className = 'site-dirty-dot';
    name.appendChild(dot);
    kind.className = 'site-label-kind';
    kind.textContent = kindLabel(item.kind);
    label.appendChild(name);
    label.appendChild(kind);
    col.className = 'site-col';
    if (item.kind === 'image') control = siteImageControl(item, Site.shown(item));
    else if (item.kind === 'lines') control = siteLinesControl(item, Site.shown(item));
    else control = siteTextControl(item, Site.shown(item));
    (control.hasAttribute('data-site-input') ? control : control.querySelector('[data-site-input]')).setAttribute('aria-label', parts.name);
    col.appendChild(control);
    if (parts.hint) {
      hint = document.createElement('p');
      hint.className = 'site-hint';
      hint.textContent = parts.hint;
      col.appendChild(hint);
    }
    row.appendChild(label);
    row.appendChild(col);
    parent.appendChild(row);
  }

  function renderSiteSection(section, byId) {
    var box = document.createElement('section');
    var title = document.createElement('h3');
    var num = document.createElement('span');
    box.className = 'site-sec';
    box.id = 'site-sec-' + section.id;
    box.setAttribute('data-page', section.page);
    title.className = 'site-sec-title';
    num.textContent = section.num;
    title.appendChild(num);
    title.appendChild(document.createTextNode(section.title));
    box.appendChild(title);
    section.blocks.forEach(function (block) {
      var host = box;
      var heading;
      if (block.card) {
        host = document.createElement('div');
        host.className = 'site-group';
        heading = document.createElement('p');
        heading.className = 'site-group-title';
        heading.textContent = block.card;
        host.appendChild(heading);
        box.appendChild(host);
      }
      block.ids.forEach(function (entry) {
        var spec = entryOf(entry);
        appendSiteRow(host, byId[spec.id], spec.label);
      });
    });
    return box;
  }

  function paintSite() {
    var tabs = field('admin-site-tabs');
    var box = field('admin-site-fields');
    var byId = {};
    var counts = {};
    tabs.textContent = '';
    box.textContent = '';
    if (window.Site) {
      Site.fields().forEach(function (item) {
        byId[item.id] = item;
        counts[item.page] = (counts[item.page] || 0) + 1;
      });
    }
    sitePages().forEach(function (page) {
      var btn = document.createElement('button');
      var name = document.createElement('span');
      var meta = document.createElement('span');
      var dot = document.createElement('span');
      var count = document.createElement('span');
      btn.type = 'button';
      btn.className = 'site-nav-btn';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('data-site-page', page.id);
      name.textContent = page.label;
      meta.className = 'site-nav-meta';
      dot.className = 'site-nav-dot';
      count.textContent = String(counts[page.id] || 0);
      meta.appendChild(dot);
      meta.appendChild(count);
      btn.appendChild(name);
      btn.appendChild(meta);
      tabs.appendChild(btn);
    });
    siteSections().forEach(function (section) {
      box.appendChild(renderSiteSection(section, byId));
    });
    showSitePage(sitePage);
    refreshDirty();
  }

  function openSite() {
    var ready = window.Config ? Config.load() : Promise.resolve();
    ready.then(function () {
      siteHold = '';
      paintSite();
      field('admin-site-modal').hidden = false;
      document.body.classList.add('admin-noscroll');
      field('admin-site-search').focus();
    }, function () {
      siteHold = '';
      paintSite();
      field('admin-site-modal').hidden = false;
      document.body.classList.add('admin-noscroll');
    });
  }

  function closeSite() {
    if (field('admin-site-modal').hidden) return;
    field('admin-site-modal').hidden = true;
    if (field('admin-dialog').hidden && field('admin-bulk-modal').hidden) {
      document.body.classList.remove('admin-noscroll');
    }
    field('admin-site').focus();
  }

  function refreshDirty() {
    Array.prototype.forEach.call(field('admin-site-fields').querySelectorAll('.site-row'), function (row) {
      var input = row.querySelector('[data-site-input]');
      var base = input ? input.getAttribute('data-base') || '' : '';
      var now = input ? input.value.trim() : '';
      row.classList.toggle('is-dirty', now !== String(base).trim());
    });
    Array.prototype.forEach.call(field('admin-site-tabs').querySelectorAll('[data-site-page]'), function (btn) {
      var page = btn.getAttribute('data-site-page');
      var dirty = field('admin-site-fields').querySelector('.site-row.is-dirty[data-page="' + page + '"]');
      btn.classList.toggle('is-dirty', !!dirty);
    });
    paintSiteNote();
  }

  function onSiteUrl(input) {
    var id = input.getAttribute('data-site-url');
    var hidden = siteInput(id);
    var block = input.closest('.site-image');
    var preview = block.querySelector('.site-preview');
    var thumb = block.querySelector('.site-thumb');
    var value = input.value.trim();
    if (hidden) hidden.value = value;
    if (Site.safeImage(value)) {
      thumb.classList.add('is-on');
      preview.src = Site.safeImage(value);
    } else if (!value) {
      thumb.classList.remove('is-on');
      preview.removeAttribute('src');
    }
  }

  function onSiteFile(input) {
    var id = input.getAttribute('data-site-file');
    var hidden = siteInput(id);
    var block = input.closest('.site-image');
    var url = block.querySelector('[data-site-url]');
    var preview = block.querySelector('.site-preview');
    var thumb = block.querySelector('.site-thumb');
    if (!input.files || !input.files[0]) return;
    shrinkImage(input.files[0]).then(function (src) {
      if (hidden) hidden.value = src;
      if (url) {
        url.value = '';
        url.placeholder = 'Photo from this device';
      }
      if (preview) preview.src = src;
      if (thumb) thumb.classList.add('is-on');
      input.value = '';
      siteHold = '';
      refreshDirty();
    }).catch(function () {
      showSiteNote('That photo could not be read. Try another one.');
    });
  }

  function saveSite() {
    var map = {};
    var bad = '';
    if (!window.Site) return;
    Site.fields().forEach(function (item) {
      var input = siteInput(item.id);
      var value = input ? input.value.trim() : '';
      if (item.kind === 'image' && value && !Site.safeImage(value)) bad = item.label;
      map[item.id] = value;
    });
    if (bad) {
      showSiteNote(bad + ' needs a full image address starting with http, or a photo from this device.');
      return;
    }
    try {
      Site.save(map);
      if (window.Config) Site.patchConfig(Config.get());
      Site.fields().forEach(function (item) {
        var input = siteInput(item.id);
        if (input) input.setAttribute('data-base', input.value.trim());
      });
      siteHold = '';
      refreshDirty();
      showSiteNote('Saved in this browser. Refresh the shop page to see it.');
    } catch (err) {
      showSiteNote('This browser could not store that. Try a smaller photo.');
    }
  }

  function clearSite() {
    if (!window.Site) return;
    try {
      Site.clear();
    } catch (err) {
      showSiteNote('This browser could not clear the saved words.');
      return;
    }
    siteHold = '';
    paintSite();
    showSiteNote('Cleared. Refresh the shop page to see the original words.');
  }

  function start() {
    var form = document.getElementById('admin-form');
    var error = document.getElementById('admin-error');
    var user = document.getElementById('admin-user');
    var pass = document.getElementById('admin-pass');
    var panel = document.getElementById('admin-panel');
    var dialog = document.getElementById('admin-dialog');

    if (signedIn()) openPanel();
    else show(false);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = user.value.trim();
      var secret = pass.value.trim();
      if (name === USERNAME && secret === PASSWORD) {
        error.hidden = true;
        pass.value = '';
        remember();
        openPanel();
        return;
      }
      error.hidden = false;
      pass.value = '';
      pass.focus();
    });

    panel.addEventListener('input', function (event) {
      if (event.target.id === 'admin-search') {
        page = 1;
        render();
      }
      if (event.target.id === 'edit-url') {
        imageChoice = 'url';
        pickedImage = '';
        showPreview(event.target.value.trim());
      }
    });

    field('admin-photo-clear').addEventListener('click', clearPhoto);

    field('edit-file').addEventListener('change', function () {
      var file = field('edit-file').files && field('edit-file').files[0];
      useImageFile(file);
    });

    field('edit-drop').addEventListener('dragover', function (event) {
      event.preventDefault();
      if (field('edit-file').disabled) return;
      field('edit-drop').classList.add('is-over');
    });

    field('edit-drop').addEventListener('dragleave', function () {
      field('edit-drop').classList.remove('is-over');
    });

    field('admin-category-menu').addEventListener('click', function (event) {
      var choice = event.target.closest ? event.target.closest('[data-category]') : null;
      event.stopPropagation();
      if (!choice || field('edit-category').disabled) return;
      field('edit-category').value = choice.getAttribute('data-category');
      fillCategoryList();
      closeCategoryMenu();
    });

    field('edit-drop').addEventListener('drop', function (event) {
      var file;
      event.preventDefault();
      field('edit-drop').classList.remove('is-over');
      if (field('edit-file').disabled) return;
      file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      useImageFile(file);
    });

    panel.addEventListener('change', function (event) {
      var key;
      if (event.target.id === 'admin-select-all') {
        key = event.target.checked;
        shownIds.forEach(function (id) {
          if (key) selected[id] = true;
          else delete selected[id];
        });
        render();
        return;
      }
      if (event.target.getAttribute('data-action') === 'pick') {
        key = event.target.getAttribute('data-source-id');
        if (event.target.checked) selected[key] = true;
        else delete selected[key];
        updateBulkButton();
        syncSelectAll();
        return;
      }
      if (event.target.getAttribute('data-apply') === 'images') {
        field('edit-file').disabled = !event.target.checked;
        field('edit-url').disabled = !event.target.checked;
        setRowLock('images', !event.target.checked);
        if (event.target.checked) field('edit-file').focus();
        return;
      }
      if (event.target.getAttribute('data-apply')) {
        var applyName = event.target.getAttribute('data-apply');
        var inputId = 'edit-' + applyName;
        var applyInput = document.getElementById(inputId);
        if (applyInput) applyInput.disabled = !event.target.checked;
        setRowLock(applyName, !event.target.checked);
        if (event.target.checked && applyInput && applyInput.type !== 'hidden') applyInput.focus();
        return;
      }
      if (event.target.closest('.admin-tools')) {
        page = 1;
        render();
      }
    });

    panel.addEventListener('click', function (event) {
      var action = event.target.getAttribute ? event.target.getAttribute('data-action') : '';
      var pageButton = event.target.closest ? event.target.closest('#admin-pages button') : null;
      var nextPage;
      if (pageButton) {
        nextPage = page;
        if (pageButton.id === 'admin-prev') nextPage = page - 1;
        else if (pageButton.id === 'admin-next') nextPage = page + 1;
        else if (pageButton.getAttribute('data-page')) nextPage = Number(pageButton.getAttribute('data-page'));
        if (nextPage !== page && !pageButton.disabled) {
          page = nextPage;
          render();
          document.getElementById('admin-list').scrollIntoView({ block: 'start' });
        }
      }
      var stockButton = event.target.closest ? event.target.closest('[data-stock]') : null;
      if (stockButton && !field('edit-stock').disabled) {
        field('edit-stock').value = stockButton.getAttribute('data-stock');
        paintChoices();
        return;
      }
      if (event.target.id === 'admin-popular-switch' && !field('edit-popular').disabled) {
        field('edit-popular').value = field('edit-popular').value === 'yes' ? 'no' : 'yes';
        paintChoices();
        return;
      }
      if (event.target.id === 'admin-paste-url' && !field('edit-url').disabled) {
        field('admin-url-row').hidden = false;
        field('edit-url').focus();
        return;
      }
      var categoryChoice = event.target.closest ? event.target.closest('[data-category]') : null;
      if (event.target.id === 'admin-category-btn' || (event.target.closest && event.target.closest('#admin-category-btn'))) {
        if (field('admin-category-menu').hidden) openCategoryMenu();
        else closeCategoryMenu();
        return;
      }
      if (categoryChoice && !field('edit-category').disabled) {
        field('edit-category').value = categoryChoice.getAttribute('data-category');
        fillCategoryList();
        closeCategoryMenu();
        return;
      }
      if (!field('admin-category-menu').hidden) closeCategoryMenu();
      if (event.target.id === 'admin-edit-prev') {
        stepProduct(-1);
        return;
      }
      if (event.target.id === 'admin-edit-next') {
        stepProduct(1);
        return;
      }
      if (event.target.id === 'admin-clear') resetFilters();
      if (event.target.id === 'admin-bulk') openBulk();
      if (action === 'edit') openSingle(event.target.getAttribute('data-source-id'));
      if (event.target.id === 'admin-edit-cancel' || event.target.id === 'admin-edit-dismiss' || event.target.id === 'admin-drawer-scrim') closeDialog();
      if (event.target.id !== 'admin-signout') return;
      closeDialog();
      closeBulk();
      forget();
      window.location.href = 'index.html';
    });

    dialog.addEventListener('click', function (event) {
      if (event.target.id === 'admin-dialog') closeDialog();
    });

    document.getElementById('admin-edit-form').addEventListener('submit', saveForm);
    field('admin-download').addEventListener('click', downloadSheet);
    field('admin-upload').addEventListener('change', function () {
      uploadSheet(field('admin-upload'));
    });
    field('admin-account').addEventListener('click', function (event) {
      event.stopPropagation();
      toggleAccount();
    });
    field('admin-site').addEventListener('click', openSite);
    field('admin-site-close').addEventListener('click', closeSite);
    field('admin-site-save').addEventListener('click', saveSite);
    field('admin-site-clear').addEventListener('click', clearSite);
    field('admin-site-modal').addEventListener('click', function (event) {
      if (event.target.id === 'admin-site-modal') closeSite();
    });
    field('admin-site-tabs').addEventListener('click', function (event) {
      var btn = event.target.closest('[data-site-page]');
      if (!btn) return;
      showSitePage(btn.getAttribute('data-site-page'));
    });
    field('admin-site-search').addEventListener('input', applySiteFilter);
    field('admin-site-chips').addEventListener('click', function (event) {
      var btn = event.target.closest('[data-site-jump]');
      if (!btn) return;
      jumpToSection(btn.getAttribute('data-site-jump'));
    });
    field('admin-site-fields').addEventListener('input', function (event) {
      if (event.target.getAttribute('data-site-url')) onSiteUrl(event.target);
      if (event.target.classList.contains('site-chip-edit')) syncLines(event.target.closest('.site-lines'));
      siteHold = '';
      refreshDirty();
    });
    field('admin-site-fields').addEventListener('change', function (event) {
      if (event.target.getAttribute('data-site-file')) onSiteFile(event.target);
    });
    field('admin-site-fields').addEventListener('click', function (event) {
      var add = event.target.closest('[data-site-add]');
      var remove = event.target.closest('[data-site-remove]');
      var block;
      if (add) {
        addSiteLine(add.getAttribute('data-site-add'));
        return;
      }
      if (!remove) return;
      block = remove.closest('.site-lines');
      if (!remove.closest('.site-chip')) return;
      remove.closest('.site-chip').remove();
      syncLines(block);
      siteHold = '';
      refreshDirty();
    });
    field('admin-site-fields').addEventListener('focusout', function (event) {
      if (event.target.classList.contains('site-chip-edit')) commitChip(event.target);
    });
    field('admin-site-fields').addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && event.target.classList.contains('site-chip-edit')) {
        event.preventDefault();
        event.target.blur();
      }
    });
    document.addEventListener('click', function (event) {
      if (event.target.closest && event.target.closest('.admin-account')) return;
      closeAccount();
    });

    field('admin-bulk-clear').addEventListener('click', clearBulkChanges);
    field('admin-bulk-close').addEventListener('click', closeBulk);
    field('admin-bulk-save').addEventListener('click', saveBulk);
    field('admin-bulk-modal').addEventListener('click', function (event) {
      var stockButton = event.target.closest ? event.target.closest('.bulk-stock-btn') : null;
      var stockChoice = event.target.closest ? event.target.closest('[data-stock-choice]') : null;
      var photoButton = event.target.closest ? event.target.closest('.bulk-photo') : null;
      if (event.target.id === 'admin-bulk-modal') {
        closeBulk();
        return;
      }
      if (photoButton && photoButton.closest('#admin-bulk-table')) {
        openPhotoPop(photoButton);
        return;
      }
      if (event.target.closest && event.target.closest('#admin-bulk-photo-pop')) return;
      if (!field('admin-bulk-photo-pop').hidden) closePhotoPop();
      if (stockButton) {
        if (stockMenuOwner === stockButton) closeStockMenu();
        else openStockMenu(stockButton);
        return;
      }
      if (stockChoice) {
        chooseStock(stockChoice.getAttribute('data-stock-choice'));
        return;
      }
      if (!event.target.closest || !event.target.closest('.bulk-stock-menu')) closeStockMenu();
    });
    field('admin-bulk-photo-use').addEventListener('click', usePhotoUrl);
    field('admin-bulk-photo-url').addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      usePhotoUrl();
    });
    field('admin-bulk-photo-file').addEventListener('change', function (event) {
      onBulkImage(event.target);
    });
    field('admin-bulk-scroll').addEventListener('scroll', function () {
      closeStockMenu();
      closePhotoPop();
    });
    field('admin-bulk-table').addEventListener('input', onBulkInput);
    field('admin-bulk-table').addEventListener('change', function (event) {
      if (event.target && event.target.type === 'file') onBulkImage(event.target);
      else onBulkInput(event);
    });

    document.addEventListener('keydown', function (event) {
      var bulkOpen = !field('admin-bulk-modal').hidden;
      if (event.key === 'Escape') {
        if (!field('admin-site-modal').hidden) {
          closeSite();
          return;
        }
        if (!field('admin-account-menu').hidden) {
          closeAccount();
          field('admin-account').focus();
          return;
        }
        if (bulkOpen) {
          if (!field('admin-bulk-photo-pop').hidden) closePhotoPop();
          else if (stockMenuOwner) closeStockMenu();
          else closeBulk();
          return;
        }
        if (dialog.hidden) return;
        if (!field('admin-category-menu').hidden) {
          closeCategoryMenu();
          return;
        }
        closeDialog();
      }
      if (bulkOpen && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        saveBulk();
      }
    });
  }

  return { start: start };
})();

Admin.start();
