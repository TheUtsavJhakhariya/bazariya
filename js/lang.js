/* Language dialog. The footer switches language on its own and does not open this. */

var Language = (function () {
  var CHOICES = [
    { code: 'en', short: 'EN', name: 'englishName', latin: 'latinEn' },
    { code: 'hi', short: 'HI', name: 'hindiName', latin: 'latinHi' },
    { code: 'gu', short: 'GU', name: 'gujaratiName', latin: 'latinGu' }
  ];

  function open() {
    var dialog = UI.el('div', 'lang-dialog');
    var title = UI.el('h2', 'serif-heading');
    var closeBtn = UI.el('button', 'btn btn-outline');
    var list = UI.el('div', 'lang-list');

    dialog.id = 'lang-dialog';
    title.id = 'lang-title';
    title.appendChild(document.createTextNode(I18n.t('langTitle') + ' '));
    title.appendChild(UI.el('em', null, I18n.t('langEm')));
    closeBtn.type = 'button';
    closeBtn.appendChild(Icons.el('close', 16));
    closeBtn.appendChild(document.createTextNode(I18n.t('close')));
    closeBtn.addEventListener('click', function () { UI.close(); });

    CHOICES.forEach(function (item) {
      var card = UI.el('button', 'lang-card');
      var top = UI.el('span', 'lang-card-top');
      var body = UI.el('span', 'lang-card-body');
      var native = I18n.t(item.name);
      var latin = I18n.t(item.latin);
      var current = I18n.get() === item.code;
      card.type = 'button';
      card.setAttribute('aria-pressed', current ? 'true' : 'false');
      if (current) card.classList.add('is-on');
      top.appendChild(UI.el('span', 'lang-short', item.short));
      if (current) top.appendChild(UI.el('span', 'lang-current', I18n.t('currentMark')));
      body.appendChild(UI.el('span', 'lang-name', native));
      if (current) body.appendChild(UI.el('span', 'lang-sub', I18n.t('currentLanguage')));
      else if (latin && latin !== native) body.appendChild(UI.el('span', 'lang-sub', latin));
      card.appendChild(top);
      card.appendChild(body);
      card.addEventListener('click', function () {
        I18n.set(item.code);
        UI.close();
      });
      list.appendChild(card);
    });

    var top = UI.el('div', 'lang-top');
    top.appendChild(title);
    top.appendChild(closeBtn);
    dialog.appendChild(top);
    dialog.appendChild(list);
    dialog.appendChild(UI.el('p', 'lang-note', I18n.t('langNote')));

    UI.open({
      kind: UI.phone() ? 'sheet' : 'modal',
      node: dialog,
      labelledBy: 'lang-title',
      focus: '.lang-card.is-on'
    });
  }

  return { open: open };
})();
