/* Reads config.json. The shop number is only allowed to live there. */

var Config = (function () {
  var data = {
    shopName: 'BAZARIYAA',
    tagline: 'Ghar ka bazaar',
    whatsappNumber: '',
    freeDeliveryAbove: 499,
    currencySymbol: '₹',
    city: 'Surat',
    areas: [],
    sheetCsvUrl: '',
    fallbackCsv: 'data/products.csv',
    popularCount: 10,
    showMoreStep: 20,
    maxQtyPerItem: 99,
    noteMaxLength: 120,
    defaultLanguage: 'en',
    languages: ['en', 'hi', 'gu']
  };

  function load() {
    return fetch('config.json').then(function (res) {
      if (!res.ok) throw new Error('config');
      return res.json();
    }).then(function (json) {
      data = json;
    }).catch(function () {
      data.whatsappNumber = '';
    }).then(function () {
      if (window.Site) Site.patchConfig(data);
    });
  }

  function get() {
    return data;
  }

  function digits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function phoneOk() {
    var count = digits(data.whatsappNumber).length;
    return count >= 8 && count <= 15;
  }

  function money(amount) {
    var n = Math.round(Number(amount) || 0);
    return (data.currencySymbol || '₹') + String(n);
  }

  return {
    load: load,
    get: get,
    digits: digits,
    phoneOk: phoneOk,
    money: money
  };
})();
