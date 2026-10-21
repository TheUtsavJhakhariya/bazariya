/* About, Return policy and Terms.
   The long copy is the English text from the reference images.
   It stays English when Hindi or Gujarati is chosen.
   The phone number always comes from config.json. */

var Info = (function () {
  var reason = 'broken';

  var ABOUT_AREAS = ['Adajan', 'Vesu', 'Pal', 'Piplod', 'Athwa', 'Varachha', 'Katargam', 'Udhna', 'Althan', 'City Light'];

  var REASONS = [
    { id: 'broken', label: 'It arrived broken', badge: 'YES', title: "Yes, we'll replace or refund it.", body: 'Send a photo of the item and the parcel on WhatsApp within 2 days. Free pickup in Surat.' },
    { id: 'wrong', label: 'Wrong item sent', badge: 'YES', title: "Yes, we'll swap it.", body: 'Send a photo of what you got on WhatsApp within 2 days. We bring the right one and take the wrong one back.' },
    { id: 'missing', label: 'Something is missing', badge: 'YES', title: "Yes, we'll send what's missing.", body: 'Tell us on WhatsApp within 2 days with your order number.' },
    { id: 'mind', label: 'I changed my mind', badge: 'ASK US', title: 'Ask us first.', body: "If it's unused and in its box, we'll usually take it back. Message us within 2 days." },
    { id: 'used', label: "I've used it", badge: 'NO', title: "Sorry, we can't take back used items.", body: 'If it broke during normal use within 2 days, message us anyway.' },
    { id: 'late', label: "It's been over 2 days", badge: 'NO', title: "After 2 days we can't take it back.", body: "Not sure? Ask us anyway. We'll always try to help." }
  ];

  function cfg() {
    return Config.get();
  }

  function shop() {
    return cfg().shopName || 'BAZARIYAA';
  }

  function phoneText() {
    return cfg().whatsappNumber || '';
  }

  function count() {
    return Data.products().length;
  }

  function lazyImg(src, bw) {
    var img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    if (bw) img.className = 'is-bw';
    img.addEventListener('error', function onErr() {
      img.removeEventListener('error', onErr);
      img.src = 'images/placeholder.svg';
    });
    return img;
  }

  function wa(className, label, message) {
    var node;
    if (!Config.phoneOk()) {
      node = UI.el('span', className + ' is-disabled', label);
      node.setAttribute('aria-disabled', 'true');
      return node;
    }
    node = UI.el('a', className);
    node.href = 'https://wa.me/' + Config.digits(phoneText()) + '?text=' + encodeURIComponent(message);
    node.target = '_blank';
    node.rel = 'noopener';
    node.appendChild(Icons.el('chat', 18));
    node.appendChild(document.createTextNode(' ' + label));
    return node;
  }

  function poster(lines, link) {
    var section = UI.el('section', 'info-block poster');
    var inner = UI.el('div', 'wrap');
    lines.forEach(function (line) {
      inner.appendChild(UI.el('p', 'poster-line', line));
    });
    inner.appendChild(link);
    section.appendChild(inner);
    return section;
  }

  function renderAbout(main) {
    var quote = UI.el('p', 'about-quote');
    var author = UI.el('div', 'about-author');
    var who = UI.el('div');
    var photos = UI.el('div', 'about-photos');
    var side = UI.el('div', 'about-side');
    var pack = UI.el('div', 'about-photo');
    var every = UI.el('div', 'about-every');
    var shopPhoto = UI.el('div', 'about-photo is-tall');
    var journey = UI.el('section', 'info-block');
    var deliver = UI.el('section', 'info-block');
    var card = UI.el('div', 'about-deliver');
    var pills = UI.el('div', 'about-pills');
    var areas = cfg().areas || [];
    var steps = [
      { year: '2024', title: 'A stall in the market', body: 'We started selling kitchen tools from a small stall.', dot: 'is-line' },
      { year: '2025', title: 'Orders on WhatsApp', body: 'Regulars began messaging us lists. We delivered on our scooter.', dot: 'is-line' },
      { year: '2026', title: 'Bazariyaa online', body: count() + ' items in one catalogue, still ordered the same simple way.', dot: 'is-now' },
      { year: 'NEXT', title: 'More of Surat', body: 'Faster delivery to every area of the city before we go further.', dot: 'is-next' }
    ];

    quote.appendChild(document.createTextNode('“We started Bazariyaa because buying a '));
    quote.appendChild(UI.el('em', null, '₹50 brush'));
    quote.appendChild(document.createTextNode(" shouldn't need an app, a card or a trip across Surat.”"));

    who.appendChild(UI.el('p', 'about-name', 'Your name'));
    who.appendChild(UI.el('p', 'about-role', 'Founder, Bazariyaa'));
    author.appendChild(lazyImg('https://picsum.photos/seed/bzfounder/160/160', true));
    author.appendChild(who);
    author.appendChild(UI.el('p', 'about-love', '— with love'));

    shopPhoto.appendChild(lazyImg('https://picsum.photos/seed/bzshop/900/1100', true));
    shopPhoto.appendChild(UI.el('span', 'photo-pill', 'OUR SHOP, SURAT'));
    pack.appendChild(lazyImg('https://picsum.photos/seed/bzpack/800/520', false));
    pack.appendChild(UI.el('span', 'photo-pill', 'PACKING ORDERS'));
    every.appendChild(UI.el('p', 'about-kicker', 'EVERY ORDER'));
    every.appendChild(UI.el('p', 'about-hand', 'Checked by hand '));
    every.lastChild.appendChild(UI.el('em', null, 'before it leaves.'));
    side.appendChild(pack);
    side.appendChild(every);
    photos.appendChild(shopPhoto);
    photos.appendChild(side);

    var head = UI.el('div', 'info-head');
    head.appendChild(UI.el('h2', null, 'Our journey'));
    head.appendChild(UI.el('p', 'info-kicker', 'SO FAR'));
    var list = UI.el('ol', 'journey');
    steps.forEach(function (step) {
      var item = UI.el('li', 'journey-item');
      item.appendChild(UI.el('span', 'journey-dot ' + step.dot));
      item.appendChild(UI.el('span', 'journey-year', step.year));
      var copy = UI.el('div');
      copy.appendChild(UI.el('p', 'journey-title', step.title));
      copy.appendChild(UI.el('p', 'journey-body', step.body));
      item.appendChild(copy);
      list.appendChild(item);
    });

    var left = UI.el('div');
    var heading = UI.el('h2', 'serif-heading');
    heading.appendChild(document.createTextNode('All of '));
    heading.appendChild(UI.el('em', null, 'Surat.'));
    left.appendChild(UI.el('p', 'about-kicker', 'WHERE WE DELIVER'));
    left.appendChild(heading);
    left.appendChild(UI.el('p', null, 'Only Surat for now, so we can deliver quickly and take cash at the door.'));
    ABOUT_AREAS.forEach(function (area) {
      var pill;
      if (areas.indexOf(area) === -1) return;
      pill = UI.el('button', 'area-pill', area);
      pill.type = 'button';
      pill.setAttribute('data-action', 'area');
      pill.setAttribute('data-area', area);
      pills.appendChild(pill);
    });
    card.appendChild(left);
    card.appendChild(pills);

    var letter = UI.el('section', 'info-block about-letter');
    var wrap = UI.el('div', 'wrap');
    wrap.appendChild(UI.el('p', 'info-kicker', 'A LETTER FROM THE FAMILY'));
    wrap.appendChild(quote);
    wrap.appendChild(author);
    letter.appendChild(wrap);

    var photoSection = UI.el('section', 'info-block');
    var photoWrap = UI.el('div', 'wrap');
    photoWrap.appendChild(photos);
    photoSection.appendChild(photoWrap);

    var journeyWrap = UI.el('div', 'wrap');
    journeyWrap.appendChild(head);
    journeyWrap.appendChild(list);
    journey.appendChild(journeyWrap);

    var deliverWrap = UI.el('div', 'wrap');
    deliverWrap.appendChild(card);
    deliver.appendChild(deliverWrap);

    main.className = 'info';
    main.replaceChildren(letter, photoSection, journey, deliver, poster(
      ['SAY NAMASTE'],
      wa('cta-dark', 'Chat with us · ' + phoneText(), 'Namaste ' + shop() + '!')
    ));
  }

  function reasonById(id) {
    var i;
    for (i = 0; i < REASONS.length; i += 1) {
      if (REASONS[i].id === id) return REASONS[i];
    }
    return REASONS[0];
  }

  function fillAnswer(card, item, animate) {
    var kind = item.badge === 'ASK US' ? 'ask' : item.badge.toLowerCase();
    var badge = UI.el('span', 'answer-badge is-' + kind, item.badge);
    var top = UI.el('div', 'answer-top');
    card.replaceChildren();
    top.appendChild(badge);
    top.appendChild(UI.el('span', null, 'YOUR ANSWER'));
    card.appendChild(top);
    card.appendChild(UI.el('h2', null, item.title));
    card.appendChild(UI.el('p', null, item.body));
    if (animate) {
      card.classList.remove('is-in');
      void card.offsetWidth;
      card.classList.add('is-in');
    }
  }

  function renderReturn(main) {
    var picker = UI.el('div', 'return-grid');
    var answer = UI.el('div', 'answer-card');
    var current = reasonById(reason);
    picker.setAttribute('role', 'radiogroup');
    picker.setAttribute('aria-label', 'Tap what happened');
    answer.setAttribute('aria-live', 'polite');

    REASONS.forEach(function (item) {
      var label = UI.el('label', 'return-option');
      var input = document.createElement('input');
      var check = UI.el('span', 'return-check');
      input.type = 'radio';
      input.name = 'return-case';
      input.value = item.id;
      input.checked = item.id === current.id;
      check.appendChild(Icons.el('check', 16));
      label.appendChild(input);
      label.appendChild(UI.el('span', null, item.label));
      label.appendChild(check);
      input.addEventListener('change', function () {
        reason = item.id;
        fillAnswer(answer, item, true);
      });
      picker.appendChild(label);
    });
    fillAnswer(answer, current, false);

    var hero = UI.el('section', 'info-block');
    var heroWrap = UI.el('div', 'wrap');
    var title = UI.el('h2', 'return-title');
    title.appendChild(document.createTextNode('Can I return '));
    title.appendChild(UI.el('em', null, 'this?'));
    heroWrap.appendChild(title);
    heroWrap.appendChild(UI.el('p', 'return-lead', "Tap what happened. We'll tell you straight away."));
    heroWrap.appendChild(picker);
    heroWrap.appendChild(answer);
    hero.appendChild(heroWrap);

    main.className = 'info';
    main.replaceChildren(
      hero,
      windowBlock(),
      sendBlock(),
      goodBlock(),
      chatBlock(),
      chooseBlock(),
      receiptBlock(),
      cantBlock(),
      poster(
        ['START A', 'RETURN'],
        wa('cta-dark', 'Send a photo on WhatsApp · ' + phoneText(), 'Hi ' + shop() + ', I want to start a return. Order/item no.: ')
      )
    );
  }

  function windowBlock() {
    var section = UI.el('section', 'info-block');
    var inner = UI.el('div', 'wrap');
    var head = UI.el('div', 'info-head');
    var track = UI.el('div', 'day-track');
    var cols = UI.el('div', 'day-cols');
    var days = [
      { name: 'DAY 0', text: 'Parcel arrives. Open it in front of the delivery person if you can.', hot: false },
      { name: 'DAY 1', text: 'Use it, check it. Anything wrong? Message us.', hot: false },
      { name: 'DAY 2', text: "Last day to tell us. After this we can't take it back.", hot: true }
    ];
    head.appendChild(UI.el('h2', null, 'Your 2-day window'));
    head.appendChild(UI.el('p', 'info-kicker', 'FROM DELIVERY'));
    track.appendChild(UI.el('span', 'day-dot is-dark'));
    track.appendChild(UI.el('span', 'day-bar is-hot'));
    track.appendChild(UI.el('span', 'day-dot is-white'));
    track.appendChild(UI.el('span', 'day-bar is-hot'));
    track.appendChild(UI.el('span', 'day-dot is-orange'));
    track.appendChild(UI.el('span', 'day-bar'));
    days.forEach(function (day) {
      var col = UI.el('div');
      col.appendChild(UI.el('p', 'day-name' + (day.hot ? ' is-hot' : ''), day.name));
      col.appendChild(UI.el('p', null, day.text));
      cols.appendChild(col);
    });
    inner.appendChild(head);
    inner.appendChild(track);
    inner.appendChild(cols);
    section.appendChild(inner);
    return section;
  }

  function sendBlock() {
    var section = UI.el('section', 'info-block');
    var inner = UI.el('div', 'wrap');
    var head = UI.el('div', 'info-head');
    var grid = UI.el('div', 'send-grid');
    var cards = [
      { n: '1', title: 'Photo of the item', body: 'Show the damage or the wrong item clearly.', src: 'https://picsum.photos/seed/bzitem/700/480', bw: true },
      { n: '2', title: 'Photo of the parcel', body: 'The box or bag it came in, with the label.', src: 'https://picsum.photos/seed/bzparcel/700/480', bw: false },
      { n: '3', title: 'Your order number', body: 'Or the item number, like No. 203.', src: 'https://picsum.photos/seed/bzorder/700/480', bw: false }
    ];
    var heading = UI.el('h2', 'serif-heading');
    heading.appendChild(document.createTextNode('What to '));
    heading.appendChild(UI.el('em', null, 'send us'));
    head.appendChild(heading);
    head.appendChild(UI.el('p', 'info-kicker', 'ON WHATSAPP'));
    cards.forEach(function (card) {
      var node = UI.el('article', 'send-card');
      var photo = UI.el('div', 'send-photo');
      photo.appendChild(UI.el('span', 'send-num', card.n));
      photo.appendChild(lazyImg(card.src, card.bw));
      node.appendChild(photo);
      node.appendChild(UI.el('h3', null, card.title));
      node.appendChild(UI.el('p', null, card.body));
      grid.appendChild(node);
    });
    inner.appendChild(head);
    inner.appendChild(grid);
    section.appendChild(inner);
    return section;
  }

  function goodBlock() {
    var section = UI.el('section', 'info-block');
    var inner = UI.el('div', 'wrap');
    var card = UI.el('div', 'good-card');
    var lines = [
      'We pick it up or swap it on our next delivery.',
      'Refunds are paid back in cash, the same way you paid.',
      'No forms, no account. One WhatsApp chat.'
    ];
    var left = UI.el('div');
    var title = UI.el('p', 'good-title');
    title.appendChild(document.createTextNode('Returns in Surat are '));
    title.appendChild(UI.el('em', null, 'always free.'));
    left.appendChild(UI.el('p', 'about-kicker', 'GOOD TO KNOW'));
    left.appendChild(title);
    var list = UI.el('ul', 'good-list');
    lines.forEach(function (line) {
      var item = UI.el('li');
      var mark = UI.el('span', 'return-check is-shown');
      mark.appendChild(Icons.el('check', 16));
      item.appendChild(mark);
      item.appendChild(document.createTextNode(line));
      list.appendChild(item);
    });
    card.appendChild(left);
    card.appendChild(list);
    inner.appendChild(card);
    section.appendChild(inner);
    return section;
  }

  function chatBlock() {
    var section = UI.el('section', 'info-block');
    var inner = UI.el('div', 'wrap chat-grid');
    var left = UI.el('div', 'chat-intro');
    var right = UI.el('div', 'chat-sample');
    var who = UI.el('div', 'chat-who');
    left.appendChild(UI.el('p', 'info-kicker', 'RETURN POLICY'));
    left.appendChild(UI.el('p', 'chat-anton', 'ONE'));
    left.appendChild(UI.el('p', 'chat-anton', 'CHAT.'));
    left.appendChild(UI.el('p', 'chat-anton', 'SORTED.'));
    left.appendChild(UI.el('p', null, 'Damaged, wrong or missing? Message us within 2 days of delivery. This is what that chat looks like.'));
    who.appendChild(UI.el('span', 'chat-avatar', 'b'));
    var name = UI.el('div');
    name.appendChild(UI.el('p', 'chat-name', 'Bazariyaa'));
    name.appendChild(UI.el('p', 'chat-sub', 'usually replies in an hour'));
    who.appendChild(name);
    right.appendChild(who);
    var shot = UI.el('div', 'chat-shot');
    shot.appendChild(lazyImg('https://picsum.photos/seed/bzitem/700/420', true));
    shot.appendChild(UI.el('p', null, 'Glass came cracked 😟 Order no. 203'));
    right.appendChild(shot);
    right.appendChild(UI.el('p', 'bubble is-shop', 'Sorry about that! Would you like a new one or your money back?'));
    right.appendChild(UI.el('p', 'bubble is-customer', 'New one please'));
    right.appendChild(UI.el('p', 'bubble is-shop', "Done. We'll bring it tomorrow and take the old one. No charge."));
    right.appendChild(UI.el('p', 'chat-note', 'SAMPLE CONVERSATION'));
    inner.appendChild(left);
    inner.appendChild(right);
    section.appendChild(inner);
    return section;
  }

  function chooseBlock() {
    var section = UI.el('section', 'info-block');
    var inner = UI.el('div', 'wrap');
    var head = UI.el('div', 'info-head');
    var grid = UI.el('div', 'choose-grid');
    var replace = UI.el('article', 'choose-card is-replace');
    var refund = UI.el('article', 'choose-card is-refund');
    var swap = UI.el('span', 'choose-icon');
    var cash = UI.el('span', 'choose-icon');
    head.appendChild(UI.el('h2', null, 'You choose'));
    head.appendChild(UI.el('p', 'info-kicker', 'ALWAYS FREE IN SURAT'));
    swap.appendChild(Icons.el('swap', 22));
    cash.appendChild(Icons.el('cash', 22));
    replace.appendChild(swap);
    replace.appendChild(UI.el('p', 'choose-word', 'REPLACE'));
    replace.appendChild(UI.el('p', null, 'We bring the same item, fixed or new, and collect the old one.'));
    refund.appendChild(cash);
    refund.appendChild(UI.el('p', 'choose-word', 'REFUND'));
    refund.appendChild(UI.el('p', null, 'We return the full item price to you in cash.'));
    grid.appendChild(replace);
    grid.appendChild(refund);
    inner.appendChild(head);
    inner.appendChild(grid);
    section.appendChild(inner);
    return section;
  }

  function receiptBlock() {
    var section = UI.el('section', 'info-block');
    var inner = UI.el('div', 'wrap');
    var card = UI.el('div', 'receipt');
    var rows = [
      ['Time to report a problem', '2 DAYS'],
      ['Damaged, wrong or missing', 'ALWAYS OK'],
      ['Changed your mind, unused', 'ASK US'],
      ['Pickup or swap in Surat', 'FREE'],
      ['Refund paid as', 'CASH'],
      ['Forms to fill', 'NONE']
    ];
    var title = UI.el('h2', 'serif-heading');
    title.appendChild(document.createTextNode('The '));
    title.appendChild(UI.el('em', null, 'fine print'));
    card.appendChild(UI.el('p', 'receipt-shop', shop().toUpperCase() + ' · ' + (cfg().city || 'Surat').toUpperCase()));
    card.appendChild(title);
    rows.forEach(function (row) {
      var line = UI.el('p', 'receipt-row');
      line.appendChild(UI.el('span', null, row[0]));
      line.appendChild(UI.el('span', null, row[1]));
      card.appendChild(line);
    });
    var pay = UI.el('p', 'receipt-pay');
    pay.appendChild(UI.el('span', null, 'You pay for a return'));
    pay.appendChild(UI.el('span', 'receipt-zero', '₹0'));
    card.appendChild(pay);
    card.appendChild(UI.el('p', 'receipt-date', 'LAST UPDATED 02 OCT 2026'));
    inner.appendChild(card);
    section.appendChild(inner);
    return section;
  }

  function cantBlock() {
    var section = UI.el('section', 'info-block');
    var inner = UI.el('div', 'wrap');
    inner.appendChild(UI.el('p', 'info-kicker', "WE CAN'T TAKE BACK"));
    inner.appendChild(UI.el('p', 'struck', 'Used or washed items'));
    inner.appendChild(UI.el('p', 'struck', 'Opened personal care'));
    inner.appendChild(UI.el('p', 'struck', 'Reported after 2 days'));
    inner.appendChild(UI.el('p', 'cant-note', "Not sure? Ask us anyway. We'll always try to help."));
    section.appendChild(inner);
    return section;
  }

  function renderTerms(main) {
    var sections = [
      { id: 'who', no: '01', kicker: 'WHO WE ARE', title: 'Who we are', body: 'Bazariyaa (“we”, “us”) is a family-run household goods shop based in Surat, Gujarat. These terms apply to every order placed through this website and WhatsApp.' },
      { id: 'order', no: '02', kicker: 'ORDERING', title: 'Ordering on WhatsApp', body: 'Your cart is sent to us as a WhatsApp message. An order is confirmed only after we reply to confirm items, total and delivery. We may decline an order if an item is unavailable.' },
      { id: 'prices', no: '03', kicker: 'PRICES', title: 'Prices', body: 'All prices are in Indian Rupees (₹) and include applicable taxes. Prices may change, but the price we confirm on WhatsApp is the price you pay.' },
      { id: 'delivery', no: '04', kicker: 'DELIVERY', title: 'Delivery in Surat', body: 'We currently deliver only within ' + (cfg().city || 'Surat') + ' city. Delivery is free on orders above ' + Config.money(cfg().freeDeliveryAbove) + '; below that, we tell you the delivery charge before confirming.' },
      { id: 'pay', no: '05', kicker: 'PAYMENT', title: 'Payment', body: 'We accept cash on delivery. Please check the parcel and pay the delivery person the confirmed amount. We never ask for advance payment or card details.' },
      { id: 'returns', no: '06', kicker: 'RETURNS', title: 'Returns & refunds', body: 'Damaged, wrong or missing items can be reported within 2 days of delivery. See our Return policy for full details.', link: true },
      { id: 'privacy', no: '07', kicker: 'PRIVACY', title: 'Your information', body: 'We use your name, address and phone number only to deliver your order and contact you about it. We do not sell or share your details.' },
      { id: 'contact', no: '08', kicker: 'CONTACT', title: 'Contact', body: 'For any question about these terms, message or call us on WhatsApp at ' + phoneText() + '.' }
    ];

    var hero = UI.el('section', 'info-block');
    var heroWrap = UI.el('div', 'wrap terms-hero');
    var dark = UI.el('div', 'terms-dark');
    var facts = UI.el('div', 'terms-facts');
    var contents = UI.el('div', 'terms-contents');
    var table = UI.el('div', 'terms-table');
    var rules = UI.el('p', 'terms-rules');
    rules.appendChild(document.createTextNode('The simple rules of '));
    rules.appendChild(UI.el('em', null, 'shopping with us.'));
    dark.appendChild(UI.el('p', 'terms-anton', 'TERMS'));
    dark.appendChild(UI.el('p', 'terms-updated', 'LAST UPDATED 02 OCT 2026'));
    dark.appendChild(rules);
    facts.appendChild(fact('Plain language', 'No fine print. If anything is unclear, ask us on WhatsApp.'));
    facts.appendChild(fact('8 short sections', 'About a 3-minute read.'));
    dark.appendChild(facts);
    contents.appendChild(UI.el('h2', 'serif-heading', 'Contents'));
    var labels = UI.el('p', 'terms-labels');
    labels.appendChild(UI.el('span', null, 'Section'));
    labels.appendChild(UI.el('span', null, 'No.'));
    table.appendChild(labels);
    sections.forEach(function (item) {
      var row = UI.el('a', 'terms-row');
      row.href = '#sec-' + item.id;
      row.appendChild(UI.el('span', null, item.title));
      row.appendChild(UI.el('span', null, item.no));
      table.appendChild(row);
    });
    contents.appendChild(table);
    heroWrap.appendChild(dark);
    heroWrap.appendChild(contents);
    hero.appendChild(heroWrap);

    var list = UI.el('div', 'wrap terms-list');
    sections.forEach(function (item) {
      var block = UI.el('section', 'terms-sec');
      var copy = UI.el('div');
      block.id = 'sec-' + item.id;
      block.appendChild(UI.el('p', 'terms-kicker', '(' + item.no + ') ' + item.kicker));
      copy.appendChild(UI.el('h2', null, item.title));
      if (item.link) {
        var para = UI.el('p');
        para.appendChild(document.createTextNode('Damaged, wrong or missing items can be reported within 2 days of delivery. See our '));
        var link = UI.el('a', null, 'Return policy');
        link.href = 'return-policy.html';
        para.appendChild(link);
        para.appendChild(document.createTextNode(' for full details.'));
        copy.appendChild(para);
      } else {
        copy.appendChild(UI.el('p', null, item.body));
      }
      block.appendChild(copy);
      list.appendChild(block);
    });

    main.className = 'info';
    main.replaceChildren(hero, list, shortBand(), poster(
      ['QUESTIONS?', 'ASK US'],
      wa('say-namaste', phoneText() + ' — WHATSAPP', 'Hi ' + shop() + ', I have a question about the terms.')
    ));
  }

  function fact(title, body) {
    var node = UI.el('div');
    node.appendChild(UI.el('p', 'fact-title', title));
    node.appendChild(UI.el('p', null, body));
    return node;
  }

  function shortBand() {
    var section = UI.el('section', 'band info-short');
    var inner = UI.el('div', 'wrap');
    var line = UI.el('p', 'band-statement');
    inner.appendChild(UI.el('p', 'band-kicker', '• IN SHORT'));
    line.appendChild(document.createTextNode('Order on WhatsApp, '));
    line.appendChild(UI.el('span', 'is-dim', 'we confirm the price, '));
    line.appendChild(bandIcon('pin'));
    line.appendChild(document.createTextNode(' deliver in Surat '));
    line.appendChild(UI.el('span', 'is-dim', 'and you '));
    line.appendChild(bandIcon('cash'));
    line.appendChild(document.createTextNode(' pay cash at the door.'));
    inner.appendChild(line);
    section.appendChild(inner);
    return section;
  }

  function bandIcon(name) {
    var box = UI.el('span', 'band-icon');
    box.appendChild(Icons.el(name, 18));
    return box;
  }

  function show() {
    var page = document.body.getAttribute('data-page');
    var main = document.getElementById('main');
    if (!main) return;
    if (page === 'about') renderAbout(main);
    else if (page === 'return') renderReturn(main);
    else if (page === 'terms') renderTerms(main);
  }

  return { show: show };
})();
