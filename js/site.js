/* Site text and photos the owner can change from the admin panel.
   Saved in this browser only (localStorage). An empty save keeps the
   words already written on the page. Nothing here is sent to other phones. */

var Site = (function () {
  var KEY = 'bazariyaa-site-config';
  var fileConfig = {};

  function field(page, id, label, kind, fallback, fromConfig) {
    return {
      page: page,
      id: id,
      label: label,
      kind: kind,
      fallback: fallback,
      fromConfig: fromConfig || ''
    };
  }

  var AREAS = 'Adajan\nVesu\nPal\nPiplod\nAthwa\nVarachha\nKatargam\nUdhna\nAlthan\nCity light';
  var PROMISE = 'https://picsum.photos/seed/bzpromise/1400/800';

  var FIELDS = [
    field('shop', 'shopName', 'Shop name', 'text', 'BAZARIYAA', 'shopName'),
    field('shop', 'tagline', 'Tagline', 'text', 'Ghar ka bazaar', 'tagline'),
    field('shop', 'whatsappNumber', 'WhatsApp number', 'text', '', 'whatsappNumber'),
    field('shop', 'city', 'City', 'text', 'Surat', 'city'),
    field('shop', 'freeDeliveryAbove', 'Free delivery above (rupees)', 'text', '499', 'freeDeliveryAbove'),
    field('shop', 'currencySymbol', 'Currency symbol', 'text', '₹', 'currencySymbol'),
    field('shop', 'areas', 'Delivery areas (one per line)', 'lines', AREAS, 'areas'),
    field('shop', 'logo', 'Logo', 'image', 'images/Logo.svg'),

    field('home', 'i18n.freeFrom', 'Free delivery heading', 'text', 'Free delivery from'),
    field('home', 'i18n.freeNote', 'Free delivery note. {amount} and {city} fill in.', 'long', 'Fill your cart past {amount} and delivery in {city} is on us.'),
    field('home', 'i18n.payAtDoor', 'Pay at the door', 'text', 'PAY AT THE DOOR'),
    field('home', 'i18n.navOrder', 'Order by number heading', 'text', 'Order by number'),
    field('home', 'i18n.orderHelp', 'Order by number help', 'long', 'Saw it in our pamphlet? Type the item number.'),
    field('home', 'i18n.deliveringInCity', 'Delivering heading. Keep {city}.', 'text', 'Delivering in {city}'),
    field('home', 'i18n.onlyCity', 'Delivering note. Keep {city}.', 'long', 'Only in {city} for now, so we can deliver fast and take cash at the door.'),
    field('home', 'i18n.underToday', 'Under today heading', 'text', 'Under ₹120 today'),
    field('home', 'i18n.smallHelp', 'Under today note', 'text', 'SMALL THINGS, BIG HELP'),
    field('home', 'i18n.howTitle', 'How ordering works', 'text', 'How ordering works'),
    field('home', 'i18n.noLogin', 'How ordering note', 'text', 'NO LOGIN · NO CARD'),
    field('home', 'i18n.stepPick', 'Step 1 title', 'text', '01 PICK'),
    field('home', 'i18n.pickBody', 'Step 1 text', 'long', 'Search by name or item number. Tap Buy now or Add to cart.'),
    field('home', 'i18n.stepSend', 'Step 2 title', 'text', '02 SEND'),
    field('home', 'i18n.sendBody', 'Step 2 text', 'long', 'Your list opens in WhatsApp, already typed. Add your name, Surat address and phone. Press send.'),
    field('home', 'i18n.stepPay', 'Step 3 title', 'text', '03 PAY'),
    field('home', 'i18n.payBody', 'Step 3 text', 'long', 'We confirm the order and deliver in Surat. Pay cash when it reaches your door.'),
    field('home', 'i18n.ourPromise', 'Promise heading', 'text', 'Our promise'),
    field('home', 'i18n.packed', 'Promise 1', 'text', 'Packed by our family'),
    field('home', 'i18n.checked', 'Promise 2', 'text', 'Checked before it leaves'),
    field('home', 'i18n.replaced', 'Promise 3', 'text', 'Replaced if damaged'),
    field('home', 'i18n.replacedBody', 'Promise 3 text', 'long', 'Wrong or broken item? Send a photo on WhatsApp within 2 days of delivery. We replace it or return your money.'),
    field('home', 'i18n.orderOn', 'Poster line 1', 'text', 'ORDER ON'),
    field('home', 'i18n.whatsappWord', 'Poster line 2', 'text', 'WHATSAPP'),
    field('home', 'i18n.sayNamaste', 'Poster button', 'text', 'SAY NAMASTE'),
    field('home', 'home.promise', 'Promise photo', 'image', PROMISE),

    field('about', 'about.kicker', 'Letter label', 'text', 'A letter from the family'),
    field('about', 'about.quote', 'Letter', 'long', '“We started Bazariyaa because buying a ₹50 brush shouldn’t need an app, a card or a trip across Surat.”'),
    field('about', 'about.sign', 'Sign-off', 'text', '— with love'),
    field('about', 'about.founderName', 'Founder name', 'text', 'Bhavya Mehta'),
    field('about', 'about.founderRole', 'Founder role', 'text', 'Founder, Bazariyaa'),
    field('about', 'about.founderImg', 'Founder photo', 'image', 'images/bhavya.png'),
    field('about', 'about.shopImg', 'Shop photo', 'image', 'images/about-shop.jpg'),
    field('about', 'about.shopCap', 'Shop photo caption', 'text', 'Our shop, Surat'),
    field('about', 'about.packImg', 'Packing photo', 'image', 'images/about-pack.jpg'),
    field('about', 'about.packCap', 'Packing photo caption', 'text', 'Pack no. 001-01'),
    field('about', 'about.check', 'Checked line', 'text', 'Checked by hand before it leaves.'),
    field('about', 'about.journeyTitle', 'Journey heading', 'text', 'Our journey'),
    field('about', 'about.y1year', 'Journey 1 year', 'text', '2024'),
    field('about', 'about.y1title', 'Journey 1 title', 'text', 'A stall in the market'),
    field('about', 'about.y1body', 'Journey 1 text', 'long', 'We started selling kitchen tools from a small stall.'),
    field('about', 'about.y2year', 'Journey 2 year', 'text', '2025'),
    field('about', 'about.y2title', 'Journey 2 title', 'text', 'Orders on WhatsApp'),
    field('about', 'about.y2body', 'Journey 2 text', 'long', 'Regulars began messaging us lists. We delivered on our scooter.'),
    field('about', 'about.y3year', 'Journey 3 year', 'text', '2026'),
    field('about', 'about.y3title', 'Journey 3 title', 'text', 'Bazariyaa online'),
    field('about', 'about.y3body', 'Journey 3 text', 'long', '412 items in one catalogue, still ordered the same simple way.'),
    field('about', 'about.y4year', 'Journey 4 year', 'text', 'Next'),
    field('about', 'about.y4title', 'Journey 4 title', 'text', 'More of Surat'),
    field('about', 'about.y4body', 'Journey 4 text', 'long', 'Faster delivery to every area of the city before we go further.'),
    field('about', 'about.deliverKicker', 'Delivery label', 'text', 'More of delivery'),
    field('about', 'about.deliverTitle', 'Delivery heading', 'text', 'All of Surat.'),
    field('about', 'about.deliverBody', 'Delivery text', 'long', 'Only Surat for now, so we can deliver quickly and take care of the shop.'),
    field('about', 'about.hello', 'Chat heading', 'text', 'Say namaste'),
    field('about', 'about.chat', 'Chat button', 'text', 'Chat with us'),

    field('return', 'return.title', 'Page heading', 'text', 'Can I return this?'),
    field('return', 'return.lead', 'Page intro', 'text', 'Tap what happened. We’ll tell you straight away.'),
    field('return', 'return.broken.label', 'Case: arrived broken', 'text', 'It arrived broken'),
    field('return', 'return.broken.badge', 'Answer badge', 'text', 'YES'),
    field('return', 'return.broken.title', 'Answer title', 'text', "Yes, we'll replace or refund it."),
    field('return', 'return.broken.body', 'Answer text', 'long', 'Send a photo of the item and the parcel on WhatsApp within 2 days. Free pickup in Surat.'),
    field('return', 'return.wrong.label', 'Case: wrong item', 'text', 'Wrong item sent'),
    field('return', 'return.wrong.badge', 'Answer badge', 'text', 'YES'),
    field('return', 'return.wrong.title', 'Answer title', 'text', "Yes, we'll swap it."),
    field('return', 'return.wrong.body', 'Answer text', 'long', 'Send a photo of what you got on WhatsApp within 2 days. We bring the right one and take the wrong one back.'),
    field('return', 'return.missing.label', 'Case: missing', 'text', 'Something is missing'),
    field('return', 'return.missing.badge', 'Answer badge', 'text', 'YES'),
    field('return', 'return.missing.title', 'Answer title', 'text', "Yes, we'll send what's missing."),
    field('return', 'return.missing.body', 'Answer text', 'long', 'Tell us on WhatsApp within 2 days with your order number.'),
    field('return', 'return.mind.label', 'Case: changed mind', 'text', 'I changed my mind'),
    field('return', 'return.mind.badge', 'Answer badge', 'text', 'ASK US'),
    field('return', 'return.mind.title', 'Answer title', 'text', 'Ask us first.'),
    field('return', 'return.mind.body', 'Answer text', 'long', "If it's unused and in its box, we'll usually take it back. Message us within 2 days."),
    field('return', 'return.used.label', 'Case: used', 'text', "I've used it"),
    field('return', 'return.used.badge', 'Answer badge', 'text', 'NO'),
    field('return', 'return.used.title', 'Answer title', 'text', "Sorry, we can't take back used items."),
    field('return', 'return.used.body', 'Answer text', 'long', "If it broke during normal use within 2 days, message us anyway."),
    field('return', 'return.late.label', 'Case: too late', 'text', "It's been over 2 days"),
    field('return', 'return.late.badge', 'Answer badge', 'text', 'NO'),
    field('return', 'return.late.title', 'Answer title', 'text', "After 2 days we can't take it back."),
    field('return', 'return.late.body', 'Answer text', 'long', "Not sure? Ask us anyway. We'll always try to help."),
    field('return', 'return.daysTitle', 'Window heading', 'text', 'Your 2-day window'),
    field('return', 'return.daysKicker', 'Window label', 'text', 'From delivery'),
    field('return', 'return.day0.name', 'Day 0 name', 'text', 'Day 0'),
    field('return', 'return.day0.body', 'Day 0 text', 'long', 'Parcel arrives. Open it in front of the delivery person if you can.'),
    field('return', 'return.day1.name', 'Day 1 name', 'text', 'Day 1'),
    field('return', 'return.day1.body', 'Day 1 text', 'long', 'Use it, check it. Anything wrong? Message us.'),
    field('return', 'return.day2.name', 'Day 2 name', 'text', 'Day 2'),
    field('return', 'return.day2.body', 'Day 2 text', 'long', "Last day to tell us. After this we can't take it back."),
    field('return', 'return.sendTitle', 'What to send heading', 'text', 'What to send us'),
    field('return', 'return.sendKicker', 'What to send label', 'text', 'On WhatsApp'),
    field('return', 'return.send1.img', 'Photo 1', 'image', 'images/return-item.jpg'),
    field('return', 'return.send1.title', 'Photo 1 title', 'text', 'Photo of the item'),
    field('return', 'return.send1.body', 'Photo 1 text', 'long', 'Show the damage or the wrong item clearly.'),
    field('return', 'return.send2.img', 'Photo 2', 'image', 'images/return-parcel.jpg'),
    field('return', 'return.send2.title', 'Photo 2 title', 'text', 'Photo of the parcel'),
    field('return', 'return.send2.body', 'Photo 2 text', 'long', 'The box or bag it came in, with the label.'),
    field('return', 'return.send3.img', 'Photo 3', 'image', 'images/return-order.jpg'),
    field('return', 'return.send3.title', 'Photo 3 title', 'text', 'Your order number'),
    field('return', 'return.send3.body', 'Photo 3 text', 'long', 'Or the item number, like No. 203.'),
    field('return', 'return.goodKicker', 'Good to know label', 'text', 'Good to know'),
    field('return', 'return.goodTitle', 'Good to know heading', 'text', 'Returns in Surat are always free.'),
    field('return', 'return.good.lines', 'Good to know lines', 'lines', 'We pick it up or swap it on our next delivery.\nRefunds are paid back in cash, the same way you paid.\nNo forms, no account. One WhatsApp chat.'),
    field('return', 'return.chatKicker', 'Chat label', 'text', 'Return policy'),
    field('return', 'return.chat1', 'Chat heading 1', 'text', 'One'),
    field('return', 'return.chat2', 'Chat heading 2', 'text', 'chat.'),
    field('return', 'return.chat3', 'Chat heading 3', 'text', 'Sorted.'),
    field('return', 'return.chatLead', 'Chat intro', 'long', 'Damaged, wrong or missing? Message us within 2 days of delivery. This is what that chat looks like.'),
    field('return', 'return.chatName', 'Chat name', 'text', 'Bazariyaa'),
    field('return', 'return.chatReply', 'Chat reply time', 'text', 'usually replies in an hour'),
    field('return', 'return.chatImg', 'Chat photo', 'image', 'images/return-item.jpg'),
    field('return', 'return.chatCap', 'Chat photo caption', 'text', 'Glass came cracked. Order no. 203'),
    field('return', 'return.bubble1', 'Shop message 1', 'long', 'Sorry about that! Would you like a new one or your money back?'),
    field('return', 'return.bubble2', 'Customer message', 'text', 'New one please'),
    field('return', 'return.bubble3', 'Shop message 2', 'long', "Done. We'll bring it tomorrow and take the old one. No charge."),
    field('return', 'return.chatNote', 'Sample note', 'text', 'Sample conversation'),
    field('return', 'return.chooseTitle', 'You choose heading', 'text', 'You choose'),
    field('return', 'return.chooseKicker', 'You choose label', 'text', 'Always free in Surat'),
    field('return', 'return.replaceWord', 'Replace word', 'text', 'Replace'),
    field('return', 'return.replaceBody', 'Replace text', 'long', 'We bring the same item, fixed or new, and collect the old one.'),
    field('return', 'return.refundWord', 'Refund word', 'text', 'Refund'),
    field('return', 'return.refundBody', 'Refund text', 'long', 'We return the full item price to you in cash.'),
    field('return', 'return.receiptShop', 'Fine print shop line', 'text', 'Bazariyaa · Surat'),
    field('return', 'return.printTitle', 'Fine print heading', 'text', 'The fine print'),
    field('return', 'return.print.timeL', 'Fine print: time label', 'text', 'Time to report a problem'),
    field('return', 'return.print.timeV', 'Fine print: time value', 'text', '2 days'),
    field('return', 'return.print.damageL', 'Fine print: damaged label', 'text', 'Damaged, wrong or missing'),
    field('return', 'return.print.damageV', 'Fine print: damaged value', 'text', 'Always ok'),
    field('return', 'return.print.mindL', 'Fine print: mind label', 'text', 'Changed your mind, unused'),
    field('return', 'return.print.mindV', 'Fine print: mind value', 'text', 'Ask us'),
    field('return', 'return.print.pickupL', 'Fine print: pickup label', 'text', 'Pickup or swap in Surat'),
    field('return', 'return.print.pickupV', 'Fine print: pickup value', 'text', 'Free'),
    field('return', 'return.print.refundL', 'Fine print: refund label', 'text', 'Refund paid as'),
    field('return', 'return.print.refundV', 'Fine print: refund value', 'text', 'Cash'),
    field('return', 'return.print.formsL', 'Fine print: forms label', 'text', 'Forms to fill'),
    field('return', 'return.print.formsV', 'Fine print: forms value', 'text', 'None'),
    field('return', 'return.print.payL', 'Fine print: you pay label', 'text', 'You pay for a return'),
    field('return', 'return.print.payV', 'Fine print: you pay value', 'text', '₹0'),
    field('return', 'return.print.date', 'Fine print date', 'text', 'Last updated 02 Oct 2026'),
    field('return', 'return.cantKicker', "Can't take back label", 'text', "We can't take back"),
    field('return', 'return.cant1', "Can't take back 1", 'text', 'Used or washed items'),
    field('return', 'return.cant2', "Can't take back 2", 'text', 'Opened personal care'),
    field('return', 'return.cant3', "Can't take back 3", 'text', 'Reported after 2 days'),
    field('return', 'return.cantNote', "Can't take back note", 'long', "Not sure? Ask us anyway. We'll always try to help."),
    field('return', 'return.start', 'Start heading', 'text', 'Start a return'),
    field('return', 'return.startBtn', 'Start button', 'text', 'Send a photo on WhatsApp'),

    field('terms', 'i18n.terms', 'Page heading', 'text', 'Terms'),
    field('terms', 'terms.intro', 'Intro', 'long', 'Terms & Conditions. Please read these terms carefully before placing an order'),
    field('terms', 'terms.acceptance.short', '01 short label', 'text', 'Acceptance'),
    field('terms', 'terms.acceptance.title', '01 title', 'text', 'Acceptance of Terms'),
    field('terms', 'terms.acceptance.body', '01 text', 'long', 'By accessing and using BAZARIYAA – Ghar Ka Bazaar website and placing orders, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.'),
    field('terms', 'terms.ordering.short', '02 short label', 'text', 'Ordering'),
    field('terms', 'terms.ordering.title', '02 title', 'text', 'Ordering Process'),
    field('terms', 'terms.ordering.body', '02 lines', 'lines', 'Orders are placed through WhatsApp communication\nAll orders are subject to product availability\nWe reserve the right to refuse or cancel any order\nOrder confirmation will be sent via WhatsApp\nPrices are subject to change without prior notice'),
    field('terms', 'terms.payment.short', '03 short label', 'text', 'Payment'),
    field('terms', 'terms.payment.title', '03 title', 'text', 'Payment Terms'),
    field('terms', 'terms.payment.body', '03 lines', 'lines', 'Cash on Delivery (COD): Payment is made at the time of delivery\nFor COD orders, exact change is appreciated\nWe accept cash payments only for COD orders\nAll prices are in Indian Rupees (₹)\nPrices include applicable taxes'),
    field('terms', 'terms.delivery.short', '04 short label', 'text', 'Delivery'),
    field('terms', 'terms.delivery.title', '04 title', 'text', 'Delivery Terms'),
    field('terms', 'terms.delivery.body', '04 lines', 'lines', 'Delivery timeframes are estimates and may vary\nFree shipping is available for orders above ₹499\nDelivery charges apply for orders below ₹499\nWe deliver to the address provided during order placement\nPlease ensure someone is available to receive the order\nDelivery attempts will be made during business hours'),
    field('terms', 'terms.products.short', '05 short label', 'text', 'Products'),
    field('terms', 'terms.products.title', '05 title', 'text', 'Product Information'),
    field('terms', 'terms.products.body', '05 lines', 'lines', 'We strive to provide accurate product descriptions and images\nProduct colors may vary slightly due to display settings\nWe reserve the right to substitute products of equal or better quality\nProduct availability is subject to stock'),
    field('terms', 'terms.returns.short', '06 short label', 'text', 'Returns'),
    field('terms', 'terms.returns.title', '06 title', 'text', 'Returns & Refunds'),
    field('terms', 'terms.returns.body', '06 text', 'long', 'Please refer to our Return Policy for detailed information about returns and refunds. Returns are accepted within 7 days of delivery, subject to terms and conditions.'),
    field('terms', 'terms.liability.short', '07 short label', 'text', 'Liability'),
    field('terms', 'terms.liability.title', '07 title', 'text', 'Limitation of Liability'),
    field('terms', 'terms.liability.body', '07 text', 'long', 'BAZARIYAA shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our liability is limited to the value of the product purchased.'),
    field('terms', 'terms.privacy.short', '08 short label', 'text', 'Privacy'),
    field('terms', 'terms.privacy.title', '08 title', 'text', 'Privacy & Data'),
    field('terms', 'terms.privacy.body', '08 lines', 'lines', 'We collect information necessary to process your order\nYour contact information is used only for order processing and delivery\nWe do not share your personal information with third parties\nWhatsApp communications are kept confidential'),
    field('terms', 'terms.ip.short', '09 short label', 'text', 'Content'),
    field('terms', 'terms.ip.title', '09 title', 'text', 'Intellectual Property'),
    field('terms', 'terms.ip.body', '09 text', 'long', 'All content on this website, including text, images, logos, and product descriptions, is the property of BAZARIYAA and is protected by copyright laws. Unauthorized use is prohibited.'),
    field('terms', 'terms.changes.short', '10 short label', 'text', 'Changes'),
    field('terms', 'terms.changes.title', '10 title', 'text', 'Modifications'),
    field('terms', 'terms.changes.body', '10 text', 'long', 'We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting. Continued use of our services after changes constitutes acceptance of the modified terms.'),
    field('terms', 'terms.contact.short', '11 short label', 'text', 'Contact'),
    field('terms', 'terms.contact.title', '11 title', 'text', 'Contact Information'),
    field('terms', 'terms.contact.body', '11 text', 'long', 'For any questions or concerns regarding these Terms and Conditions, please contact us:'),
    field('terms', 'terms.updated', 'Last updated line', 'text', 'Last Updated: December 2024'),
    field('terms', 'terms.agree', 'Agreement line', 'long', 'By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.'),
    field('terms', 'i18n.ctaQuestions', 'Questions line', 'text', 'Questions?'),
    field('terms', 'i18n.ctaAskUs', 'Ask us line', 'text', 'Ask us'),
    field('terms', 'i18n.chatOnWhatsApp', 'WhatsApp button', 'text', 'Chat with us on WhatsApp')
  ];

  /* Every solid colour from the shop palette. id "color.bg" sets --color-bg. */
  [
    ['bg', 'Page background', '#EDE8E0'],
    ['surface', 'Cards', '#FBF9F5'],
    ['surface-sunken', 'Soft fill', '#E4DED4'],
    ['surface-pressed', 'Pressed fill', '#DCD5C9'],
    ['white', 'White', '#FFFFFF'],
    ['text', 'Main text', '#1E1E1C'],
    ['text-secondary', 'Secondary text', '#3A3833'],
    ['text-muted', 'Muted text', '#5E5B54'],
    ['text-faint', 'Faint text', '#807B71'],
    ['text-on-sage', 'Text on sage', '#24302A'],
    ['text-on-band', 'Text on dark', '#EDE8E0'],
    ['text-on-band-secondary', 'Text on dark, secondary', '#D9D4CB'],
    ['text-on-band-muted', 'Text on dark, muted', '#BDB8AF'],
    ['text-on-band-dim', 'Text on dark, dim', '#9B978F'],
    ['text-on-ink', 'Text on black buttons', '#FFFFFF'],
    ['primary', 'Ink', '#1E1E1C'],
    ['primary-hover', 'Ink hover', '#3A3A37'],
    ['primary-pressed', 'Ink pressed', '#262624'],
    ['band', 'Dark band', '#262624'],
    ['band-raised', 'Band raised', '#3A3A37'],
    ['accent', 'Accent', '#FF8A3D'],
    ['accent-hover', 'Accent hover', '#F07A2C'],
    ['accent-pressed', 'Accent pressed', '#D96A1C'],
    ['accent-ink', 'Accent text', '#C2560F'],
    ['accent-soft', 'Accent soft', '#FFE1CC'],
    ['accent-tint', 'Accent tint', '#FFB27A'],
    ['whatsapp', 'WhatsApp', '#FF8A3D'],
    ['sage', 'Sage', '#A9BCB1'],
    ['sage-light', 'Sage light', '#B9CDC1'],
    ['success', 'Success', '#A9BCB1'],
    ['warning', 'Warning', '#FFE1CC'],
    ['danger', 'Danger', '#B42318'],
    ['disabled-bg', 'Disabled background', '#E4DED4'],
    ['disabled-text', 'Disabled text', '#5E5B54'],
    ['border-strong', 'Strong line', '#1E1E1C'],
    ['border-input', 'Input line', '#807B71'],
    ['border-on-band', 'Line on dark', '#7A766E'],
    ['divider-on-band', 'Divider on dark', '#3A3A37'],
    ['badge-oos-bg', 'Out of stock badge', '#1E1E1C'],
    ['badge-free-bg', 'Free badge', '#FF8A3D'],
    ['badge-count-bg', 'Count badge', '#FF8A3D'],
    ['focus', 'Focus', '#1E1E1C'],
    ['focus-on-dark', 'Focus on dark', '#FF8A3D'],
    ['skeleton-base', 'Loading block', '#E4DED4'],
    ['skeleton-shimmer', 'Loading shine', '#EDE8E0']
  ].forEach(function (row) {
    FIELDS.push(field('colors', 'color.' + row[0], row[1], 'color', row[2]));
  });

  function read() {
    try {
      var parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
      return {};
    }
  }

  function raw(id) {
    var saved = read();
    var value = saved[id];
    return value == null ? '' : String(value);
  }

  /* #RGB or #RRGGBB. Anything else is ignored. */
  function safeColor(value) {
    var hex = String(value || '').trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
      hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
    }
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '';
    return '#' + hex.toUpperCase();
  }

  /* http(s), a site image path, or a photo uploaded on this device. */
  function safeImage(value) {
    var text = String(value || '').trim();
    if (!text) return '';
    if (text.indexOf('data:image/') === 0) return text;
    if (text.indexOf('images/') === 0 && text.indexOf('..') === -1) return text;
    if (/^https?:\/\//i.test(text)) return text;
    return '';
  }

  function image(id, fallback) {
    var safe = safeImage(raw(id));
    return safe || fallback;
  }

  function lines(id) {
    var value = raw(id);
    if (!value) return null;
    var parts = value.split(/[\n,]/).map(function (part) {
      return part.trim();
    }).filter(Boolean);
    return parts.length ? parts : null;
  }

  function rememberFile(data) {
    if (!data) return;
    function take(key, value) {
      if (fileConfig[key]) return;
      if (value == null || value === '') return;
      fileConfig[key] = Array.isArray(value) ? value.join('\n') : String(value);
    }
    take('shopName', data.shopName);
    take('tagline', data.tagline);
    take('whatsappNumber', data.whatsappNumber);
    take('city', data.city);
    take('currencySymbol', data.currencySymbol);
    take('freeDeliveryAbove', data.freeDeliveryAbove);
    take('areas', data.areas);
  }

  function builtIn(item) {
    if (item.fromConfig && fileConfig[item.fromConfig]) return fileConfig[item.fromConfig];
    return item.fallback;
  }

  function shown(item) {
    var saved = raw(item.id);
    if (saved) return saved;
    return builtIn(item);
  }

  /* Drop the owner's copy onto the shop settings both page systems read. */
  function patchConfig(data) {
    var amount;
    var phone;
    var digits;
    var areaList;
    if (!data) return data;
    rememberFile(data);
    if (raw('shopName')) data.shopName = raw('shopName');
    if (raw('tagline')) data.tagline = raw('tagline');
    if (raw('city')) data.city = raw('city');
    if (raw('currencySymbol')) data.currencySymbol = raw('currencySymbol');
    if (raw('freeDeliveryAbove')) {
      amount = Number(raw('freeDeliveryAbove'));
      if (isFinite(amount) && amount > 0) {
        data.freeDeliveryAbove = amount;
        data.freeShippingAbove = amount;
      }
    }
    if (raw('whatsappNumber')) {
      phone = raw('whatsappNumber').trim();
      digits = phone.replace(/\D/g, '');
      data.whatsappNumber = phone;
      data.whatsappDigits = digits;
      data.whatsappDisplay = phone;
      data.canOrder = digits.length >= 8 && digits.length <= 15;
    }
    areaList = lines('areas');
    if (areaList) data.areas = areaList;
    return data;
  }

  function save(map) {
    var next = {};
    var id;
    FIELDS.forEach(function (item) {
      var value = map[item.id] != null ? String(map[item.id]).trim() : '';
      if (!value || value === builtIn(item)) return;
      if (item.kind === 'image') {
        value = safeImage(value);
        if (!value || value === builtIn(item)) return;
      }
      if (item.kind === 'color') {
        value = safeColor(value);
        if (!value || value === safeColor(builtIn(item))) return;
      }
      next[item.id] = value;
    });
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  function listItems(el) {
    var items = [];
    Array.prototype.forEach.call(el.children, function (child) {
      if (child.tagName === 'LI') items.push(child);
    });
    return items;
  }

  function setLines(el, value) {
    var parts = String(value).split(/\n/).map(function (part) {
      return part.trim();
    }).filter(Boolean);
    var items = listItems(el);
    var i;
    if (!parts.length) return;
    if (items.length === parts.length) {
      for (i = 0; i < parts.length; i += 1) items[i].textContent = parts[i];
      return;
    }
    while (el.firstChild) el.removeChild(el.firstChild);
    parts.forEach(function (part) {
      var li = document.createElement('li');
      li.textContent = part;
      el.appendChild(li);
    });
  }

  /* Fill any element marked data-site / data-site-img / data-site-lines. */
  function applyDom(root) {
    root = root || document;
    Array.prototype.forEach.call(root.querySelectorAll('[data-site]'), function (el) {
      var value = raw(el.getAttribute('data-site'));
      if (value) el.textContent = value;
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-site-img]'), function (el) {
      var value = image(el.getAttribute('data-site-img'), '');
      if (value) el.src = value;
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-site-lines]'), function (el) {
      var value = raw(el.getAttribute('data-site-lines'));
      if (value) setLines(el, value);
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-site-badge]'), function (el) {
      var value = raw(el.getAttribute('data-site-badge'));
      if (value) el.setAttribute('data-badge', value);
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-site-title]'), function (el) {
      var value = raw(el.getAttribute('data-site-title'));
      if (value) el.setAttribute('data-title', value);
    });
    Array.prototype.forEach.call(root.querySelectorAll('[data-site-body]'), function (el) {
      var value = raw(el.getAttribute('data-site-body'));
      if (value) el.setAttribute('data-body', value);
    });
  }

  /* Paint saved colours onto the page. An empty save keeps the original. */
  function applyColors() {
    FIELDS.forEach(function (item) {
      var name;
      var value;
      if (item.kind !== 'color') return;
      name = '--' + item.id.replace('.', '-');
      value = safeColor(raw(item.id));
      if (value) document.documentElement.style.setProperty(name, value);
      else document.documentElement.style.removeProperty(name);
    });
  }

  applyDom(document);
  applyColors();

  return {
    fields: function () { return FIELDS; },
    raw: raw,
    image: image,
    lines: lines,
    shown: shown,
    builtIn: builtIn,
    patchConfig: patchConfig,
    save: save,
    clear: clear,
    applyDom: applyDom,
    applyColors: applyColors,
    safeImage: safeImage,
    safeColor: safeColor
  };
})();
