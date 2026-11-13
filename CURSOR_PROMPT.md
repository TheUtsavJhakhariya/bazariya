# BAZARIYAA — Build prompt for Cursor

Paste this whole file into Cursor's Agent chat (or reference it with `@CURSOR_PROMPT.md`), with the project folder `New-site-bazariya` open.

---

## 0. Your job, in one paragraph

Build **BAZARIYAA ("Ghar Ka Bazaar")**: a static, mobile-first shop catalogue for a family-run household-goods shop in **Surat, Gujarat**. Customers browse, pick a quantity, keep a cart in their browser, and send the order as a **pre-filled WhatsApp message**. No login, no payment, no backend, no database. Cash on delivery. Hosted on GitHub Pages.

You must reproduce the reference images **exactly** (layout, spacing, type, colour, radius, copy) and use the styleguide **strictly**. Do not redesign, "improve" or simplify. Where a reference image and this prompt disagree on *looks*, the image wins. Where they disagree on *behaviour*, this prompt wins. If something is genuinely unclear, ask before guessing.

---

## 1. Source files in this folder (read ALL of them before planning)

**Styleguide (design tokens + components, strict):**
- `Bazariya styleguide.pdf`. If you cannot read the PDF visually, use the PNG slices in `styleguide-png/` (same content, top to bottom: `styleguide-01.png` … ) and the token tables copied in section 3 of this prompt.

**Page references** (folder `Page Reference Images/`, desktop width 1280–1536px):
| File | Page |
|---|---|
| `01-home.png` | Home / catalogue (`index.html`) |
| `02-return-part1.png` | Return policy, first half (`return-policy.html`) |
| `02-return-part2.png` | Return policy, second half (`return-policy.html`) |
| `03-about.png` | About us (`about.html`) |
| `04-terms.png` | Terms & conditions (`terms.html`) |
| `06-info-page.png` | Info-page template (same layout as Terms; use it as the shared info-page shell) |

**Modal / popup / toast references** (folder `Modal-popup-toast refrences/` — note the folder name is spelled "refrences"):
| File | Component |
|---|---|
| `Add-to-cart.png` | "Added to your cart" popover (tablet/desktop) + mobile toast |
| `Cart-drawer.png` | Cart drawer |
| `Did-you-send.png` | "Did you press Send in WhatsApp?" dialog |
| `Do-we-deliver.png` | Delivery-area checker dialog |
| `Languages.png` | Language picker |
| `Opening-whatsapp.png` | "Opening WhatsApp…" dialog |
| `Out-of-stock.png` | Out-of-stock product dialog |
| `Photo-viewer.png` | Full-screen photo viewer |
| `Quantity-dailog.png` | Quantity dialog (desktop modal / mobile bottom sheet) |
| `Remove-item.png` | Remove-from-cart confirmation |
| `Search-item.png` | Search overlay (results panel) |
| `Toast.png` | Toast variants (offline, couldn't open WhatsApp, order copied, note saved) |

The **mobile (360px)** versions of the header, footer, sticky cart bar, product card, quantity sheet and cart are drawn in the styleguide (sections "Product card · 360", "Header, trust strip, footer · 360", "Quantity sheet · cart · 360"). Use those for phones.

---

## 2. Global replacements and fixed facts

- **WhatsApp / phone number:** `+1 (647) 409 6236`. Digits for links: `16474096236`. Display format everywhere: `+1 647 409 6236`. Every `+91 98765 43210` in the images must be replaced with this. The number lives only in `config.json`, never hard-coded in HTML/JS.
- **Product counts** in copy ("412 home essentials", "412 ITEMS FROM ₹5", "All (412)") are **computed from the data**, never hard-coded. With the demo data they will read 10 and the real lowest price.
- **Shop name** in the WhatsApp greeting: `BAZARIYAA`. Brand lockup text: `bazariyaa` / `Ghar ka bazaar`.
- **Delivery area:** Surat only. Free delivery at ₹499 and above. Cash on delivery. Keep all Surat copy exactly as in the images.
- **Photos in the images are placeholders** (pug, Eiffel Tower, dream-catcher…). Use placeholder photos the same way (see §5). Do not try to match their content.
- **Two known glitches in the reference images, fix them:**
  1. `01-home.png`: the "Popular *this week*" heading overlaps the filter words line. Put the filter line below the heading with `--space-24` gap.
  2. `Do-we-deliver.png`: the serif "*you?*" overlaps the subtitle. Keep the heading on its own lines and put the subtitle below it.

---

## 3. Design tokens (exact, from the styleguide)

Put these in `css/tokens.css` as CSS custom properties on `:root`. Do not invent other colours.

### 3.1 Colour
```
--color-bg #EDE8E0            --color-surface #FBF9F5        --color-surface-sunken #E4DED4   --color-surface-pressed #DCD5C9
--color-band #262624          --color-band-raised #3A3A37    --color-white #FFFFFF
--color-text #1E1E1C          --color-text-secondary #3A3833 --color-text-muted #5E5B54       --color-text-faint #807B71 (large text / UI only)
--color-text-on-sage #24302A  --color-text-on-band #EDE8E0   --color-text-on-band-secondary #D9D4CB
--color-text-on-band-muted #BDB8AF   --color-text-on-band-dim #9B978F   --color-text-on-ink #FFFFFF
--color-border-strong #1E1E1C --color-border-input #807B71   --color-border-on-band #7A766E   --color-divider-on-band #3A3A37
--color-primary #1E1E1C       --color-primary-hover #3A3A37  --color-primary-pressed #262624
--color-accent #FF8A3D        --color-accent-hover #F07A2C   --color-accent-pressed #D96A1C   --color-accent-ink #C2560F
--color-accent-soft #FFE1CC   --color-accent-tint #FFB27A    --color-whatsapp #FF8A3D
--color-disabled-bg #E4DED4   --color-disabled-text #5E5B54
--color-sage #A9BCB1          --color-sage-light #B9CDC1     --color-success #A9BCB1  --color-warning #FFE1CC  --color-danger #B42318
--color-badge-oos-bg #1E1E1C  --color-badge-free-bg #FF8A3D  --color-badge-count-bg #FF8A3D
--color-overlay rgba(30,30,28,0.55)   --color-image-scrim rgba(237,232,224,0.72)
--color-skeleton-base #E4DED4 --color-skeleton-shimmer #EDE8E0
--color-focus #1E1E1C         --color-focus-on-dark #FF8A3D
```
Accent buttons use **dark text** (#1E1E1C on #FF8A3D = 7.12:1). Never white text on orange.

### 3.2 Fonts (Google Fonts)
- `Anton` 400 — display / poster / marquee / big years ("BAZARIYAA", "ORDER ON WHATSAPP", "TERMS", "DAY 0", "2024").
- `Geist` 400/500/600/700 — all UI and body text.
- `Geist Mono` 400/500 — labels, item numbers, mono buttons ("NO. 154", "STEP 1 / 3", "HOME / ABOUT US").
- `Instrument Serif` 400 regular + italic — serif headings and serif prices ("Popular *this week*", "₹290" in dialogs, "Ghar ka *bazaar.*").
- `Noto Sans Devanagari` and `Noto Sans Gujarati` — load on demand only when Hindi/Gujarati is chosen. Indic text gets line-height +0.15.

### 3.3 Type scale (desktop values from the styleguide; size / line-height / letter-spacing / weight / family)
```
--text-display        168px / 0.86 / normal   / 400 Anton            (BAZARIYAA)
--text-display-sub     86px / 0.90 / normal   / 400 Anton            (GHAR KA BAZAAR)
--text-poster         118px / 0.90 / normal   / 400 Anton            (ORDER ON WHATSAPP, SAY NAMASTE, START A RETURN, QUESTIONS? ASK US)
--text-marquee         58px / 1.00 / normal   / 400 Anton            (CASH ON DELIVERY ● FREE DELIVERY IN SURAT)
--text-stat            88px / 1.00 / -4.4px   / 600 Geist            (₹499, No.154 in cards)
--text-h1              72px / 0.90 / -4.32px  / 500 Geist            (Most ordered)
--text-h2              52px / 1.00 / -2.6px   / 500 Geist            (How ordering works, Our journey, You choose)
--text-h3              24px / 1.20 / -0.48px  / 600 Geist            (Replaced if damaged)
--text-title           19px / 1.25 / normal   / 600 Geist            (Under ₹120 today)
--text-serif-heading   46px / 1.00 / normal   / 400 Instrument Serif (Popular this week, Your cart)
--text-statement       40px / 1.24 / -1.2px   / 500 Geist            (We have 412 home essentials…)
--text-department      40px / 1.40 / -1.4px   / 500 Geist            (Kitchen Essentials)
--text-filter          30px / 1.20 / -1.05px  / 600 Geist            (All (412), Kitchen, Cleaning…)
--text-body-large      17px / 1.50 / normal   / 400 Geist
--text-body            16px / 1.45 / normal   / 400 Geist
--text-small           15px / 1.40 / normal   / 400 Geist
--text-caption         14px / 1.40 / normal   / 400 Geist
--text-meta            13px / 1.20 / normal   / 400 Geist
--text-label           12px / 1.40 / normal   / 400 Geist Mono (UPPERCASE)
--text-badge           13px / 1.00 / normal   / 700 Geist
--text-price           20px / 1.20 / -0.4px   / 600 Geist            (card price ₹290)
--text-price-row       28px / 1.00 / normal   / 400 Instrument Serif (₹110 in cart rows)
--text-price-large     42px / 1.00 / normal   / 400 Instrument Serif (₹55 Under ₹120, ₹400 in quantity dialog)
--text-total           30px / 1.10 / -0.9px   / 600 Geist            (₹379 cart total)
--text-button          15px / 1.00 / normal   / 600 Geist
--text-button-lg       17px / 1.00 / normal   / 600 Geist            (Send order on WhatsApp)
--text-button-mono     14px / 1.00 / 0.84px   / 400 Geist Mono       (+1 647 409 6236 — SAY NAMASTE)
--text-chip            14px / 1.00 / normal   / 400 Geist
--text-input           18px / 1.20 / normal   / 500 Geist
--text-nav             15px / 1.00 / normal   / 400 Geist
--text-footer-mark     56px / 0.95 / normal   / 400 Instrument Serif (Ghar ka bazaar.)
```
Phones: scale the display/poster/h1/h2/statement sizes down with `clamp()` so nothing overflows at 360px (for example `--text-display: clamp(72px, 23vw, 168px)`, `--text-display-sub: clamp(36px, 11.5vw, 86px)`). Keep all other sizes as listed.

### 3.4 Spacing, radius, borders, shadows, icons
```
Spacing: --space-4 4px, -6 6px, -8 8px, -10 10px, -12 12px, -16 16px, -20 20px, -24 24px, -28 28px, -32 32px,
         -40 40px, -48 48px, -56 56px, -64 64px, -72 72px; --space-gutter 24px; --space-edge 12px;
         --space-section 56px; --space-grid 10px
Radius:  --radius-xs 7px, -sm 12px, -md 16px, -lg 22px, -xl 28px, -pill 999px, -round 50%
Borders: hairline 1px ink; control 1.5px; input 1.5px #807B71; input focus 2px
Shadows (names from the styleguide; match the PDF visually; starting values):
  --shadow-sticker 0 2px 6px rgba(30,30,28,.12)   --shadow-photo 0 8px 24px rgba(30,30,28,.14)
  --shadow-stack / --shadow-stack-top (paper notes in "Our promise")
  --shadow-popover 0 12px 32px rgba(30,30,28,.18) --shadow-modal 0 24px 60px rgba(30,30,28,.28)
  --shadow-drawer -12px 0 40px rgba(30,30,28,.22) --shadow-toast 0 10px 30px rgba(30,30,28,.22)
  --shadow-cartbar: dark bar with a soft ORANGE glow below it (see 01-home bottom)   --shadow-header 0 2px 12px rgba(30,30,28,.08)
Controls: --tap-min 48px; large controls 56px (dialog stepper, "Keep it", "Not yet · keep my cart").
Breakpoints: base = 360px phone; overrides at 768px and 1200px. Page max width 1280px.
Icons: inline SVG, viewBox 24, stroke 1.7, round caps/joins, shown at 20/24px. Set: cart, search, close, plus,
       minus, trash, chat, truck, cash, check, language(globe), back, arrow, chevron-down, pin, box, note(pencil),
       copy, offline(wifi), alert, plus "swap" (⇄, Return page).
```

### 3.5 Components (as drawn in the styleguide; every state: default, hover, pressed, focus-visible, disabled, loading)
- **Buttons (48px tall, pill):** Primary (dark, white text "Buy now"); Secondary/Add-to-cart (outline 1.5px ink on desktop, sunken-filled in the home grid); Accent (orange, dark text); Danger (outline #B42318, red text "Remove"); Close (outline pill with × "Close"); Large 56 ("Keep it", "Not yet · keep my cart"); Text link (underlined); Icon cart (dark circle + orange count badge); big "Send order on WhatsApp" (orange, chat icon); mono outline pill ("+1 647 409 6236 — SAY NAMASTE").
- **Inputs:** search pill with orange round arrow button; search with "Clear" inner pill; stepper (− value +, plus is dark circle) at 48 (cart) and 56 (dialog), typed state = boxed number; note textarea with `0 / 120` counter; language pills `EN · हिं · ગુ`.
- **Chips:** filter words (big text list, active = ink + underline, others = faint); "TRY" chips on dark band; info pill 36px (area names); selectable pill 48px (area picker, selected = dark).
- **Product card (360):** card 159px wide, image 143px square, `No. 154` mono tag top-left on the image, name max 2 lines with ellipsis, price, Buy now (dark) and Add to cart (outline) stacked; out-of-stock = faded image + "Out of stock" dark pill on the image + one disabled "Out of stock" button; missing image = sunken box with box icon; skeleton version.
- **Badges:** Out of stock (dark pill), Free delivery (orange pill), round orange "FREE ABOVE ₹499" sticker (rotated, Anton), count badge, YES (dark) / ASK US (orange) / NO (outline).
- **States:** "Your cart is *empty*" (bag icon, Start shopping); "No match for *"kadhai"*" (suggestion chips tawa/bottle/brush, Clear search, Ask us on WhatsApp link); "Couldn't load items" (alert icon, Retry); config banner "**Shop number is not set.** Orders can't be sent." (warning colour).

---

## 4. Tech stack and rules (do not add to it)

- Plain **HTML + CSS + vanilla JavaScript**. No framework, no build step, no npm needed to run. Must run as-is on GitHub Pages under a sub-path (relative paths only, never start a path with `/`).
- One library allowed: **PapaParse 5.4.1** from cdnjs (pinned) to read the product CSV.
- `fetch()` needs a local server: add `tools/serve.js` (tiny Node static server) and a `README.md` line: `node tools/serve.js` → http://localhost:8000.
- State in `localStorage` (cart, language, chosen delivery area, cached products), every access wrapped in try/catch.
- Escape all data before putting it in the DOM (`textContent`). No inline `onclick`. Use event delegation.
- Accessibility: real `<button>`/`<a>`/`<label>`, visible focus ring (`--color-focus`, on dark `--color-focus-on-dark`), dialogs with `role="dialog"`, `aria-modal`, focus trap, focus return, Escape and backdrop close, Android back button closes the top layer (push a history state when opening), `prefers-reduced-motion` stops the marquee and shimmer.
- Suggested files:
```
index.html  about.html  return-policy.html  terms.html  config.json
css/tokens.css  css/base.css  css/components.css  css/pages.css
js/config.js  js/data.js  js/i18n.js  js/ui.js (dialogs, sheets, toasts, popover)  js/shell.js (header, footer, cart bar)
js/catalogue.js  js/search.js  js/quantity.js  js/cart.js  js/whatsapp.js  js/viewer.js  js/area.js  js/home.js  js/return.js
data/products.csv  images/placeholder.svg  tools/serve.js  README.md
```

### config.json
```json
{
  "shopName": "BAZARIYAA",
  "tagline": "Ghar ka bazaar",
  "whatsappNumber": "+1 647 409 6236",
  "freeDeliveryAbove": 499,
  "currencySymbol": "₹",
  "city": "Surat",
  "areas": ["Adajan","Vesu","Pal","Piplod","Athwa","Varachha","Katargam","Udhna","Althan","City Light","Rander"],
  "sheetCsvUrl": "",
  "fallbackCsv": "data/products.csv",
  "popularCount": 8,
  "showMoreStep": 20,
  "maxQtyPerItem": 99,
  "noteMaxLength": 120,
  "defaultLanguage": "en",
  "languages": ["en","hi","gu"]
}
```
If `whatsappNumber` is empty or invalid: show the config banner and disable every send/order button.

---

## 5. Demo data — `data/products.csv` (10 products, one per category)

Columns: `id,name,description,price,category,images,in_stock,popular,most_ordered,name_hi,name_gu`
- `images` = up to 4 image URLs separated by `|`. For the demo use seeded placeholders: `https://picsum.photos/seed/bz{id}a/800/800|https://picsum.photos/seed/bz{id}b/800/800|…c…|…d…`. On any image error fall back to `images/placeholder.svg` (the missing-image box).
- `popular` = Y/N (shown in "Popular this week"). `most_ordered` = rank 1–6 or empty.
- Item numbers display zero-padded to 3 digits as `No. 012` / `NO. 012`; the WhatsApp message uses the plain number.

| id | name | description | price | category | in_stock | popular | most_ordered |
|---|---|---|---|---|---|---|---|
| 154 | Panda Night Lamp | Soft glow for kids' rooms. | 290 | Lights & Electronics | Y | Y | 2 |
| 12 | Garlic Press | Crush garlic without peeling. | 55 | Kitchen | Y | Y | 5 |
| 38 | Magic Towel | Soaks up water fast, dries quickly. | 50 | Cleaning | Y | Y | 6 |
| 87 | 2 in 1 Tile Cleaning Brush (White) | Scrub tiles and corners. | 109 | Bathroom & Personal Care | Y | Y | 3 |
| 241 | Car Cleaning Duster | Wipes dust off without scratches. | 150 | Car | Y | Y | 1 |
| 298 | Vacuum Storage Bag | Packs blankets flat. | 200 | Bags & Storage | **N** | Y | |
| 317 | Capsule Umbrella | Fits in a pocket. | 209 | Umbrellas & Rain | Y | Y | 4 |
| 3 | 150 Piece Art Set | Colours, crayons and sketch pens. | 240 | Kids & Toys | Y | Y | |
| 1 | Electric Hot Water Bag | Warms up in minutes. | 80 | Health & Massagers | Y | N | |
| 412 | Marble Foil Sticker Roll | Peel-and-stick marble look. | 99 | Home & Wall Decor | Y | N | |

These are demo items. Hindi/Gujarati names: leave empty for now.

**Categories** (fixed order) with the two label sets the design uses:
| category (data) | Department list label | Filter word | Most-ordered tag |
|---|---|---|---|
| Kitchen | Kitchen Essentials | Kitchen | KITCHEN |
| Cleaning | Cleaning Helpers | Cleaning | CLEANING |
| Bathroom & Personal Care | Bathroom & Personal Care | Bathroom | BATHROOM |
| Car | Car Care | Car | CAR |
| Lights & Electronics | Lights & Electronics | Lights | LIGHTS |
| Kids & Toys | Kids & Toys | Kids | KIDS |
| Bags & Storage | Bags & Storage | Storage | STORAGE |
| Home & Wall Decor | Home & Wall Decor | Decor | DECOR |
| Umbrellas & Rain | Umbrellas & Rain | Rain | RAIN |
| Health & Massagers | Health & Massagers | Health | HEALTH |

Loading order: `config.sheetCsvUrl` (8 s timeout) → `data/products.csv` → last cached copy in localStorage (show the **offline toast**) → "Couldn't load items" state with Retry.

---

## 6. Shared shell (every page)

### 6.1 Header
- **Desktop/tablet** (`01-home.png` top, `03-about.png` top): left = brand pill (orange circle with "b" + `bazariyaa` / `Ghar ka bazaar`) linking to `index.html`; next to it the **"📍 Delivering across Surat"** pill (pin icon in `--color-accent-ink`). Home page only: centre nav pills **Shop · Departments · Order by number · Help** (active one = surface pill). Right: language pill (globe + `EN`) and the dark round cart button with orange count badge (hidden at 0).
- **Phone** (styleguide "Header, trust strip, footer · 360"): row 1 = brand pill, `EN` pill, cart button; row 2 = full-width pill "📍 Delivering across Surat · Cash on delivery". No nav pills.
- If the customer has picked an area, the pill reads "Delivering to Vesu" (same style).
- Info pages add a breadcrumb under the header in Geist Mono uppercase: `HOME / ABOUT US`, `HOME / RETURN POLICY`, `HOME / TERMS & CONDITIONS` (HOME links to index).

### 6.2 Footer (`01-home.png` bottom, all info pages bottom)
Surface card, radius xl: left "Ghar ka" / "*bazaar.*" (Instrument Serif, footer-mark); right, mono uppercase right-aligned: `CASH ON DELIVERY` / `FREE DELIVERY ABOVE ₹499` / `SURAT, GUJARAT`. 1px ink divider. Below: links **About us · Return policy · Terms** (current page underlined; home footer has no "Shop" link) and on the right the quick language switch `EN / हिं / ગુ`.

### 6.3 Sticky cart bar (`01-home.png` very bottom; styleguide 360 "Your cart 3 items · ₹379 | Send")
Visible on **every page** whenever the cart has ≥1 item; hidden when empty. Dark pill, centred, bottom-fixed, `--shadow-cartbar` (orange glow). Left: "Your cart" (meta, muted) over "**3 items · ₹379**". Right: orange button "💬 Send order on WhatsApp" (phone: "💬 Send"). Tapping the text part opens the cart; tapping the button sends the cart order (flow F7). Add bottom padding to the page so the bar never covers the footer.

---

## 7. Pages

### 7.1 Home — `index.html` = `Page Reference Images/01-home.png` (top to bottom, nothing left out)

1. **Header** (6.1) with nav pills.
2. **Hero:** giant Anton `BAZARIYAA` and `GHAR KA BAZAAR` centred. Under it a white-framed polaroid photo (`--shadow-photo`) with the round orange **"FREE ABOVE ₹499"** sticker overlapping its top-right corner (rotated about −12°). Bottom-left mono label `{count} ITEMS / FROM ₹{min}`; bottom-right `DELIVERING IN / SURAT ONLY`.
3. **Dark search band** (`--color-band`): mono label `• NAMASTE, SURAT`; the statement "We have [box icon] **{count} home essentials,** [truck icon] **free delivery in Surat** above ₹499 and [cash icon] **cash on delivery.**" (dim words in `--color-text-on-band-dim`, icons in small `--color-band-raised` rounded squares). Search pill: placeholder `Search "tawa", "bottle" or item no. 154`, orange round arrow. Row: `TRY` + chips **Garlic Press · Magic Towel · Umbrella · No. 154**.
4. **Three cards row:**
   - Orange gradient card "Free delivery from" / big `₹499` (text-stat) / "Fill your cart past ₹499 and delivery in Surat is on us." with the tilted "PAY AT THE DOOR" card graphic (cash icon).
   - Sage card "Order by number" / "Saw it in our pamphlet? Type the item number." / big `No.154` / a white pill input row showing the matched product "Panda Night Lamp · ₹290" and a dark round arrow.
   - Surface card "Delivering in Surat" (pin icon right) / "Only in Surat for now, so we can deliver fast and take cash at the door." / info pills of the 8 areas (Adajan, Vesu, Pal, Piplod, Athwa, Varachha, Katargam, Udhna).
5. **Departments:** top row mono `({n}) DEPARTMENTS` · `TAP ONE TO BROWSE` · `ALL →`. A centred list of department labels (text-department). The hovered / focused / last-tapped row turns into a full-width dark band with light text, and a tilted polaroid photo of that department floats on the right (as "Lights & Electronics" in the image). Show only departments that have products.
6. **Catalogue — "Popular *this week*"** (serif heading) with `View all →` on the right. Below it (fixed, not overlapping) the **filter words** line: `All ({count}), Kitchen, Cleaning, Bathroom, Car, Lights, Kids, Storage, Decor, Rain, Health` (active = ink, others faint; only categories present). Then the product grid (4 columns desktop, 3 tablet, 2 phone; card per 3.5). Initially shows the `popular=Y` products (up to `popularCount`); `Show {n} more ⌄` outline pill appends up to `showMoreStep` more. Choosing a filter word or "View all" switches the heading to the category name / "All *items*" and shows all matching products.
7. **"Under ₹120 today"** panel (title left, mono `SMALL THINGS, BIG HELP` right): 2×2 rows of in-stock items priced under 120. First row is the dark featured row (orange "Buy now"); others light rows with serif price-large, name, `No. 012 · Kitchen`, outline "Add to cart", dark "Buy now".
8. **"Most ordered"** (text-h1, two lines) with mono count `06` top-right; table rows sorted by `most_ordered`: name · mono id · mono category tag · price · outline mono `ADD TO CART` pill · dark round `BUY`. Hairline dividers.
9. **Marquee band** (dark): Anton `CASH ON DELIVERY ● FREE DELIVERY IN SURAT ●` scrolling left forever (orange dot). Static when reduced motion.
10. **"How ordering works"** (dark band, h2) + mono `NO LOGIN · NO CARD`. Three outlined cards: `01 PICK` (cart icon) "Search by name or item number. Tap Buy now or Add to cart." · `02 SEND` (chat icon) "Your list opens in WhatsApp, already typed. Add your name, Surat address and phone. Press send." · `03 PAY` (cash icon) "We confirm the order and deliver in Surat. Pay cash when it reaches your door." Each with `STEP n / 3` at the bottom.
11. **"Our promise"** photo card (black-and-white photo, radius xl, label `Our promise` and mono `(03)`) with three stacked paper notes: "Packed by our family", "Checked before it leaves", and the front one "Replaced if damaged" + "Wrong or broken item? Send a photo on WhatsApp within 2 days of delivery. We replace it or return your money." + bold "No card. No login. No advance."
12. **Giant poster** `ORDER ON / WHATSAPP` (Anton) and below it the outline mono pill `💬 +1 647 409 6236 — SAY NAMASTE` (opens WhatsApp with "Namaste BAZARIYAA!").
13. **Footer** (6.2) and **sticky cart bar** (6.3).

Header nav targets: Shop → section 6; Departments → section 5; Order by number → focus the Order-by-number input in section 4; Help → section 10.

### 7.2 Return policy — `return-policy.html` = `02-return-part1.png` followed by `02-return-part2.png`
The two images are the two halves of one page. Build them in this order and show the shared "Start a return" CTA and footer only once, at the end:

**From part 1:**
1. Header, breadcrumb `HOME / RETURN POLICY`.
2. Serif hero "Can I return *this?*" + "Tap what happened. We'll tell you straight away."
3. **Answer picker:** 2-column grid of large option cards: It arrived broken · Wrong item sent · Something is missing · I changed my mind · I've used it · It's been over 2 days. Selected card = dark with orange check-circle. Default selected: "It arrived broken".
4. **Answer card** (sage, radius xl): badge (YES / ASK US / NO per styleguide badges) + mono `YOUR ANSWER`, h-sized answer, body. Answers (draft copy, owner must confirm):
   - Broken → YES · "Yes, we'll replace or refund it." · "Send a photo of the item and the parcel on WhatsApp within 2 days. Free pickup in Surat."
   - Wrong item → YES · "Yes, we'll swap it." · "Send a photo of what you got on WhatsApp within 2 days. We bring the right one and take the wrong one back."
   - Missing → YES · "Yes, we'll send what's missing." · "Tell us on WhatsApp within 2 days with your order number."
   - Changed my mind → ASK US · "Ask us first." · "If it's unused and in its box, we'll usually take it back. Message us within 2 days."
   - Used it → NO · "Sorry, we can't take back used items." · "If it broke during normal use within 2 days, message us anyway."
   - Over 2 days → NO · "After 2 days we can't take it back." · "Not sure? Ask us anyway. We'll always try to help."
5. "Your 2-day window" (h2) + mono `FROM DELIVERY`: progress track with dots (dark, white, orange) and three columns `DAY 0` / `DAY 1` / `DAY 2` (Anton; DAY 2 in `--color-accent-ink`) with their texts.
6. "What to *send us*" (serif) + mono `ON WHATSAPP`: three photo cards numbered 1–3: Photo of the item · Photo of the parcel · Your order number.
7. Dark "GOOD TO KNOW" card: serif "Returns in Surat are *always free.*" + three orange-check lines.

**From part 2:**
8. Two-column block: left surface card mono `RETURN POLICY` + Anton `ONE / CHAT. / SORTED.` + "Damaged, wrong or missing? Message us within 2 days of delivery. This is what that chat looks like."; right sunken card = sample WhatsApp chat (avatar "Bazariyaa · usually replies in an hour", customer photo bubble "Glass came cracked 😟 Order no. 203", shop dark bubbles, customer light bubble, mono `SAMPLE CONVERSATION`).
9. "You choose" (h2) + mono `ALWAYS FREE IN SURAT`: sage card `REPLACE` and orange-gradient card `REFUND` (Anton) with icon tiles and texts.
10. "The *fine print*" receipt card (slightly rotated, dashed rows): Time to report a problem — 2 DAYS · Damaged, wrong or missing — ALWAYS OK · Changed your mind, unused — ASK US · Pickup or swap in Surat — FREE · Refund paid as — CASH · Forms to fill — NONE · **You pay for a return** — serif `₹0` · `LAST UPDATED 02 OCT 2026`.
11. Mono `WE CAN'T TAKE BACK` + struck-through big lines: Used or washed items · Opened personal care · Reported after 2 days · "Not sure? Ask us anyway. We'll always try to help."
12. Poster `START A / RETURN` + dark CTA pill "💬 Send a photo on WhatsApp · +1 647 409 6236" (orange glow) → WhatsApp with "Hi BAZARIYAA, I want to start a return. Order/item no.: ".
13. Footer (Return policy underlined), cart bar.

### 7.3 About — `about.html` = `03-about.png`
1. Header, breadcrumb `HOME / ABOUT US`.
2. Mono `A LETTER FROM THE FAMILY`; big serif quote: "We started Bazariyaa because buying a *₹50 brush* shouldn't need an app, a card or a trip across Surat." Author row: round photo, **Your name** / Founder, Bazariyaa (keep as placeholder text), right "— *with love*".
3. Photo grid: large B&W photo with pill `OUR SHOP, SURAT`; right column: photo with pill `PACKING ORDERS` and dark card `EVERY ORDER` / serif "Checked by hand *before it leaves.*"
4. "Our journey" (h2) + mono `SO FAR`; vertical timeline: 2024 A stall in the market · 2025 Orders on WhatsApp · 2026 Bazariyaa online ("{count} items in one catalogue, still ordered the same simple way.") · NEXT More of Surat. Years in Anton; dots: white, white, orange, sage.
5. Sage "WHERE WE DELIVER" card: serif "All of *Surat.*" + text + area pills (Adajan, Vesu, Pal, Piplod, Athwa, Varachha, Katargam, Udhna, Althan, City Light). Tapping a pill opens Do-we-deliver with that area selected.
6. Poster `SAY NAMASTE` + dark CTA pill "💬 Chat with us · +1 647 409 6236".
7. Footer (About us underlined), cart bar.

### 7.4 Terms — `terms.html` = `04-terms.png` (layout template = `06-info-page.png`)
1. Header, breadcrumb `HOME / TERMS & CONDITIONS`.
2. Two-column hero: dark card with Anton `TERMS`, vertical mono `LAST UPDATED 02 OCT 2026`, serif "The simple rules of *shopping with us.*", and two facts at the bottom ("Plain language / No fine print. If anything is unclear, ask us on WhatsApp." · "8 short sections / About a 3-minute read."). Right surface card "Contents" table (Section / No.) with 8 rows linking to the anchors.
3. Eight sections with left mono label `(01) WHO WE ARE` etc. and right h + body, separated by hairlines. Use the exact text from the image, with the phone number replaced: Who we are · Ordering on WhatsApp · Prices · Delivery in Surat · Payment · Returns & refunds (link "Return policy") · Your information · Contact.
4. Dark `• IN SHORT` statement band with inline icon tiles: "Order on WhatsApp, we confirm the price, deliver in Surat and you pay cash at the door."
5. Poster `QUESTIONS? / ASK US` + outline mono pill `💬 +1 647 409 6236 — WHATSAPP`.
6. Footer (Terms underlined), cart bar.

On phones, every two-column block stacks; posters scale with clamp; nothing scrolls sideways at 360px.

---

## 8. UX flows — what opens when (follow exactly)

Notation: **[folder/file.png]** = the reference you must match.

### F1. First visit
1. Page loads → header, hero and search render immediately; product areas show **skeleton cards** (styleguide skeleton) until data arrives.
2. Data loads (5. loading order). If it fails but a cached copy exists → render cached products and show the **"You're offline · Showing items saved on your phone." toast with "Try again"** [Modal-popup-toast refrences/Toast.png, first toast]. If nothing loads → "Couldn't load items · Retry" state (styleguide).
3. If `whatsappNumber` is missing → config banner at the top; all order/send buttons disabled.

### F2. Search
1. Customer taps/focuses the hero search (or "Order by number" nav) → the **search overlay** opens at the top of the screen over a dimmed page [Modal-popup-toast refrences/Search-item.png]: search pill with "Clear" + dark "Cancel".
2. Empty query → only `PEOPLE OFTEN SEARCH` chips: tawa · bottle · umbrella · छाता · brush (tap fills the query).
3. Query is a number (`154`, `No. 154`, `#154`) and matches an id → `ITEM NUMBER MATCH` dark card (photo, Anton `NO. 154`, name, category, serif price, orange **Buy now**). Below, `ALSO MATCHING "154"` rows (ids that start with the number, or names containing it) and the row `– Search all items for "154" →`. Sections with no results are hidden.
4. Query is words → `MATCHING ITEMS` rows (same row style as "Also matching", max 6; every word must match the start of a word in name/category/description) + `Search all items for "…" →`.
5. **Buy now** in the overlay → overlay closes → **Quantity dialog** opens in Buy mode (F4).
6. Tapping a result row → overlay closes → Quantity dialog in Add mode.
7. "Search all items for …" or pressing Enter → overlay closes, the catalogue (section 6) is filtered by the query, heading becomes "Results for *"…"*", page scrolls there.
8. No match → overlay shows the styleguide "No match for *"…"*" state (chips tawa/bottle/brush, Clear search, Ask us on WhatsApp link → WhatsApp "Hi BAZARIYAA, do you have …?").
9. Cancel / Escape / back button → overlay closes, query kept in the box.
10. "TRY" chips on the home band → open the overlay pre-filled with that query.

### F3. Browse
1. Department row or filter word tapped → catalogue filtered to that category, heading = category, page scrolls to the catalogue. "ALL →" / "All" / "View all" → all products.
2. "Show {n} more" → appends the next batch, focus moves to the first new card.
3. Card **photo** tapped → **Photo viewer** [Modal-popup-toast refrences/Photo-viewer.png]: dark full screen, mono `NO. 154 · PHOTO 2 OF 4`, Close pill, big photo with round prev/next arrows (also ←/→ keys and swipe), thumbnail strip (current = orange outline), bottom-right name + serif price + orange **Buy now** → closes viewer, opens Quantity dialog in Buy mode.
4. Out-of-stock card (photo or name tapped) → **Out-of-stock dialog** [Modal-popup-toast refrences/Out-of-stock.png]: faded photo with "Out of stock" pill and Close, mono `NO. 298 · BAGS & STORAGE · ₹200`, name, serif "Sold out for now. *Want us to tell you?*", "We'll send one WhatsApp message when it's back. Nothing else.", orange **"Tell me on WhatsApp when it's back"** (→ WhatsApp: "Hi BAZARIYAA! Please tell me when No. 298 Vacuum Storage Bag is back in stock.") and outline **"See similar items"** (→ close, filter catalogue to that category, scroll). Its card button stays disabled "Out of stock".

### F4. Quantity dialog (from any "Buy now" or "Add to cart")
[Modal-popup-toast refrences/Quantity-dailog.png] on ≥768px (centred modal); styleguide "Quantity sheet · 360" on phones (bottom sheet with drag handle).
- Content: photo with `No. 203` tag · mono category · Close pill · name · description · serif price + "each" · "How many?" quick picks **1 2 3 5 10** (selected = dark) + large stepper (−, typed number, + dark) · "Total · 2 × ₹400" and big total · two stacked-label buttons: outline **"🛍 Add to cart / Keep shopping, send later"** and orange **"💬 Order now on WhatsApp / Only this item"**.
- Opened via **Buy now** → orange button is the focused primary. Opened via **Add to cart** → Add to cart is the focused primary (dark fill). Phone order: primary button first.
- Quantity min 1, max `maxQtyPerItem`, typing allowed (numeric keypad), clamps on blur.
- **Order now on WhatsApp** → builds a message for this item only, **never touches the cart** → F6.
- **Add to cart** → adds qty (increments if already in cart), dialog closes → F5.
- Close: Close pill, Escape, backdrop, back button, swipe down on the sheet handle.

### F5. Added-to-cart feedback
[Modal-popup-toast refrences/Add-to-cart.png]
- **Tablet/desktop (≥768px):** popover hanging from the cart button: sage check circle + "Added to your cart", item row (photo, name, "2 × ₹55", serif line total), free-delivery line "Add **₹120** more for free delivery in Surat" with orange progress bar (or "You get free delivery in Surat" when ≥ ₹499), buttons **Keep shopping** (outline, closes) and **View cart · {count}** (dark, opens cart). Auto-closes after 5 s; pauses while hovered/focused.
- **Phone:** dark toast at the bottom (above the cart bar): check icon, "**Garlic Press added**" / "2 × ₹55 · View cart from the bar below", **Undo** (restores the cart exactly as before). Auto-hides after 5 s.
- Cart badge and sticky cart bar update instantly.

### F6. Sending to WhatsApp (single item or cart)
1. Tap creates the message (format in §9) and opens `https://wa.me/16474096236?text=…` in a new tab (fallback: same tab if blocked).
2. At the same time the **"Opening WhatsApp…"** dialog shows [Modal-popup-toast refrences/Opening-whatsapp.png]: dark top band with orange chat circle, Anton "OPENING WHATSAPP…", "Your order is already typed in."; steps 1 "Below the list, write your name, Surat address and phone." 2 "Press Send in WhatsApp." 3 "We reply to confirm. Pay cash when it arrives."; "Didn't open?" with **Copy order text** (outline) and **Try again** (orange); link "Back to shop · your cart is saved" (cart orders) / "Back to shop" (single item).
3. **Copy order text** → copies the message → toast **"Order text copied · Paste it in a chat with +1 647 409 6236." + "Open WhatsApp"** [Toast.png, third].
4. If opening WhatsApp failed (popup blocked and no navigation) → toast **"Couldn't open WhatsApp · Copy the order and paste it in WhatsApp." + "Copy order"** [Toast.png, second].
5. Message URL longer than ~2000 characters → first drop numbering and ids; if still too long, split into "Order part 1 of 2…" with one send button per part inside this dialog.

### F7. Cart
Opened from the header cart button, "View cart · n" in the popover, or the text part of the sticky cart bar.
- **≥768px:** right-side drawer over the dimmed page [Modal-popup-toast refrences/Cart-drawer.png]. **Phone:** full-screen page with a **← Back** pill next to "Your *cart*" (styleguide "cart · 360").
- Top: serif "Your *cart*" + Close pill. Free-delivery card: truck icon + "Add **₹120** more for free delivery in Surat" + orange progress bar; at ≥ ₹499: "You get free delivery in Surat" (sage).
- Each item card: photo, name, mono `NO. 012 · ₹55 × 2`, serif line total; stepper (48); "✎ Add note" (or the saved note text); **Remove** (danger outline).
- Footer (dark, rounded top): "Total · 4 items" + big total; "Delivery charge confirmed on WhatsApp. Pay cash at your door." (or "Free delivery. Pay cash at your door." at ≥ ₹499); big orange **Send order on WhatsApp** → F6 with the whole cart.
- Empty cart → styleguide empty state "Your cart is *empty*" + **Start shopping** (closes cart, scrolls to catalogue).
- Cart stored as `[{id, qty, note}]`; names/prices always from the current catalogue; items that disappeared or went out of stock are dropped with one toast.

### F8. Notes
"✎ Add note" → inline textarea (styleguide note input, placeholder "e.g. blue colour please", counter `0 / 120`) with Save. Save → toast **"Note saved · Magic Towel · "blue colour please"" + Undo** (sage) [Toast.png, fourth]. Note appears in the cart row and in the WhatsApp message.

### F9. Remove item
**Remove**, or "−" when qty is 1 → **Remove dialog** [Modal-popup-toast refrences/Remove-item.png]: item thumb, mono `NO. 038 · ₹50 × 1`, name, serif "Remove this *from your cart?*", "Your note "blue colour please" will be removed too." (only if a note exists), buttons **Keep it** (dark, focused) and **Yes, remove** (danger outline). Yes → item removed, cart re-renders.

### F10. Coming back after sending the cart
When a cart order was sent and the customer returns to the tab (visibility change or reload) → **Did-you-send dialog** [Modal-popup-toast refrences/Did-you-send.png]: mono `WELCOME BACK`, serif "Did you press *Send* in WhatsApp?", summary "4 items in your order · ₹379", "If yes, we'll clear your cart. We'll reply on WhatsApp to confirm your order.", **✓ Yes, I sent it · clear cart** (dark) and **Not yet · keep my cart** (outline). Yes → cart cleared, toast "Thanks! We'll reply on WhatsApp soon." Not for single-item orders.

### F11. Delivery area
Tap the header "Delivering across Surat" pill, any area chip on Home/About, or the "Delivering in Surat" card → **Do-we-deliver dialog** [Modal-popup-toast refrences/Do-we-deliver.png]: sage header with mono `DELIVERY AREA`, serif "Do we deliver *to you?*", "Right now we deliver only inside Surat city.", Close pill; "Tap your area" selectable pills (areas + **Other area**).
- Area chosen → dark result bar: orange check + "**Yes, we deliver to Vesu.** Free above ₹499, cash on delivery." + orange **Start shopping** (closes, scrolls to catalogue). Area is remembered; header pill becomes "Delivering to Vesu"; the WhatsApp message adds "Area: Vesu".
- **Other area** → result bar: "**We may not reach you yet.** Message us and we'll check." + orange **Message us** (WhatsApp "Hi BAZARIYAA, do you deliver to my area? Area: ").
- Footer line: "Outside Surat? Message us and we'll tell you when we reach your city." ("Message us" = WhatsApp link).

### F12. Language
Header globe pill → **Language dialog** [Modal-popup-toast refrences/Languages.png] (bottom sheet on phones): serif "Language · *भाषा · ભાષા*", Close; three cards EN English / HI हिंदी / GU ગુજરાતી (current = dark with orange "● CURRENT", label "Current language"); note "Item names and prices stay the same in every language, so phone orders always match." Choosing → UI text switches, `<html lang>` updates, Noto font loads, dialog closes. Footer `EN / हिं / ગુ` switches directly.

### F13. Order by number (home card)
Typing a number in the sage card's input shows the live match "Panda Night Lamp · ₹290" (or "No item with that number"); the dark arrow → Quantity dialog in Buy mode.

### F14. Return-policy picker
Tapping an option card on the Return page → it becomes selected (dark + orange check) and the answer card below updates (badge, title, text) with a short fade. Keyboard: option cards are radio buttons.

---

## 9. WhatsApp message (exact)

Cart order:
```
Hello BAZARIYAA!
I want to order these items:

1. Garlic Press (#12)
   ₹55 × 2 = ₹110
2. Magic Towel (#38)
   ₹50 × 1 = ₹50
   Note: blue colour please

TOTAL AMOUNT: ₹379
Delivery: Free                 <- when total ≥ 499
Delivery: To be confirmed      <- otherwise
Area: Vesu                     <- only if the customer picked an area

My Name:
Address:
Phone:
```
Single item from the Quantity dialog: same format with one line. Always English product names. Totals from current prices.

---

## 10. Languages

`js/i18n.js` holds `{ en, hi, gu }` dictionaries for every UI string; HTML uses `data-i18n` / `data-i18n-attr`. English strings = exactly the copy in the images. Hindi and Gujarati = complete machine-drafted versions, marked `// MACHINE-DRAFTED, NEEDS NATIVE REVIEW`. Long policy/terms text stays English. Numbers stay Western digits with ₹.

---

## 11. How to work

1. **First reply = plan only.** Look at every image listed in §1, read this file fully, then reply with: your understanding (5–8 lines), the file plan, anything in the images you can't read or that contradicts this prompt, and your questions. Write no code until I say **go**.
2. Build in this order. After each step stop, tell me what to check, and wait:
   - **M1** Tokens, fonts, icons, base styles, header/footer/cart bar shell, config, data loading with the 10 demo products, product card (all states).
   - **M2** Home page sections 1–13 matching `01-home.png` at 1280px and the styleguide at 360px.
   - **M3** Quantity dialog/sheet, add-to-cart popover/toast, cart drawer/page, notes, remove dialog, WhatsApp send + Opening WhatsApp + Did-you-send, all toasts.
   - **M4** Search overlay, photo viewer, out-of-stock dialog, do-we-deliver, language dialog, offline/config states.
   - **M5** About, Return policy (both halves), Terms.
   - **M6** Hindi/Gujarati.
   - **M7** QA: compare each page and dialog with its image side by side at 1280px and 360px (also check 768px and 412px); keyboard-only run; 200% zoom; no horizontal scroll; no console errors; reduced motion. Give me a list of every remaining difference.
3. Never invent features beyond this prompt (no accounts, payments, analytics, admin page). Never hard-code the phone number outside `config.json`.
4. Keep the code readable and commented; report honestly what you could not match or test.
