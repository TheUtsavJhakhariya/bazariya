/* The cart stores only id, quantity and note.
   Names and prices always come from the current catalogue. */

var Cart = (function () {
  var KEY = 'bazariyaa-cart';

  function read() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(saved)) return [];
      return saved.filter(function (item) {
        return item && item.id != null && Number(item.qty) > 0;
      }).map(function (item) {
        var max = (Config.get() && Config.get().maxQtyPerItem) || 99;
        var noteMax = (Config.get() && Config.get().noteMaxLength) || 120;
        return {
          id: String(item.id),
          qty: Math.min(max, Math.max(1, Math.round(Number(item.qty) || 1))),
          note: String(item.note || '').slice(0, noteMax)
        };
      });
    } catch (err) {
      return [];
    }
  }

  function save(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (err) {
      /* If storage fails the cart still updates on this page. */
    }
  }

  /* Returns how many were actually added. Adds on top of any quantity already there. */
  function add(id, qty) {
    var product = Data.byId(id);
    if (!product || !product.inStock) return 0;
    var max = Config.get().maxQtyPerItem || 99;
    var items = read();
    var found = null;
    items.forEach(function (item) {
      if (item.id === String(id)) found = item;
    });
    var adding = Math.max(1, Math.round(Number(qty) || 1));
    var before = found ? found.qty : 0;
    if (found) {
      found.qty = Math.min(max, found.qty + adding);
    } else {
      items.push({ id: String(product.id), qty: Math.min(max, adding), note: '' });
      found = items[items.length - 1];
    }
    save(items);
    return found.qty - before;
  }

  function setQty(id, qty) {
    var max = Config.get().maxQtyPerItem || 99;
    var next = Math.min(max, Math.round(Number(qty) || 0));
    if (next < 1) return false;
    var items = read();
    var i;
    for (i = 0; i < items.length; i += 1) {
      if (items[i].id === String(id)) {
        items[i].qty = next;
        save(items);
        return true;
      }
    }
    return false;
  }

  function remove(id) {
    var key = String(id);
    save(read().filter(function (item) { return item.id !== key; }));
  }

  function setNote(id, note) {
    var max = Config.get().noteMaxLength || 120;
    var text = String(note || '').slice(0, max);
    var items = read();
    var i;
    for (i = 0; i < items.length; i += 1) {
      if (items[i].id === String(id)) {
        items[i].note = text;
        save(items);
        return;
      }
    }
  }

  function clear() {
    save([]);
  }

  function snapshot() {
    return JSON.stringify(read());
  }

  function restore(json) {
    try {
      var items = JSON.parse(json);
      if (Array.isArray(items)) save(items);
    } catch (err) {
      /* A bad snapshot is ignored. The cart stays as it is. */
    }
  }

  /* Drop lines the shop no longer sells, or that are out of stock.
     Returns how many lines were removed. */
  function prune(products) {
    var stocked = {};
    products.forEach(function (product) {
      if (product.inStock) stocked[String(product.id)] = true;
    });
    var prev = read();
    var next = prev.filter(function (item) { return stocked[item.id]; });
    if (next.length !== prev.length) save(next);
    return prev.length - next.length;
  }

  function lines(products) {
    var byId = {};
    products.forEach(function (product) { byId[String(product.id)] = product; });
    var rows = [];
    read().forEach(function (item) {
      var product = byId[item.id];
      if (!product || !product.inStock) return;
      rows.push({
        id: item.id,
        qty: item.qty,
        note: item.note,
        price: product.price,
        name: product.name
      });
    });
    return rows;
  }

  function count(products) {
    var total = 0;
    lines(products).forEach(function (line) { total += line.qty; });
    return total;
  }

  return {
    read: read,
    add: add,
    setQty: setQty,
    remove: remove,
    setNote: setNote,
    clear: clear,
    snapshot: snapshot,
    restore: restore,
    prune: prune,
    lines: lines,
    count: count
  };
})();
