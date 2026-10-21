/*
 * i18n.js — all words shown on screen live here.
 *
 * In HTML:  <span data-i18n="cashOnDelivery">…</span>
 *           <input data-i18n-attr="placeholder:searchPlaceholder">
 * In JS:    BZ.i18n.t("productsFound", { count: 48 })  ->  "48 products found"
 *
 * Languages: English (en), Hindi (hi), Gujarati (gu).
 * The Hindi and Gujarati strings are MACHINE-DRAFTED and NEED NATIVE REVIEW.
 * Numbers and prices always stay in Western digits with ₹.
 * Every language must have the same keys; a missing key falls back to English.
 */
(function () {
  "use strict";
  var BZ = (window.BZ = window.BZ || {});

  var STRINGS = {
    en: {
      openedAsFile: "You opened this page as a file, so products can't load. Double-click \"Start BAZARIYAA.bat\" in the project folder instead.",
      skipToContent: "Skip to products",
      bannerNoNumber: "Shop number is not set. Orders can't be sent.",
      cashOnDelivery: "Cash on delivery",
      freeDeliveryAbove: "Free delivery above {amount}",
      changeLanguage: "Change language",
      openCart: "Open cart",
      cartCount: "{count} items in cart",
      searchLabel: "Search products",
      searchPlaceholder: "Name or item no. 154",
      clear: "Clear",
      showResults: "Show results",
      statementA: "We have",
      statementB: "{count} home essentials,",
      statementC: "free delivery above {amount}",
      statementD: "and",
      statementE: "cash on delivery.",
      allItemsA: "All",
      allItemsB: "items",
      categories: "Categories",
      all: "All",
      showingXofY: "Showing {shown} of {total}",
      productsFound: "{count} products found",
      oneProductFound: "1 product found",
      showMore: "Show {count} more",
      itemNo: "No. {id}",
      buyNow: "Buy now",
      addToCart: "Add to cart",
      outOfStock: "Out of stock",
      loading: "Loading items…",
      noMatchTitle: "No match for “{query}”",
      noMatchInCategory: "No match for “{query}” in {category}",
      noMatchText: "Check the spelling, or try the item number.",
      clearSearch: "Clear search",
      showAllCategories: "Search all categories",
      askOnWhatsApp: "Ask us on WhatsApp",
      emptyCategory: "Nothing here yet.",
      loadFailedTitle: "Couldn't load items",
      loadFailedText: "Check your internet and try again.",
      retry: "Retry",
      allProducts: "All products",
      aboutUs: "About us",
      returnPolicy: "Return policy",
      terms: "Terms",

      // Info pages
      skipToMain: "Skip to main content",
      home: "Home",
      contents: "Contents",
      returnsTitle: "Returns",
      termsLong: "Terms & conditions",
      numberComingSoon: "Our phone number will be added here soon.",
      ctaQuestions: "Questions?",
      ctaAskUs: "Ask us",
      chatOnWhatsApp: "Chat with us on WhatsApp",

      // Shared
      whatsappNumber: "WhatsApp {number}",
      callNumber: "Call {number}",
      close: "Close",
      undo: "Undo",
      remove: "Remove",
      decreaseQty: "One less {name}",
      increaseQty: "One more {name}",
      quantityIs: "Quantity {qty}",

      // Quantity popup
      quantity: "Quantity",
      howMany: "How many?",
      each: "each",
      totalQtyTimes: "Total · {qty} × {price}",
      keepShoppingSendLater: "Keep shopping, send later",
      orderNowWhatsApp: "Order now on WhatsApp",
      onlyThisItem: "Only this item",
      itemAdded: "{name} added",
      qtyTimesPrice: "{qty} × {price}",

      // Cart
      openCartCount: "Open cart, {count} items",
      yourCartA: "Your",
      yourCartB: "cart",
      addMoreA: "Add",
      addMoreB: "more for free delivery",
      youGetFreeDelivery: "You get free delivery",
      freeDeliveryProgress: "Progress to free delivery",
      addNote: "Add note",
      noteLabel: "Add a note (optional)",
      notePlaceholder: "e.g. blue colour please",
      removeItem: "Remove {name}",
      totalItems: "Total · {count} items",
      totalOneItem: "Total · 1 item",
      deliveryConfirmedPayCash: "Delivery charge confirmed on WhatsApp. Pay cash at your door.",
      freeDeliveryPayCash: "Free delivery. Pay cash at your door.",
      sendOrderWhatsApp: "Send order on WhatsApp",
      cartEmptyA: "Your cart is",
      cartEmptyB: "empty",
      cartEmptyText: "Pick a few things and send the list to us on WhatsApp.",
      startShopping: "Start shopping",
      itemsNoLongerAvailable: "Some items in your cart are no longer available and were removed.",

      // Remove item
      removeThisA: "Remove this",
      removeThisB: "from your cart?",
      noteRemovedToo: "Your note “{note}” will be removed too.",
      keepIt: "Keep it",
      yesRemove: "Yes, remove",

      // Ordering
      openingWhatsApp: "Opening WhatsApp…",
      orderAlreadyTyped: "Your order is already typed in.",
      stepWriteDetails: "Below the list, write your name, address and phone.",
      stepPressSend: "Press Send in WhatsApp.",
      stepWeReply: "We reply to confirm. Pay cash when it arrives.",
      didntOpen: "Didn't open?",
      copyOrderText: "Copy order text",
      tryAgain: "Try again",
      backToShop: "Back to shop",
      backToShopCartSaved: "Back to shop · your cart is saved",
      orderCopied: "Order text copied",
      pasteInChat: "Paste it in a chat with {number}.",
      openWhatsApp: "Open WhatsApp",
      copyFailed: "Couldn't copy. Please try again.",
      longOrderTitle: "Your order is long",
      longOrderText: "WhatsApp can't take it in one message, so it is split into {parts} parts. Tap each button in turn and press Send in WhatsApp each time.",
      sendPart: "Send part {part} of {parts}",
      partSentAgain: "Part {part} of {parts} opened · tap to open again",
      sentAllParts: "I've sent all parts",
      welcomeBack: "Welcome back",
      didYouPressA: "Did you press",
      didYouPressB: "Send",
      didYouPressC: "in WhatsApp?",
      itemsInOrder: "{count} items in your order",
      oneItemInOrder: "1 item in your order",
      ifYesClear: "If yes, we'll clear your cart. We'll reply on WhatsApp to confirm your order.",
      yesSentClearCart: "Yes, I sent it · clear cart",
      notYetKeepCart: "Not yet · keep my cart",
      thanksOrderSent: "Thank you! We'll reply on WhatsApp to confirm.",
      // Language picker
      languageTitle: "Language",
      current: "Current",
      currentLanguage: "Current language",
      languageNote: "Prices stay the same in every language. Your WhatsApp order always uses the English item name, so the shop can match it.",

      // Category names (the Sheet keeps the English names; these are only for display)
      cat_Kitchen: "Kitchen",
      "cat_Cleaning": "Cleaning",
      "cat_Bathroom & Personal Care": "Bathroom & Personal Care",
      cat_Car: "Car",
      "cat_Lights & Electronics": "Lights & Electronics",
      "cat_Kids & Toys": "Kids & Toys",
      "cat_Bags & Storage": "Bags & Storage",
      "cat_Home & Wall Decor": "Home & Wall Decor",
      "cat_Umbrellas & Rain": "Umbrellas & Rain",
      "cat_Health & Massagers": "Health & Massagers",
    },

    /* ================================================================
       HINDI — MACHINE-DRAFTED, NEEDS NATIVE REVIEW.
       Please ask a fluent Hindi speaker to check every line before launch.
       ================================================================ */
    hi: {
      openedAsFile: "यह पेज फ़ाइल की तरह खोला गया है, इसलिए सामान लोड नहीं हो सकता। प्रोजेक्ट फ़ोल्डर में \"Start BAZARIYAA.bat\" पर डबल-क्लिक करें।",
      skipToContent: "सामान पर जाएँ",
      bannerNoNumber: "दुकान का नंबर सेट नहीं है। ऑर्डर नहीं भेजे जा सकते।",
      cashOnDelivery: "कैश ऑन डिलीवरी",
      freeDeliveryAbove: "{amount} से ऊपर मुफ़्त डिलीवरी",
      changeLanguage: "भाषा बदलें",
      openCart: "कार्ट खोलें",
      cartCount: "कार्ट में {count} सामान",
      searchLabel: "सामान खोजें",
      searchPlaceholder: "नाम या आइटम नंबर 154",
      clear: "मिटाएँ",
      showResults: "नतीजे दिखाएँ",
      statementA: "हमारे पास",
      statementB: "{count} घरेलू ज़रूरी सामान हैं,",
      statementC: "{amount} से ऊपर मुफ़्त डिलीवरी",
      statementD: "और",
      statementE: "कैश ऑन डिलीवरी।",
      allItemsA: "सारा",
      allItemsB: "सामान",
      categories: "श्रेणियाँ",
      all: "सभी",
      showingXofY: "{total} में से {shown} दिखाए गए",
      productsFound: "{count} सामान मिले",
      oneProductFound: "1 सामान मिला",
      showMore: "{count} और दिखाएँ",
      itemNo: "नं. {id}",
      buyNow: "अभी खरीदें",
      addToCart: "कार्ट में डालें",
      outOfStock: "स्टॉक में नहीं",
      loading: "सामान लोड हो रहा है…",
      noMatchTitle: "“{query}” से कुछ नहीं मिला",
      noMatchInCategory: "{category} में “{query}” से कुछ नहीं मिला",
      noMatchText: "स्पेलिंग जाँचें, या आइटम नंबर डालकर देखें।",
      clearSearch: "खोज मिटाएँ",
      showAllCategories: "सभी श्रेणियों में खोजें",
      askOnWhatsApp: "WhatsApp पर पूछें",
      emptyCategory: "यहाँ अभी कुछ नहीं है।",
      loadFailedTitle: "सामान लोड नहीं हो सका",
      loadFailedText: "अपना इंटरनेट जाँचें और फिर से कोशिश करें।",
      retry: "फिर से कोशिश करें",
      allProducts: "सारा सामान",
      aboutUs: "हमारे बारे में",
      returnPolicy: "वापसी नीति",
      terms: "शर्तें",
      skipToMain: "मुख्य सामग्री पर जाएँ",
      home: "होम",
      contents: "विषय-सूची",
      returnsTitle: "वापसी",
      termsLong: "नियम और शर्तें",
      numberComingSoon: "हमारा फ़ोन नंबर जल्द ही यहाँ जोड़ा जाएगा।",
      ctaQuestions: "कोई सवाल?",
      ctaAskUs: "हमसे पूछें",
      chatOnWhatsApp: "WhatsApp पर बात करें",
      whatsappNumber: "WhatsApp {number}",
      callNumber: "कॉल करें {number}",
      close: "बंद करें",
      undo: "वापस लें",
      remove: "हटाएँ",
      decreaseQty: "{name} एक कम करें",
      increaseQty: "{name} एक और जोड़ें",
      quantityIs: "मात्रा {qty}",
      quantity: "मात्रा",
      howMany: "कितने चाहिए?",
      each: "प्रति नग",
      totalQtyTimes: "कुल · {qty} × {price}",
      keepShoppingSendLater: "खरीदारी जारी रखें, बाद में भेजें",
      orderNowWhatsApp: "अभी WhatsApp पर ऑर्डर करें",
      onlyThisItem: "सिर्फ़ यह सामान",
      itemAdded: "{name} जोड़ा गया",
      qtyTimesPrice: "{qty} × {price}",
      openCartCount: "कार्ट खोलें, {count} सामान",
      yourCartA: "आपका",
      yourCartB: "कार्ट",
      addMoreA: "मुफ़्त डिलीवरी के लिए",
      addMoreB: "का सामान और जोड़ें",
      youGetFreeDelivery: "आपको मुफ़्त डिलीवरी मिलेगी",
      freeDeliveryProgress: "मुफ़्त डिलीवरी तक की प्रगति",
      addNote: "नोट जोड़ें",
      noteLabel: "नोट जोड़ें (ज़रूरी नहीं)",
      notePlaceholder: "जैसे: नीला रंग चाहिए",
      removeItem: "{name} हटाएँ",
      totalItems: "कुल · {count} सामान",
      totalOneItem: "कुल · 1 सामान",
      deliveryConfirmedPayCash: "डिलीवरी चार्ज WhatsApp पर बताया जाएगा। सामान मिलने पर नकद दें।",
      freeDeliveryPayCash: "मुफ़्त डिलीवरी। सामान मिलने पर नकद दें।",
      sendOrderWhatsApp: "WhatsApp पर ऑर्डर भेजें",
      cartEmptyA: "आपका कार्ट",
      cartEmptyB: "खाली है",
      cartEmptyText: "कुछ सामान चुनें और लिस्ट हमें WhatsApp पर भेजें।",
      startShopping: "खरीदारी शुरू करें",
      itemsNoLongerAvailable: "आपके कार्ट के कुछ सामान अब उपलब्ध नहीं हैं, इसलिए हटा दिए गए।",
      removeThisA: "इसे कार्ट से",
      removeThisB: "हटाएँ?",
      noteRemovedToo: "आपका नोट “{note}” भी हट जाएगा।",
      keepIt: "रहने दें",
      yesRemove: "हाँ, हटाएँ",
      openingWhatsApp: "WhatsApp खुल रहा है…",
      orderAlreadyTyped: "आपका ऑर्डर पहले से लिखा हुआ है।",
      stepWriteDetails: "लिस्ट के नीचे अपना नाम, पता और फ़ोन नंबर लिखें।",
      stepPressSend: "WhatsApp में Send दबाएँ।",
      stepWeReply: "हम जवाब देकर पक्का करेंगे। सामान आने पर नकद दें।",
      didntOpen: "नहीं खुला?",
      copyOrderText: "ऑर्डर कॉपी करें",
      tryAgain: "फिर से कोशिश करें",
      backToShop: "दुकान पर वापस जाएँ",
      backToShopCartSaved: "दुकान पर वापस जाएँ · आपका कार्ट सेव है",
      orderCopied: "ऑर्डर कॉपी हो गया",
      pasteInChat: "इसे {number} वाली चैट में पेस्ट करें।",
      openWhatsApp: "WhatsApp खोलें",
      copyFailed: "कॉपी नहीं हो सका। फिर से कोशिश करें।",
      longOrderTitle: "आपका ऑर्डर लंबा है",
      longOrderText: "WhatsApp इसे एक मैसेज में नहीं ले सकता, इसलिए इसे {parts} हिस्सों में बाँटा गया है। हर बटन बारी-बारी से दबाएँ और हर बार WhatsApp में Send दबाएँ।",
      sendPart: "हिस्सा {part} / {parts} भेजें",
      partSentAgain: "हिस्सा {part} / {parts} खुल गया · फिर खोलने के लिए दबाएँ",
      sentAllParts: "मैंने सारे हिस्से भेज दिए",
      welcomeBack: "फिर से स्वागत है",
      didYouPressA: "क्या आपने WhatsApp में",
      didYouPressB: "Send",
      didYouPressC: "दबाया?",
      itemsInOrder: "आपके ऑर्डर में {count} सामान",
      oneItemInOrder: "आपके ऑर्डर में 1 सामान",
      ifYesClear: "अगर हाँ, तो हम आपका कार्ट खाली कर देंगे। ऑर्डर पक्का करने के लिए हम WhatsApp पर जवाब देंगे।",
      yesSentClearCart: "हाँ, भेज दिया · कार्ट खाली करें",
      notYetKeepCart: "अभी नहीं · कार्ट रहने दें",
      thanksOrderSent: "धन्यवाद! हम WhatsApp पर जवाब देकर पक्का करेंगे।",
      languageTitle: "भाषा",
      current: "चुनी हुई",
      currentLanguage: "अभी की भाषा",
      languageNote: "हर भाषा में दाम एक जैसे रहते हैं। WhatsApp ऑर्डर में सामान का नाम हमेशा अंग्रेज़ी में जाता है, ताकि दुकान उसे पहचान सके।",
      cat_Kitchen: "रसोई",
      "cat_Cleaning": "सफ़ाई",
      "cat_Bathroom & Personal Care": "बाथरूम और पर्सनल केयर",
      cat_Car: "कार",
      "cat_Lights & Electronics": "लाइट और इलेक्ट्रॉनिक्स",
      "cat_Kids & Toys": "बच्चे और खिलौने",
      "cat_Bags & Storage": "बैग और स्टोरेज",
      "cat_Home & Wall Decor": "घर और दीवार की सजावट",
      "cat_Umbrellas & Rain": "छाते और बारिश",
      "cat_Health & Massagers": "सेहत और मसाजर",
    },

    /* ================================================================
       GUJARATI — MACHINE-DRAFTED, NEEDS NATIVE REVIEW.
       Please ask a fluent Gujarati speaker to check every line before launch.
       ================================================================ */
    gu: {
      openedAsFile: "આ પેજ ફાઇલ તરીકે ખોલ્યું છે, એટલે વસ્તુઓ લોડ થઈ શકતી નથી. પ્રોજેક્ટ ફોલ્ડરમાં \"Start BAZARIYAA.bat\" પર ડબલ-ક્લિક કરો.",
      skipToContent: "સામાન પર જાઓ",
      bannerNoNumber: "દુકાનનો નંબર સેટ નથી. ઓર્ડર મોકલી શકાતા નથી.",
      cashOnDelivery: "કેશ ઓન ડિલિવરી",
      freeDeliveryAbove: "{amount}થી વધુ પર મફત ડિલિવરી",
      changeLanguage: "ભાષા બદલો",
      openCart: "કાર્ટ ખોલો",
      cartCount: "કાર્ટમાં {count} વસ્તુ",
      searchLabel: "સામાન શોધો",
      searchPlaceholder: "નામ અથવા આઇટમ નંબર 154",
      clear: "ભૂંસો",
      showResults: "પરિણામ બતાવો",
      statementA: "અમારી પાસે",
      statementB: "{count} ઘરવપરાશની જરૂરી વસ્તુઓ છે,",
      statementC: "{amount}થી વધુ પર મફત ડિલિવરી",
      statementD: "અને",
      statementE: "કેશ ઓન ડિલિવરી.",
      allItemsA: "બધી",
      allItemsB: "વસ્તુઓ",
      categories: "વિભાગો",
      all: "બધું",
      showingXofY: "{total}માંથી {shown} બતાવ્યા",
      productsFound: "{count} વસ્તુઓ મળી",
      oneProductFound: "1 વસ્તુ મળી",
      showMore: "વધુ {count} બતાવો",
      itemNo: "નં. {id}",
      buyNow: "હમણાં ખરીદો",
      addToCart: "કાર્ટમાં ઉમેરો",
      outOfStock: "સ્ટોકમાં નથી",
      loading: "વસ્તુઓ લોડ થઈ રહી છે…",
      noMatchTitle: "“{query}” માટે કંઈ મળ્યું નહીં",
      noMatchInCategory: "{category}માં “{query}” માટે કંઈ મળ્યું નહીં",
      noMatchText: "સ્પેલિંગ તપાસો, અથવા આઇટમ નંબર લખીને જુઓ.",
      clearSearch: "શોધ ભૂંસો",
      showAllCategories: "બધા વિભાગોમાં શોધો",
      askOnWhatsApp: "WhatsApp પર પૂછો",
      emptyCategory: "અહીં હજી કંઈ નથી.",
      loadFailedTitle: "વસ્તુઓ લોડ થઈ શકી નહીં",
      loadFailedText: "તમારું ઇન્ટરનેટ તપાસો અને ફરી પ્રયાસ કરો.",
      retry: "ફરી પ્રયાસ કરો",
      allProducts: "બધી વસ્તુઓ",
      aboutUs: "અમારા વિશે",
      returnPolicy: "રિટર્ન પોલિસી",
      terms: "શરતો",
      skipToMain: "મુખ્ય માહિતી પર જાઓ",
      home: "હોમ",
      contents: "અનુક્રમણિકા",
      returnsTitle: "રિટર્ન",
      termsLong: "નિયમો અને શરતો",
      numberComingSoon: "અમારો ફોન નંબર જલદી અહીં ઉમેરાશે.",
      ctaQuestions: "કોઈ પ્રશ્ન?",
      ctaAskUs: "અમને પૂછો",
      chatOnWhatsApp: "WhatsApp પર વાત કરો",
      whatsappNumber: "WhatsApp {number}",
      callNumber: "કૉલ કરો {number}",
      close: "બંધ કરો",
      undo: "પાછું લો",
      remove: "કાઢો",
      decreaseQty: "{name} એક ઓછું કરો",
      increaseQty: "{name} એક વધુ ઉમેરો",
      quantityIs: "જથ્થો {qty}",
      quantity: "જથ્થો",
      howMany: "કેટલા જોઈએ?",
      each: "એક નંગ",
      totalQtyTimes: "કુલ · {qty} × {price}",
      keepShoppingSendLater: "ખરીદી ચાલુ રાખો, પછી મોકલો",
      orderNowWhatsApp: "હમણાં WhatsApp પર ઓર્ડર કરો",
      onlyThisItem: "ફક્ત આ વસ્તુ",
      itemAdded: "{name} ઉમેરાયું",
      qtyTimesPrice: "{qty} × {price}",
      openCartCount: "કાર્ટ ખોલો, {count} વસ્તુ",
      yourCartA: "તમારું",
      yourCartB: "કાર્ટ",
      addMoreA: "મફત ડિલિવરી માટે",
      addMoreB: "ની વધુ વસ્તુ ઉમેરો",
      youGetFreeDelivery: "તમને મફત ડિલિવરી મળશે",
      freeDeliveryProgress: "મફત ડિલિવરી સુધીની પ્રગતિ",
      addNote: "નોંધ ઉમેરો",
      noteLabel: "નોંધ ઉમેરો (જરૂરી નથી)",
      notePlaceholder: "દા.ત. વાદળી રંગ જોઈએ",
      removeItem: "{name} કાઢો",
      totalItems: "કુલ · {count} વસ્તુ",
      totalOneItem: "કુલ · 1 વસ્તુ",
      deliveryConfirmedPayCash: "ડિલિવરી ચાર્જ WhatsApp પર જણાવીશું. વસ્તુ મળે ત્યારે રોકડા આપો.",
      freeDeliveryPayCash: "મફત ડિલિવરી. વસ્તુ મળે ત્યારે રોકડા આપો.",
      sendOrderWhatsApp: "WhatsApp પર ઓર્ડર મોકલો",
      cartEmptyA: "તમારું કાર્ટ",
      cartEmptyB: "ખાલી છે",
      cartEmptyText: "થોડી વસ્તુઓ પસંદ કરો અને યાદી અમને WhatsApp પર મોકલો.",
      startShopping: "ખરીદી શરૂ કરો",
      itemsNoLongerAvailable: "તમારા કાર્ટની કેટલીક વસ્તુઓ હવે મળતી નથી, એટલે કાઢી નાખી છે.",
      removeThisA: "આને કાર્ટમાંથી",
      removeThisB: "કાઢવું છે?",
      noteRemovedToo: "તમારી નોંધ “{note}” પણ નીકળી જશે.",
      keepIt: "રહેવા દો",
      yesRemove: "હા, કાઢો",
      openingWhatsApp: "WhatsApp ખૂલી રહ્યું છે…",
      orderAlreadyTyped: "તમારો ઓર્ડર પહેલેથી લખેલો છે.",
      stepWriteDetails: "યાદીની નીચે તમારું નામ, સરનામું અને ફોન નંબર લખો.",
      stepPressSend: "WhatsAppમાં Send દબાવો.",
      stepWeReply: "અમે જવાબ આપીને પાકું કરીશું. વસ્તુ આવે ત્યારે રોકડા આપો.",
      didntOpen: "ન ખૂલ્યું?",
      copyOrderText: "ઓર્ડર કૉપી કરો",
      tryAgain: "ફરી પ્રયાસ કરો",
      backToShop: "દુકાન પર પાછા જાઓ",
      backToShopCartSaved: "દુકાન પર પાછા જાઓ · તમારું કાર્ટ સાચવેલું છે",
      orderCopied: "ઓર્ડર કૉપી થઈ ગયો",
      pasteInChat: "તેને {number} સાથેની ચેટમાં પેસ્ટ કરો.",
      openWhatsApp: "WhatsApp ખોલો",
      copyFailed: "કૉપી ન થયું. ફરી પ્રયાસ કરો.",
      longOrderTitle: "તમારો ઓર્ડર લાંબો છે",
      longOrderText: "WhatsApp તેને એક મેસેજમાં લઈ શકતું નથી, એટલે તેને {parts} ભાગમાં વહેંચ્યો છે. દરેક બટન વારાફરતી દબાવો અને દર વખતે WhatsAppમાં Send દબાવો.",
      sendPart: "ભાગ {part} / {parts} મોકલો",
      partSentAgain: "ભાગ {part} / {parts} ખૂલ્યો · ફરી ખોલવા દબાવો",
      sentAllParts: "મેં બધા ભાગ મોકલી દીધા",
      welcomeBack: "ફરી સ્વાગત છે",
      didYouPressA: "શું તમે WhatsAppમાં",
      didYouPressB: "Send",
      didYouPressC: "દબાવ્યું?",
      itemsInOrder: "તમારા ઓર્ડરમાં {count} વસ્તુ",
      oneItemInOrder: "તમારા ઓર્ડરમાં 1 વસ્તુ",
      ifYesClear: "જો હા, તો અમે તમારું કાર્ટ ખાલી કરીશું. ઓર્ડર પાકો કરવા અમે WhatsApp પર જવાબ આપીશું.",
      yesSentClearCart: "હા, મોકલી દીધો · કાર્ટ ખાલી કરો",
      notYetKeepCart: "હજી નહીં · કાર્ટ રહેવા દો",
      thanksOrderSent: "આભાર! અમે WhatsApp પર જવાબ આપીને પાકું કરીશું.",
      languageTitle: "ભાષા",
      current: "પસંદ કરેલી",
      currentLanguage: "હાલની ભાષા",
      languageNote: "દરેક ભાષામાં ભાવ સરખા રહે છે. WhatsApp ઓર્ડરમાં વસ્તુનું નામ હંમેશાં અંગ્રેજીમાં જાય છે, જેથી દુકાન તેને ઓળખી શકે.",
      cat_Kitchen: "રસોડું",
      "cat_Cleaning": "સફાઈ",
      "cat_Bathroom & Personal Care": "બાથરૂમ અને પર્સનલ કેર",
      cat_Car: "કાર",
      "cat_Lights & Electronics": "લાઇટ અને ઇલેક્ટ્રોનિક્સ",
      "cat_Kids & Toys": "બાળકો અને રમકડાં",
      "cat_Bags & Storage": "બેગ અને સ્ટોરેજ",
      "cat_Home & Wall Decor": "ઘર અને દીવાલની સજાવટ",
      "cat_Umbrellas & Rain": "છત્રી અને વરસાદ",
      "cat_Health & Massagers": "આરોગ્ય અને મસાજર",
    },
  };

  var current = "en";

  // Replace {name} placeholders with values.
  function fill(text, vars) {
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (m, key) {
      return vars[key] !== undefined ? String(vars[key]) : m;
    });
  }

  // Look up a string; fall back to English, then to the key itself.
  function t(key, vars) {
    var dict = STRINGS[current] || STRINGS.en;
    var text = dict[key] !== undefined ? dict[key] : STRINGS.en[key];
    return fill(text !== undefined ? text : key, vars);
  }

  // Translate every element with data-i18n / data-i18n-attr inside root.
  function apply(root) {
    root = root || document;
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      // format: "attr:key" or "attr:key,attr2:key2"
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length === 2) el.setAttribute(parts[0].trim(), t(parts[1].trim()));
      });
    });
  }

  // Does the current language (or English) have this key?
  function has(key) {
    return (STRINGS[current] && STRINGS[current][key] !== undefined) || STRINGS.en[key] !== undefined;
  }

  // The same key in every language, e.g. for searching "रसोई" or "રસોડું".
  function variants(key) {
    return Object.keys(STRINGS).map(function (l) { return STRINGS[l][key]; }).filter(Boolean);
  }

  var listeners = [];

  // Switch language: updates <html lang>, every data-i18n element, and
  // tells listeners (the catalogue, header…) to redraw their own text.
  function set(lang) {
    if (!STRINGS[lang]) lang = "en";
    current = lang;
    document.documentElement.lang = lang;
    apply(document);
    listeners.forEach(function (fn) { fn(lang); });
  }

  function onChange(fn) { listeners.push(fn); }

  BZ.i18n = {
    t: t,
    apply: apply,
    has: has,
    variants: variants,
    set: set,
    onChange: onChange,
    lang: function () { return current; },
    supported: Object.keys(STRINGS),
  };
})();
