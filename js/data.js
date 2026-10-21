/* Loads the catalogue.
   Order: Google Sheet (8 seconds) → the CSV in config.json → products.js → last saved copy → error. */

var Data = (function () {
  var CACHE_KEY = 'bazariyaa-products';
  var list = [];

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

  function safeUrl(url) {
    if (!url) return '';
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
    return { products: products, source: 'script' };
  }

  function row(raw) {
    if (!raw || raw.id == null || !String(raw.name || '').trim()) return null;
    var price = Number(String(raw.price || '').replace(/[^\d.]/g, ''));
    if (!isFinite(price)) return null;
    var images = String(raw.images || '').split('|').map(function (part) {
      return safeUrl(part.trim());
    }).filter(Boolean);
    var rank = String(raw.most_ordered || '').trim();
    return {
      id: String(raw.id).trim(),
      name: String(raw.name).trim(),
      description: String(raw.description || '').trim(),
      price: price,
      category: String(raw.category || '').trim(),
      images: images,
      inStock: String(raw.in_stock || '').trim().toUpperCase() === 'Y',
      popular: String(raw.popular || '').trim().toUpperCase() === 'Y',
      mostOrdered: rank ? Number(rank) : null,
      nameHi: String(raw.name_hi || '').trim(),
      nameGu: String(raw.name_gu || '').trim()
    };
  }

  function parse(text) {
    if (!window.Papa) return [];
    var parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    return (parsed.data || []).map(row).filter(Boolean);
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

  function remember(products) {
    list = products;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(products));
    } catch (err) {
      /* Cache is a backup. Missing it only matters when the network fails. */
    }
  }

  function readCache() {
    try {
      var saved = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (!Array.isArray(saved) || !saved.length) return null;
      return saved;
    } catch (err) {
      return null;
    }
  }

  function fromUrl(url, source, timeoutMs) {
    return fetchText(url, timeoutMs).then(function (text) {
      var products = parse(text);
      if (!products.length) throw new Error('empty');
      remember(products);
      return { products: products, source: source };
    });
  }

  function load() {
    var cfg = Config.get();
    var sheet = cfg.sheetCsvUrl
      ? fromUrl(cfg.sheetCsvUrl, 'sheet', 8000)
      : Promise.reject(new Error('no sheet'));

    return sheet.then(function (result) {
      return result;
    }, function () {
      return fromUrl(cfg.fallbackCsv || 'data/products.csv', 'csv', 8000);
    }).then(function (result) {
      return result;
    }, function () {
      var scripted = fromScript();
      if (scripted) return scripted;
      var cached = readCache();
      if (!cached) throw new Error('none');
      list = cached;
      return { products: cached, source: 'cache' };
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
    padId: padId
  };
})();
