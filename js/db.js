/* Talks to Supabase with plain fetch. No library.
   The shop reads products with the public key. The admin signs in with email and
   password, and only that signed-in account may change products (see supabase/schema.sql).
   Set supabaseUrl and supabaseKey in config.json. When they are empty, the site
   keeps using the CSV file like before. */

var Db = (function () {
  var SESSION_KEY = 'bazariyaa-db-session';
  var BUCKET = 'product-images';
  var PAGE = 1000;

  function cfg() {
    var c = (window.Config && Config.get()) || {};
    return {
      url: String(c.supabaseUrl || '').replace(/\/+$/, ''),
      key: String(c.supabaseKey || '')
    };
  }

  function enabled() {
    var c = cfg();
    return !!(c.url && c.key);
  }

  /* ---------- session ---------- */

  function readSession() {
    try {
      var s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      return s && s.access_token ? s : null;
    } catch (err) {
      return null;
    }
  }

  function writeSession(data) {
    var s = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (Number(data.expires_in) || 3600) * 1000,
      email: data.user && data.user.email ? data.user.email : ''
    };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (err) { /* stays in memory only */ }
    return s;
  }

  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch (err) { /* nothing to clear */ }
  }

  function hasSession() {
    return !!readSession();
  }

  function authCall(grant, body) {
    var c = cfg();
    return fetch(c.url + '/auth/v1/token?grant_type=' + grant, {
      method: 'POST',
      headers: { apikey: c.key, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().then(function (json) {
        if (!res.ok) {
          var err = new Error(json.error_description || json.msg || json.message || 'auth');
          err.status = res.status;
          throw err;
        }
        return writeSession(json);
      });
    });
  }

  function signIn(email, password) {
    return authCall('password', { email: email, password: password });
  }

  function signOut() {
    var s = readSession();
    var c = cfg();
    clearSession();
    if (!s || !enabled()) return Promise.resolve();
    return fetch(c.url + '/auth/v1/logout', {
      method: 'POST',
      headers: { apikey: c.key, Authorization: 'Bearer ' + s.access_token }
    }).catch(function () { /* signed out locally anyway */ });
  }

  /* A fresh token for writes. Refreshes when it has less than a minute left. */
  function token() {
    var s = readSession();
    if (!s) return Promise.reject(new Error('signed-out'));
    if (s.expires_at - Date.now() > 60000) return Promise.resolve(s.access_token);
    return authCall('refresh_token', { refresh_token: s.refresh_token }).then(function (fresh) {
      return fresh.access_token;
    }, function (err) {
      clearSession();
      throw err;
    });
  }

  /* ---------- table calls ---------- */

  function rest(path, opts) {
    var c = cfg();
    var o = opts || {};
    var headers = { apikey: c.key, 'Content-Type': 'application/json' };
    var auth = o.auth ? token() : Promise.resolve('');
    Object.keys(o.headers || {}).forEach(function (k) { headers[k] = o.headers[k]; });
    return auth.then(function (t) {
      if (t) headers.Authorization = 'Bearer ' + t;
      /* Never wait forever: a stuck call gives up so the page can fall back. */
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, o.timeout || 20000) : null;
      return fetch(c.url + '/rest/v1/' + path, {
        method: o.method || 'GET',
        headers: headers,
        body: o.body == null ? undefined : JSON.stringify(o.body),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        if (timer) clearTimeout(timer);
        return res;
      }, function (err) {
        if (timer) clearTimeout(timer);
        throw err;
      });
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (text) {
          var err = new Error('db ' + res.status + ' ' + text);
          err.status = res.status;
          throw err;
        });
      }
      if (res.status === 204) return null;
      return res.text().then(function (text) { return text ? JSON.parse(text) : null; });
    });
  }

  /* Every product, 1000 at a time (Supabase sends at most 1000 per call). */
  function allProducts(timeoutMs) {
    var out = [];
    var started = Date.now();
    function pageFrom(offset) {
      return rest('products?select=*&order=position.asc.nullslast,id.asc&limit=' + PAGE + '&offset=' + offset, { timeout: 10000 })
        .then(function (rows) {
          out = out.concat(rows || []);
          if (rows && rows.length === PAGE && Date.now() - started < (timeoutMs || 15000)) {
            return pageFrom(offset + PAGE);
          }
          return out;
        });
    }
    return pageFrom(0);
  }

  function upsertProducts(rows) {
    var chunks = [];
    var i;
    for (i = 0; i < rows.length; i += 500) chunks.push(rows.slice(i, i + 500));
    return chunks.reduce(function (p, chunk) {
      return p.then(function () {
        return rest('products?on_conflict=id', {
          method: 'POST',
          auth: true,
          body: chunk,
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }
        });
      });
    }, Promise.resolve());
  }

  /* Used when the item number itself changed. */
  function updateProduct(oldId, row) {
    return rest('products?id=eq.' + encodeURIComponent(oldId), {
      method: 'PATCH',
      auth: true,
      body: row,
      headers: { Prefer: 'return=minimal' }
    });
  }

  function deleteProducts(ids) {
    if (!ids.length) return Promise.resolve();
    var list = ids.map(function (id) {
      return '"' + String(id).replace(/"/g, '') + '"';
    }).join(',');
    return rest('products?id=in.(' + encodeURIComponent(list) + ')', {
      method: 'DELETE',
      auth: true,
      headers: { Prefer: 'return=minimal' }
    });
  }

  /* One row (id 1) holds every site setting: WhatsApp number, areas, texts, colours, photos. */
  function saveSettings(data) {
    return rest('site_settings?on_conflict=id', {
      method: 'POST',
      auth: true,
      body: [{ id: 1, data: data || {} }],
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }
    });
  }

  /* ---------- photos ---------- */

  function dataUrlToBlob(dataUrl) {
    return fetch(dataUrl).then(function (res) { return res.blob(); });
  }

  /* Uploads a photo from the owner's device and returns its public web address. */
  function uploadImage(dataUrl, productId) {
    var c = cfg();
    var safeId = String(productId || 'item').replace(/[^a-zA-Z0-9_-]/g, '');
    var path = safeId + '-' + Date.now() + '-' + Math.floor(Math.random() * 1e6) + '.jpg';
    return Promise.all([token(), dataUrlToBlob(dataUrl)]).then(function (parts) {
      return fetch(c.url + '/storage/v1/object/' + BUCKET + '/' + path, {
        method: 'POST',
        headers: {
          apikey: c.key,
          Authorization: 'Bearer ' + parts[0],
          'Content-Type': parts[1].type || 'image/jpeg',
          'x-upsert': 'true'
        },
        body: parts[1]
      });
    }).then(function (res) {
      if (!res.ok) throw new Error('upload ' + res.status);
      return c.url + '/storage/v1/object/public/' + BUCKET + '/' + path;
    });
  }

  return {
    enabled: enabled,
    signIn: signIn,
    signOut: signOut,
    hasSession: hasSession,
    allProducts: allProducts,
    upsertProducts: upsertProducts,
    updateProduct: updateProduct,
    deleteProducts: deleteProducts,
    saveSettings: saveSettings,
    uploadImage: uploadImage
  };
})();
