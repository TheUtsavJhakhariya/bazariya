/* "Do we deliver to you?" Remembers one Surat area in this browser.
   "Other area" is not saved, so a WhatsApp order never says Area: Other area. */

var Area = (function () {
  var KEY = 'bazariyaa-area';
  var OTHER = 'other';

  function city() {
    return Config.get().city || 'Surat';
  }

  function shopName() {
    return Config.get().shopName || 'BAZARIYAA';
  }

  function read() {
    try {
      return localStorage.getItem(KEY) || '';
    } catch (err) {
      return '';
    }
  }

  function write(name) {
    try {
      localStorage.setItem(KEY, name);
    } catch (err) {
      /* The choice still shows in this dialog. */
    }
    if (window.Shell) Shell.render();
  }

  function open(preselect) {
    var areas = (Config.get().areas || []).slice();
    var selected = '';
    var dialog = UI.el('div', 'area-dialog');
    var head = UI.el('div', 'area-head');
    var title = UI.el('h2', 'serif-heading');
    var closeBtn = UI.el('button', 'btn btn-outline', I18n.t('close'));
    var result = UI.el('div', 'area-result');
    var pills = UI.el('div', 'area-choices');
    var known = read();

    dialog.id = 'area-dialog';
    title.id = 'area-title';
    title.appendChild(document.createTextNode(I18n.t('deliverPlain') + ' '));
    title.appendChild(UI.el('em', null, I18n.t('toYou')));
    closeBtn.type = 'button';
    closeBtn.addEventListener('click', function () { UI.close(); });

    head.appendChild(UI.el('p', 'area-kicker', I18n.t('deliveryKicker')));
    head.appendChild(closeBtn);
    dialog.appendChild(head);
    dialog.appendChild(title);
    dialog.appendChild(UI.el('p', 'area-sub', I18n.format('onlyInside', { city: city() })));
    dialog.appendChild(UI.el('p', 'area-tap', I18n.t('tapArea')));

    if (preselect && areas.indexOf(preselect) !== -1) {
      selected = preselect;
      write(preselect);
    } else if (areas.indexOf(known) !== -1) {
      selected = known;
    }

    function startShopping() {
      var shop;
      UI.close();
      shop = document.getElementById('shop');
      if (shop) {
        shop.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
        return;
      }
      location.href = 'index.html#shop';
    }

    function message(text) {
      if (window.WhatsApp) WhatsApp.ask(text);
    }

    function paint() {
      var cfg = Config.get();
      result.replaceChildren();
      result.hidden = !selected;
      Array.prototype.forEach.call(pills.children, function (pill) {
        var on = pill.getAttribute('data-area') === selected;
        pill.classList.toggle('is-on', on);
        pill.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (!selected) return;
      if (selected === OTHER) {
        var warn = UI.el('div', 'area-yes');
        var ask = UI.el('button', 'btn btn-accent', I18n.t('messageUs'));
        ask.type = 'button';
        ask.disabled = !Config.phoneOk();
        ask.addEventListener('click', function () {
          message(I18n.format('deliverAsk', { shop: shopName() }));
        });
        warn.appendChild(UI.el('p', null, I18n.t('mayNot') + ' ' + I18n.t('mayNotRest')));
        warn.appendChild(ask);
        result.appendChild(warn);
        return;
      }
      var yes = UI.el('div', 'area-yes');
      var line = UI.el('p');
      var shopBtn = UI.el('button', 'btn btn-accent', I18n.t('startShopping'));
      shopBtn.type = 'button';
      shopBtn.addEventListener('click', startShopping);
      line.appendChild(Icons.el('check', 22));
      line.appendChild(document.createTextNode(' ' + I18n.format('yesDeliver', { area: selected }) + ' '));
      line.appendChild(document.createTextNode(I18n.format('yesDeliverRest', {
        amount: Config.money(cfg.freeDeliveryAbove)
      })));
      yes.appendChild(line);
      yes.appendChild(shopBtn);
      result.appendChild(yes);
    }

    function addPill(label, value) {
      var pill = UI.el('button', 'area-choice', label);
      pill.type = 'button';
      pill.setAttribute('data-area', value);
      pill.addEventListener('click', function () {
        selected = value;
        if (value !== OTHER) write(value);
        paint();
      });
      pills.appendChild(pill);
    }

    areas.forEach(function (name) { addPill(name, name); });
    addPill(I18n.t('otherArea'), OTHER);
    dialog.appendChild(pills);
    dialog.appendChild(result);

    var foot = UI.el('p', 'area-foot');
    var outside = UI.el('button', 'area-link', I18n.t('messageUs'));
    outside.type = 'button';
    outside.disabled = !Config.phoneOk();
    outside.addEventListener('click', function () {
      message(I18n.format('outsideAsk', { shop: shopName(), city: city() }));
    });
    foot.appendChild(document.createTextNode(I18n.format('outsideBefore', { city: city() }) + ' '));
    foot.appendChild(outside);
    foot.appendChild(document.createTextNode(' ' + I18n.t('outsideAfter')));
    dialog.appendChild(foot);

    UI.open({
      kind: UI.phone() ? 'sheet' : 'modal',
      node: dialog,
      labelledBy: 'area-title',
      focus: '.area-choice'
    });
    paint();
  }

  return { open: open };
})();
