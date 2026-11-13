/* Loads the catalogue.
   Order: Supabase (when set in config.json) → Google Sheet (8 seconds) → the CSV in config.json
   → products.js → last saved copy → error.
   With Supabase on, admin saves go to the database, so every visitor sees them. */

var Data = (function () {
  var CACHE_KEY = 'bazariyaa-products';
  var EDIT_KEY = 'bazariyaa-product-edits';
  var SHEET_KEY = 'bazariyaa-uploaded-sheet';
  var list = [];
  var base = [];
  var dbMode = false;

  /* Labels for the categories used in products.js.
     A category that is not listed here still appears, using its own name. */
  var CATEGORIES = [
    { id: 'Kitchen & Dining', department: 'Kitchen & Dining', filter: 'Kitchen', tag: 'KITCHEN' },
    { id: 'Bathroom & Personal Care', department: 'Bathroom & Personal Care', filter: 'Bathroom', tag: 'BATHROOM' },
    { id: 'Cleaning & Maintenance', department: 'Cleaning & Maintenance', filter: 'Cleaning', tag: 'CLEANING' },
    { id: 'Home & Living', department: 'Home & Living', filter: 'Home', tag: 'HOME' },
    { id: 'Health & Fitness', department: 'Health & Fitness', filter: 'Health', tag: 'HEALTH' },
    { id: 'Storage & Organization', department: 'Storage & Organization', filter: 'Storage', tag: 'STORAGE' },
    { id: 'Electronics & Appliances', department: 'Electronics & Appliances', filter: 'Electronics', tag: 'ELECTRIC' },
    { id: 'Kids & Toys', department: 'Kids & Toys', filter: 'Kids', tag: 'KIDS' }
  ];

  function padId(id) {
    var text = String(id);
    while (text.length < 3) text = '0' + text;
    return text;
  }

  function categories() {
    var known = {};
    var extras = [];
    var seen = {};
    var i;
    for (i = 0; i < CATEGORIES.length; i += 1) known[CATEGORIES[i].id] = true;
    for (i = 0; i < list.length; i += 1) {
      var id = list[i].category;
      if (!id || known[id] || seen[id]) continue;
      seen[id] = true;
      extras.push({
        id: id,
        department: id,
        filter: id,
        tag: String(id).toUpperCase()
      });
    }
    return CATEGORIES.concat(extras);
  }

  function meta(category) {
    var all = categories();
    var i;
    for (i = 0; i < all.length; i += 1) {
      if (all[i].id === category) return all[i];
    }
    return null;
  }

  function tagFor(category) {
    var found = meta(category);
    if (found) return found.tag;
    return String(category || '').toUpperCase();
  }

  /* Words and numbers, lower case. "CAR" and "car" become the same word.
     A photo link is not included, so a number inside a picture address does not match. */
  function searchWords(text) {
    return String(text || '').toLowerCase().split(/[^0-9a-z\u0900-\u0aff]+/).filter(Boolean);
  }

  function searchBlob(product) {
    var info = meta(product.category);
    var bits = [
      product.name,
      product.nameHi,
      product.nameGu,
      product.description,
      product.category,
      info ? info.department : '',
      info ? info.filter : '',
      info ? info.tag : '',
      product.id,
      padId(product.id),
      String(product.price),
      product.inStock ? 'in stock available' : 'out of stock unavailable',
      product.popular ? 'popular' : '',
      product.mostOrdered != null ? 'ordered ' + product.mostOrdered : ''
    ];
    var words = {};
    var list = searchWords(bits.join(' '));
    var i;
    for (i = 0; i < list.length; i += 1) words[list[i]] = true;
    return words;
  }

  /* Every typed word must be a whole word on the product. "150" matches a price
     of 150 and the name "150 Piece", and does not match 1500 or 2150. */
  function matchesQuery(product, query) {
    var text = String(query || '').toLowerCase().trim().replace(/^(?:no\.?\s*|#\s*)(?=\d)/, '');
    var need = searchWords(text);
    var have;
    var i;
    if (!need.length) return true;
    have = searchBlob(product);
    for (i = 0; i < need.length; i += 1) {
      if (!have[need[i]]) return false;
    }
    return true;
  }

  function safeUrl(url) {
    if (!url) return '';
    /* Product photos are stored as images/... from the site root. */
    if (url.indexOf('../images/') === 0) return url.slice(3);
    if (url.indexOf('images/') === 0) return url;
    try {
      var parsed = new URL(url);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return url;
    } catch (err) {
      return '';
    }
    return '';
  }

  /* products.js uses { id, name, price, stock, category, image }. */
  function fromJs(raw) {
    if (!raw || raw.id == null || !String(raw.name || '').trim()) return null;
    var price = Number(String(raw.price == null ? '' : raw.price).replace(/[^\d.]/g, ''));
    if (!isFinite(price)) return null;
    var images = [];
    if (raw.images) {
      images = String(raw.images).split('|').map(function (part) {
        return safeUrl(part.trim());
      }).filter(Boolean);
    } else if (raw.image) {
      var one = safeUrl(String(raw.image).trim());
      if (one) images = [one];
    }
    var stock = raw.stock;
    var inStock = typeof stock === 'boolean'
      ? stock
      : String(stock == null ? raw.in_stock : stock).trim().toUpperCase() === 'Y' || stock === 1;
    var rank = raw.mostOrdered != null ? raw.mostOrdered : raw.most_ordered;
    return {
      id: String(raw.id).trim(),
      name: String(raw.name).trim(),
      description: String(raw.description || '').trim(),
      price: price,
      category: String(raw.category || '').trim(),
      images: images,
      inStock: inStock,
      popular: raw.popular === true || String(raw.popular || '').trim().toUpperCase() === 'Y',
      mostOrdered: rank === '' || rank == null || isNaN(Number(rank)) ? null : Number(rank),
      nameHi: String(raw.nameHi || raw.name_hi || '').trim(),
      nameGu: String(raw.nameGu || raw.name_gu || '').trim()
    };
  }

  function fromScript() {
    var raw = window.products;
    if (!Array.isArray(raw) || !raw.length) return null;
    var products = raw.map(fromJs).filter(Boolean);
    if (!products.length) return null;
    remember(products);
    return { products: list, source: 'script' };
  }

  /* The shop sheet uses plain headings. Older files use the short names.
     Both are accepted. Extra columns, such as the price increment, are ignored. */
  function headerName(name) {
    return String(name || '')
      .replace(/^\uFEFF/, '')
      .replace(/\u00a0/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/[_]+/g, ' ')
      .replace(/\s+/g, ' ');
  }

  function canonicalHeader(name) {
    var key = headerName(name);
    var aliases = {
      'id': 'id',
      'product id': 'id',
      's.n.': 'id',
      's.n': 'id',
      'sn': 'id',
      'name': 'name',
      'product name': 'name',
      'product name (english)': 'name',
      'name hi': 'name_hi',
      'product name (hindi)': 'name_hi',
      'name gu': 'name_gu',
      'product name (gujarati)': 'name_gu',
      'description': 'description',
      'category': 'category',
      'price': 'price',
      'price (inr)': 'base_price',
      'updated price': 'updated_price',
      'updated price (inr)': 'updated_price',
      'images': 'images',
      'image': 'images',
      'in stock': 'in_stock',
      'stock': 'in_stock',
      'popular': 'popular',
      'most ordered': 'most_ordered'
    };
    return aliases[key] || '';
  }

  /* Turn one parsed CSV row into the short names the rest of the site uses. */
  function sheetRow(raw) {
    var out = {};
    var keys;
    var i;
    var canon;
    if (!raw) return out;
    keys = Object.keys(raw);
    for (i = 0; i < keys.length; i += 1) {
      canon = canonicalHeader(keys[i]);
      if (!canon) continue;
      if (out[canon] == null || String(out[canon]).trim() === '') out[canon] = raw[keys[i]];
    }
    return out;
  }

  function money(value) {
    var text = String(value == null ? '' : value).trim();
    var amount;
    if (!text) return null;
    amount = Number(text.replace(/[^\d.]/g, ''));
    if (!isFinite(amount)) return null;
    return amount;
  }

  /* "In Stock", "Popular" and Y all mean yes. "Out of Stock" and "Not Popular" do not. */
  function flagged(value, yesWords) {
    var text = String(value == null ? '' : value).trim().toLowerCase();
    if (text === 'y' || text === 'yes' || text === 'true' || text === '1') return true;
    return yesWords.indexOf(text) !== -1;
  }

  /* A number keeps its rank. Yes means "show this in Most ordered". No means leave it out. */
  function rankValue(value) {
    var text = String(value == null ? '' : value).trim();
    var lower = text.toLowerCase();
    var amount;
    if (!text) return null;
    if (lower === 'n' || lower === 'no' || lower === 'false' || lower === '0' || lower === 'not') return null;
    if (lower === 'y' || lower === 'yes' || lower === 'true') return 1;
    amount = Number(text);
    if (!isFinite(amount)) return null;
    return amount;
  }

  function row(raw) {
    var mapped = sheetRow(raw);
    var price = money(mapped.updated_price);
    var images;
    if (price == null) price = money(mapped.price);
    if (price == null) price = money(mapped.base_price);
    if (price == null) price = 0;
    if (mapped.id == null || !String(mapped.name || '').trim()) return null;
    images = imageParts(mapped.images || mapped.image);
    return {
      id: String(mapped.id).trim(),
      name: String(mapped.name).trim(),
      description: String(mapped.description || '').trim(),
      price: price,
      category: String(mapped.category || '').trim(),
      images: images,
      inStock: flagged(mapped.in_stock, ['in stock', 'instock']),
      popular: flagged(mapped.popular, ['popular']),
      mostOrdered: rankValue(mapped.most_ordered),
      nameHi: String(mapped.name_hi || '').trim(),
      nameGu: String(mapped.name_gu || '').trim(),
      basePrice: money(mapped.base_price)
    };
  }

  function parse(text) {
    if (!window.Papa) return [];
    var parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    return (parsed.data || []).map(row).filter(Boolean).map(function (product, index) {
      product.position = index + 1;
      return product;
    });
  }

  function fetchText(url, timeoutMs) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeoutMs || 8000);
    return fetch(url, { signal: controller.signal }).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error('status');
      return res.text();
    }, function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  function copyProduct(product) {
    return {
      id: String(product.id),
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      images: (product.images || []).slice(),
      inStock: !!product.inStock,
      popular: !!product.popular,
      mostOrdered: product.mostOrdered == null ? null : product.mostOrdered,
      nameHi: product.nameHi || '',
      nameGu: product.nameGu || '',
      basePrice: product.basePrice == null ? null : product.basePrice,
      position: product.position == null ? null : product.position
    };
  }

  /* Keep the file copy separate, then lay saved edits on top.
     With Supabase the database already holds the edits, so nothing is laid on top. */
  function remember(products) {
    base = products.map(copyProduct);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(base));
    } catch (err) {
      /* Cache is a backup. Missing it only matters when the network fails. */
    }
    if (dbMode) {
      list = base.map(function (product) {
        var next = copyProduct(product);
        next.sourceId = String(product.id);
        return next;
      });
      return;
    }
    list = applyEdits(base);
  }

  /* ---------- Supabase rows ---------- */

  function fromDb(r) {
    if (!r || r.id == null || !String(r.name || '').trim()) return null;
    return {
      id: String(r.id),
      name: String(r.name).trim(),
      description: String(r.description || '').trim(),
      price: Number(r.price) || 0,
      category: String(r.category || '').trim(),
      images: (r.images || []).map(function (u) { return safeUrl(String(u || '').trim()); }).filter(Boolean),
      inStock: r.in_stock !== false,
      popular: r.popular === true,
      mostOrdered: r.most_ordered == null ? null : Number(r.most_ordered),
      nameHi: String(r.name_hi || '').trim(),
      nameGu: String(r.name_gu || '').trim(),
      basePrice: r.base_price == null ? null : Number(r.base_price),
      position: r.position == null ? null : Number(r.position)
    };
  }

  function toDb(product) {
    return {
      id: String(product.id),
      position: product.position == null ? null : product.position,
      name: product.name,
      name_hi: product.nameHi || '',
      name_gu: product.nameGu || '',
      description: product.description || '',
      category: product.category || '',
      base_price: product.basePrice == null ? null : product.basePrice,
      price: Number(product.price) || 0,
      images: (product.images || []).slice(),
      in_stock: !!product.inStock,
      popular: !!product.popular,
      most_ordered: product.mostOrdered == null ? null : Math.round(Number(product.mostOrdered))
    };
  }

  function fromDatabase() {
    return Db.allProducts(15000).then(function (rows) {
      var products = (rows || []).map(fromDb).filter(Boolean);
      if (!products.length) throw new Error('empty');
      dbMode = true;
      remember(products);
      return { products: list, source: 'db' };
    });
  }

  /* Photos picked from the device arrive as data: text. Store them in Supabase and keep the link. */
  function uploadPhotos(product) {
    var images = product.images || [];
    return Promise.all(images.map(function (src) {
      return String(src).indexOf('data:image/') === 0 ? Db.uploadImage(src, product.id) : src;
    })).then(function (urls) {
      product.images = urls;
      return product;
    });
  }

  function baseById(key) {
    var i;
    for (i = 0; i < base.length; i += 1) {
      if (String(base[i].id) === String(key)) return base[i];
    }
    return null;
  }

  function saveToDatabase(updates) {
    var prepared = updates.map(function (u) {
      var key = String(u.sourceId);
      var old = baseById(key);
      var product = cleanSaved(u.product, key);
      product.basePrice = old ? old.basePrice : null;
      product.position = old ? old.position : nextPosition();
      return { key: key, product: product };
    });
    return Promise.all(prepared.map(function (item) {
      return uploadPhotos(item.product);
    })).then(function () {
      var same = [];
      var renamed = [];
      prepared.forEach(function (item) {
        if (String(item.product.id) === item.key || !baseById(item.key)) same.push(toDb(item.product));
        else renamed.push(item);
      });
      return Db.upsertProducts(same).then(function () {
        return renamed.reduce(function (p, item) {
          return p.then(function () { return Db.updateProduct(item.key, toDb(item.product)); });
        }, Promise.resolve());
      });
    }).then(function () {
      var byKey = {};
      var added = [];
      prepared.forEach(function (item) {
        if (baseById(item.key)) byKey[item.key] = item.product;
        else added.push(item.product);
      });
      remember(base.map(function (product) {
        return byKey[String(product.id)] || product;
      }).concat(added));
    });
  }

  function nextPosition() {
    var top = 0;
    base.forEach(function (product) {
      if (product.position != null && product.position > top) top = product.position;
    });
    return top + 1;
  }

  /* The next free whole item number, for a new product. */
  function nextId() {
    var top = 0;
    base.forEach(function (product) {
      var n = Number(product.id);
      if (isFinite(n) && n > top) top = n;
    });
    return String(Math.floor(top) + 1);
  }

  /* Delete for good. Only works with Supabase. */
  function deleteProducts(ids) {
    if (!dbMode) return Promise.reject(new Error('no-db'));
    var gone = {};
    ids.forEach(function (id) { gone[String(id)] = true; });
    return Db.deleteProducts(ids).then(function () {
      remember(base.filter(function (product) { return !gone[String(product.id)]; }));
    });
  }

  function readEdits() {
    try {
      var saved = JSON.parse(localStorage.getItem(EDIT_KEY) || 'null');
      if (!saved || typeof saved !== 'object') return {};
      return saved;
    } catch (err) {
      return {};
    }
  }

  function writeEdits(edits) {
    localStorage.setItem(EDIT_KEY, JSON.stringify(edits));
  }

  /* Split the images column. A device upload is one long data: address and must stay whole. */
  function imageParts(raw) {
    var text = String(raw || '').trim();
    var parts;
    var out = [];
    var i;
    var bit;
    if (!text) return [];
    if (text.indexOf('data:image/') === 0) return [text];
    parts = text.split('|');
    for (i = 0; i < parts.length; i += 1) {
      bit = parts[i].trim();
      if (!bit) continue;
      if (bit.indexOf('data:image/') === 0) out.push(bit);
      else {
        bit = safeUrl(bit);
        if (bit) out.push(bit);
      }
    }
    return out;
  }

  /* A photo can be a site file, a web address, or an upload from the owner's device. */
  function savedImages(raw) {
    var text = Array.isArray(raw) ? raw.join('|') : String(raw || '');
    text = text.trim();
    if (!text) return [];
    if (text.indexOf('data:image/') === 0) return [text];
    return text.split(/[|\n]/).map(function (part) {
      return safeUrl(part.trim());
    }).filter(Boolean);
  }

  /* Turn a saved edit into a product. sourceId stays the number from the file. */
  function cleanSaved(raw, sourceId) {
    var price = Number(String(raw.price == null ? '' : raw.price).replace(/[^\d.]/g, ''));
    var images = savedImages(raw.images);
    var rankText = raw.mostOrdered == null ? '' : String(raw.mostOrdered).trim();
    var id = String(raw.id == null || String(raw.id).trim() === '' ? sourceId : raw.id).trim();
    if (!isFinite(price) || price < 0) price = 0;
    return {
      id: id || String(sourceId),
      name: String(raw.name || '').trim(),
      description: String(raw.description || '').trim(),
      price: price,
      category: String(raw.category || '').trim(),
      images: images,
      inStock: raw.inStock === true || String(raw.inStock) === 'true' || String(raw.inStock).toUpperCase() === 'Y',
      popular: raw.popular === true || String(raw.popular) === 'true' || String(raw.popular).toUpperCase() === 'Y',
      mostOrdered: rankText === '' || !isFinite(Number(rankText)) ? null : Number(rankText),
      nameHi: String(raw.nameHi || '').trim(),
      nameGu: String(raw.nameGu || '').trim()
    };
  }

  function applyEdits(products) {
    var edits = readEdits();
    return products.map(function (product) {
      var key = String(product.id);
      var edit = edits[key];
      var next = edit ? cleanSaved(edit, key) : copyProduct(product);
      next.sourceId = key;
      return next;
    });
  }

  /* updates: [{ sourceId, product }, ...]. Returns a promise. */
  function saveEdits(updates) {
    if (dbMode) return saveToDatabase(updates);
    try {
      var edits = readEdits();
      var i;
      for (i = 0; i < updates.length; i += 1) {
        var key = String(updates[i].sourceId);
        edits[key] = cleanSaved(updates[i].product, key);
      }
      writeEdits(edits);
      list = applyEdits(base);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  function readCache() {
    try {
      var saved = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (!Array.isArray(saved) || !saved.length) return null;
      saved.forEach(function (product) {
        if (!product.images) return;
        product.images = product.images.map(function (url) {
          return url.indexOf('../images/') === 0 ? url.slice(3) : url;
        });
      });
      return saved;
    } catch (err) {
      return null;
    }
  }

  function localFile(url) {
    if (!url || /^https?:\/\//i.test(url)) return url;
    if (url.indexOf('../') === 0) url = url.slice(3);
    return encodeURI(url);
  }

  function fromUrl(url, source, timeoutMs) {
    return fetchText(url, timeoutMs).then(function (text) {
      var products = parse(text);
      if (!products.length) throw new Error('empty');
      remember(products);
      return { products: list, source: source };
    });
  }

  /* The owner uploaded a sheet in the admin panel. That copy wins until they upload another. */
  function uploadedSheet() {
    try {
      if (localStorage.getItem(SHEET_KEY) !== '1') return null;
    } catch (err) {
      return null;
    }
    return readCache();
  }

  /* With Supabase: add new products and update matching item numbers in the database.
     Products missing from the file are kept. Without Supabase: replace the list in this browser.
     Returns a promise with the number of products in the file. */
  function importCsv(text) {
    var products = parse(text);
    var stored;
    if (!products.length) return Promise.resolve(0);
    /* Supabase is set up: the upload always goes there, even if the first load failed. */
    if (dbMode || (window.Db && Db.enabled())) {
      dbMode = true;
      return Db.upsertProducts(products.map(toDb)).then(function () {
        return fromDatabase();
      }).then(function () {
        return products.length;
      });
    }
    try {
      stored = products.map(copyProduct);
      localStorage.setItem(CACHE_KEY, JSON.stringify(stored));
      localStorage.setItem(SHEET_KEY, '1');
      writeEdits({});
      remember(stored);
      return Promise.resolve(list.length);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  function load() {
    if (window.Db && Db.enabled()) {
      return fromDatabase().catch(function (err) {
        /* An empty table while setting up: let the admin load the file and upload it. */
        dbMode = !!(err && err.message === 'empty');
        /* Database unreachable: the last copy this phone got from it beats the old CSV. */
        var cached = dbMode ? null : readCache();
        if (cached) {
          remember(cached);
          return { products: list, source: 'cache' };
        }
        return loadFiles();
      });
    }
    return loadFiles();
  }

  function usingDatabase() {
    return dbMode;
  }

  function loadFiles() {
    var cfg = Config.get();
    var uploaded = dbMode ? null : uploadedSheet();
    var sheet;
    if (uploaded) {
      remember(uploaded);
      return Promise.resolve({ products: list, source: 'upload' });
    }
    sheet = cfg.sheetCsvUrl
      ? fromUrl(cfg.sheetCsvUrl, 'sheet', 8000)
      : Promise.reject(new Error('no sheet'));

    return sheet.then(function (result) {
      return result;
    }, function () {
      return fromUrl(localFile(cfg.fallbackCsv || 'data/products.csv'), 'csv', 8000);
    }).then(function (result) {
      return result;
    }, function () {
      var scripted = fromScript();
      if (scripted) return scripted;
      var cached = readCache();
      if (!cached) throw new Error('none');
      remember(cached);
      return { products: list, source: 'cache' };
    });
  }

  function products() {
    return list;
  }

  function byId(id) {
    var key = String(id);
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (String(list[i].id) === key) return list[i];
    }
    return null;
  }

  return {
    load: load,
    products: products,
    byId: byId,
    categories: categories,
    meta: meta,
    tagFor: tagFor,
    padId: padId,
    matchesQuery: matchesQuery,
    saveEdits: saveEdits,
    importCsv: importCsv,
    usingDatabase: usingDatabase,
    deleteProducts: deleteProducts,
    nextId: nextId
  };
})();
