/* Line icons. One drawing per name, used as inline SVG. No icon font. */

var Icons = (function () {
  var paths = {
    cart: '<path d="M6.5 8h11l-1 11h-9l-1-11z"/><path d="M9 8V6.8a3 3 0 0 1 6 0V8"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M5 7h14"/><path d="M9 7V5h6v2"/><path d="M8 7l1 12h6l1-12"/>',
    chat: '<path d="M5 16.2V7.4A2.4 2.4 0 0 1 7.4 5h9.2A2.4 2.4 0 0 1 19 7.4v5.8a2.4 2.4 0 0 1-2.4 2.4H8z"/>',
    truck: '<path d="M3 7h11v8H3z"/><path d="M14 10h4l3 3v2h-7"/><circle cx="7" cy="17.5" r="1.4"/><circle cx="17" cy="17.5" r="1.4"/>',
    cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.4"/>',
    check: '<path d="M5 12.5l4.2 4.2L19 7.5"/>',
    language: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.8 2.5 15.2 0 18"/><path d="M12 3c-2.5 2.8-2.5 15.2 0 18"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    arrow: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    'chevron-down': '<path d="M6 9l6 6 6-6"/>',
    pin: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    box: '<path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/>',
    note: '<path d="M4 20l4.2-1.1L19 8.1 15.9 5 5.1 15.8 4 20z"/><path d="M13.8 7.1l3.1 3.1"/>',
    copy: '<rect x="8" y="8" width="11" height="12" rx="2"/><path d="M6 15.5H5.2A1.2 1.2 0 0 1 4 14.3V5.2A1.2 1.2 0 0 1 5.2 4h9.1A1.2 1.2 0 0 1 15.5 5.2V6"/>',
    offline: '<path d="M5 10a10 10 0 0 1 14 0"/><path d="M8 13.2a6 6 0 0 1 8 0"/><circle cx="12" cy="17.2" r="1" fill="currentColor" stroke="none"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><circle cx="12" cy="16.2" r="0.9" fill="currentColor" stroke="none"/>',
    swap: '<path d="M7 7h12l-3.5-3.5"/><path d="M17 17H5l3.5 3.5"/>'
  };

  function svg(name, size) {
    var px = size || 20;
    var body = paths[name] || paths.alert;
    return '<svg viewBox="0 0 24 24" width="' + px + '" height="' + px +
      '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      body + '</svg>';
  }

  function el(name, size) {
    var span = document.createElement('span');
    span.className = 'icon';
    span.innerHTML = svg(name, size);
    return span;
  }

  return { svg: svg, el: el };
})();
