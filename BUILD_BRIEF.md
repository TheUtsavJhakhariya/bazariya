# BAZARIYAA — Master Build Brief

Audience: Claude Code (the coding agent). Read this whole file, then `CLAUDE.md`, then every image in `design/`, then the existing files in the project, before you do anything else.

---

## 0. How to work (read first)

1. **Plan before code.** Your first reply must be a SHORT build plan plus a list of questions. Do not write or change any code until the owner says "go".
2. **Work in milestones (section 20).** After each milestone: say what changed, how to test it, list anything that differs from the designs, then make a git commit. **Stop and wait** for the owner before starting the next milestone.
3. **Never invent facts.** No made-up products, prices, phone numbers, addresses, policy text or translations presented as final. Use placeholders and list them in your final report.
4. **The designs are the source of truth for how it looks.** This brief is the source of truth for how it behaves. If they conflict, or something is unclear, ask. Do not guess silently.
5. **Keep it simple.** The owner is not a developer. Prefer boring, readable code with comments over clever code. No feature that is not listed here.
6. **Be honest in reports.** If you could not match a design detail, could not test something, or made an assumption, say so plainly.

---

## 1. The project in one paragraph

BAZARIYAA ("Ghar Ka Bazaar", meaning "the home's market") is a mobile-first product catalogue for a household shop in India. Customers browse 400+ everyday items, add them to a cart kept in their browser, and tap a button that opens WhatsApp with a ready-made order message. There is no account, no payment page, no database and no server. Cash on delivery and shipping are handled by the shop outside the website. It is hosted free as a static site on GitHub Pages.

## 2. Why it exists

The shop owner wants an online "brochure" so customers can see what is available and send an order in one tap, without the cost and complexity of a full e-commerce platform. The shop's stock changes often, so the owner must be able to update products without a developer.

## 3. Who uses it

- **Customers:** Indian families, many older or not tech-savvy, buying kitchen, bathroom, cleaning, car, lighting, kids, storage and gadget items priced roughly ₹5 to ₹1,000. Typical device: an inexpensive Android phone (about ₹8,000), often on a slow or patchy network.
- **Owner/admin:** one person who edits a Google Sheet to add, remove or change products and prices. The owner is comfortable with spreadsheets but not with code.

## 4. Decision filter (use this when something is unspecified)

1. **Clarity for non-technical, older users** beats cleverness. If a screen needs explaining, simplify it.
2. **Lightweight** beats feature-rich. Fewer files, fewer requests, less JavaScript.
3. **Owner can update the catalogue alone.** Anything that forces the owner to edit code to change products is wrong.
4. **No surprises, no dark patterns.** No fake urgency, no hidden costs, no auto-adding of items.
5. **Fail gently.** Missing image, bad row, offline Google, empty config: the site must still work and say what is wrong in plain language.

## 5. Scope

**In scope:** catalogue with search + category filter + paging; product cards; quantity popup; cart; free-shipping hint; WhatsApp order message; out-of-stock labels; loading/empty/error states; About, Return Policy and Terms pages; English/Hindi/Gujarati UI; config file; Sheet-driven data with repo fallback; README; GitHub Pages readiness.

**Out of scope (do not build):** accounts or login, payment, checkout form, address/phone fields in the cart, admin panel, backend or database, analytics, reviews, wishlist, coupons, order history, push notifications, service worker/PWA (maybe later, not now).

## 6. Technical constraints (hard)

- Plain **HTML, CSS, vanilla JavaScript (ES2018+ is fine)**. No framework. No build step. No npm needed to run the site.
- The only third-party library: **PapaParse** (CSV parsing), loaded from a CDN with a pinned version. If you believe another library is truly necessary, ask first.
- Must work when hosted on **GitHub Pages**, including under a sub-path such as `https://user.github.io/bazariya/`. Use **relative paths** only. Never start a path with `/`.
- **Mobile-first.** Design for 360px width. Also verify 412, 768 and 1280 widths.
- Works in current Chrome, Firefox, Safari, Edge, and in Android WebView/Chrome of roughly the last 3 years. Avoid very new CSS/JS features without a fallback.
- No inline `onclick`/`onerror` attributes. Use `addEventListener` and event delegation.
- `fetch()` does not work from `file://`. That is acceptable; the README must explain how to run a local server (`python -m http.server`, or VS Code Live Server).

## 7. Current state of the project folder

The folder already contains an earlier prototype: `index.html`, `about.html`, `return-policy.html`, `terms.html`, `styles.css`, `script.js`, `products.js`, `README.md`.

Known problems you must NOT carry over:
- `products.js` contains ~175 **made-up** products that do not match the real catalogue. Delete it. Nothing may depend on it.
- Product images point to `via.placeholder.com`, which no longer works.
- The WhatsApp number is hard-coded in several places (`index.html` top bar, footer, `script.js`). **Remove every hard-coded number.** Do not copy the old number into any new file. The number lives only in `config.json`, which the owner will fill in.
- "Buy Now" deletes the existing cart line and resets its quantity. Replace with the new popup flow (section 11.3).
- The cart stores the price at the time of adding, so later price changes never apply. Store only id/qty/note (section 13).
- Product cards show the serial and the name twice.
- Category assignment guesses from keywords in the browser. Move categories into the data (section 9).
- `script.js` has repeated "try again to initialise" timers, `typeof window.products` checks and inline `onclick` handlers. Rewrite cleanly.
- `<html lang="hi">` while all text is English; the footer says © 2024; "Free Shipping above ₹499" is advertised but never used in the cart.
- `README.md` describes the old prototype.

**First action in M0:** move all the old files into a `legacy/` folder (keep them for reference; the owner will delete the folder at the end). Review `about.html`, `return-policy.html` and `terms.html` text and list anything that looks wrong, outdated or inconsistent with this brief. Do not rewrite policy text yourself; flag it.

## 8. Design inputs

- Chosen screens are PNG files in `design/`, numbered in order (for example `01-home.png`, `02-product-card.png`, `03-quantity-popup.png`, `04-cart.png`, and so on). Do not modify, rename or delete anything in `design/`.
- If `design/design-notes.md` exists, read it. It records which variant was chosen per screen and any tweaks, and it **overrides the PNGs** where it says so explicitly.
- Look at every image before planning. Extract: colors, fonts, type scale, spacing, border radius, shadows, button/chip/input styles, icon style, and the exact layout of each screen.
- Starting palette used by the old prototype (use only if the PNGs do not show otherwise): background `#F8F9FB`, card `#E1ECF7`, primary `#83B0E1`, add-to-cart `#AECBEB`, price red `#E74C3C`, font Poppins. If any text/button color pair fails WCAG AA contrast, tell the owner and propose the nearest passing color.
- If a screen has no PNG (for example info pages or some states), reuse the design system and keep it consistent. Say which screens you had to extrapolate.
- Put all design tokens in CSS custom properties at the top of the stylesheet (`--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--tap-min: 48px`).

---

## 9. Data

### 9.1 Source of truth
Products live in a **Google Sheet published as CSV**. The site fetches that CSV at load time. A copy in the repo (`data/products.csv`) is the fallback.

### 9.2 Final schema (one header row, these exact column names)

| column | required | meaning |
|---|---|---|
| `id` | yes | The shop's serial number (S.N.). Integer, **not contiguous**, unique. Customers can search by it. |
| `name` | yes | Product name as shown to customers. |
| `description` | no | Short text, can be empty. |
| `price` | yes | Number in INR, no symbol. Commas like `1,599` must be tolerated. |
| `category` | yes | One value from the fixed list below. |
| `image` | no | Filename inside `images/` (for example `154.webp`) **or** a full `https://` URL. |
| `in_stock` | yes | `Y` or `N` (case-insensitive; also accept `yes/no/true/false/1/0`). |
| `name_hi`, `name_gu` | no | Optional translated names. Columns may be absent entirely. |

Rules:
- Skip fully blank rows and rows with no `id` or no `name`.
- Trim whitespace on every field. Handle a UTF-8 BOM, quoted commas and CRLF line endings.
- If `image` is empty, try `images/{id}.{imageExtension}` (extension from config). If that fails to load, show the placeholder.
- Rows with an invalid or missing `price`, or a duplicate `id`, must not crash the site. Skip them from the visible catalogue and `console.warn` a one-line summary (not one line per row).
- Escape all text from the CSV before inserting into HTML (`textContent` or a small escape helper). Validate `image` URLs: allow only relative paths under `images/` or `https://` URLs.

### 9.3 Fixed category list
`Kitchen`, `Cleaning`, `Bathroom & Personal Care`, `Car`, `Lights & Electronics`, `Kids & Toys`, `Bags & Storage`, `Home & Wall Decor`, `Umbrellas & Rain`, `Health & Massagers`.

The category list on screen is built from the categories actually present in the data, in the order above. Unknown categories are shown after the known ones.

### 9.4 Loading order
1. Read `config.json`.
2. If `sheetCsvUrl` is non-empty, fetch it (with a timeout of about 8 seconds). On success, use it.
3. Otherwise, or on failure, fetch `data/products.csv`.
4. If both fail, show the friendly error state with a Retry button.
5. Add a cache-busting query parameter only if you can show it is needed; otherwise rely on normal caching. Tell the owner that Google may take a few minutes to publish edits.
6. Verify that a Google "Publish to web" CSV link can be fetched cross-origin from a different domain. If you cannot test this from your environment, say so clearly in the M4 report so the owner can test it.

### 9.5 One-off conversion (milestone M1)
The owner provides `data/products-raw.csv` with three columns (`S.N.`, `Product Name`, `Price (INR)`), a title line above the header, a few blank rows, a price written as `360/400`, and some duplicate-looking names. Write a one-off script in `tools/` (Python or Node, whichever you prefer; keep it dependency-free if possible) that produces:

- `data/products.csv` in the final schema. Set `in_stock=Y`, `image` and `description` empty, `category` assigned by keyword rules (hints below).
- `data/data-report.md` listing: rows skipped and why; non-numeric prices (such as `360/400`) **not guessed, left out of the visible catalogue**; probable duplicates (same normalized name with different ids or prices); per-category counts; the count of products that fell into the fallback category.
- `data/categories-review.csv` (id, name, assigned category) so the owner can review and correct categories in the Sheet.

Category keyword hints (a starting point, not a spec; check the real names in the file, avoid obvious misfires, and list uncertain ones in the report):
- **Car:** name contains "car", "bike", "vehicle", "headrest", "fuel", "tyre/tire", "fast tag". Check this first, because "Car Cleaning Duster" is a car item, not a cleaning item.
- **Umbrellas & Rain:** umbrella, raincoat, rain cover, rain card.
- **Lights & Electronics:** lamp, light, led, torch, solar, clock, cable, charger, speaker, mic, bluetooth, usb, projector, fan, cooler, humidifier, lighter (electric), kettle, electric, grinder.
- **Kids & Toys:** kids, kid, baby, toy, pop it, art set, drawing, game, chess, domino, slingshot, doll, balloon, puzzle, lunch bag with cartoon/barbie.
- **Health & Massagers:** massager, massage, hot water bag, ice bag, heating pad, sugar control, pill box, knee, eye mask, nose strip, migraine.
- **Bathroom & Personal Care:** soap, toothbrush, toothpaste, loofah, bath, shower, hair (dryer/straightener/trimmer/wax), shaver, razor, eyebrow, nail, makeup, face, comb, wipes (personal), derma, scalp.
- **Cleaning:** mop, brush, cleaner, cleaning, scrubber, sponge, duster, stain, drain, detergent/tablet, glass cleaner, broom, wipes.
- **Kitchen:** garlic, chopper, peeler, cutter, spatula, apron, tawa, kadai, pan, pot, dispenser (oil), lunch box, tiffin, bottle, flask, mug, cup, glass, juicer, ice tray, masala, strainer, stove, scale, kettle, coffee, tea, spice, fridge.
- **Bags & Storage:** bag, storage, box, basket, organizer, rack, hanger, cover (saree/AC/washing machine/TV), pouch, trolley.
- **Home & Wall Decor:** marble, foil, wallpaper, sticker, hook, diya, rangoli, door stopper, tape, frame, decor, mat.
- **Fallback:** "Home & Wall Decor" is only the last resort. Report how many products landed there.

Priority matters: evaluate in a sensible order (Car and Umbrellas first, generic words like "bag", "box", "mat" last) and describe your order in the report.

---

## 10. Config (`config.json`)

All site-wide settings live here. Nothing below may be hard-coded elsewhere.

```json
{
  "shopName": "BAZARIYAA",
  "tagline": "Ghar Ka Bazaar",
  "whatsappNumber": "",
  "freeShippingAbove": 499,
  "currencySymbol": "₹",
  "sheetCsvUrl": "",
  "fallbackCsv": "data/products.csv",
  "imageExtension": "webp",
  "pageSize": 24,
  "maxQtyPerItem": 99,
  "defaultLanguage": "en",
  "languages": ["en", "hi", "gu"]
}
```

- `whatsappNumber`: digits with country code, for example `91XXXXXXXXXX`. It is an **empty placeholder**; the owner will fill it. Accept input with `+`, spaces or dashes and normalize to digits.
- If `whatsappNumber` is empty or invalid: show a clear banner ("Ordering is not set up yet") and disable every send/order button. Do not open a broken WhatsApp link.
- The trust strip and footer render the number from config, formatted nicely for display (for example `+91 XXXXX XXXXX`), and link with `tel:` and `https://wa.me/...`.
- If `config.json` fails to load, use safe built-in defaults and show the same banner.

---

## 11. Screens and behaviour

Match the PNGs for visuals. This section defines behaviour.

### 11.1 Home / catalogue (`index.html`)
- **Trust strip** (top): Cash on Delivery · Free shipping above ₹X (from config) · WhatsApp number (tap to call/chat).
- **Header:** logo/shop name + tagline, language switcher, cart button with item-count badge (count of total quantity, hidden when 0).
- **Search:** large input, always visible near the top, clear (×) button, `type="search"`, proper label.
- **Category chips:** "All" first, then categories. Horizontally scrollable on mobile with the active chip clearly marked. Chip counts are optional; only add them if the design shows them.
- **Product grid:** as in the design (likely 2 columns on 360px).
- **Paging:** show `pageSize` products, then a "Show more" button that appends the next batch and moves focus sensibly. Show "Showing X of Y".
- **Ordering:** by `id` ascending; in-stock products first, out-of-stock after (owner can change this later).
- **Result announcements:** update a polite live region ("48 products found").

### 11.2 Product card
- Image (lazy-loaded, fixed aspect ratio to prevent layout shift, `alt` = product name), name (wraps to a maximum of 2–3 lines with ellipsis; the full name appears in the popup), price, optional one-line description if the design shows it, the product number as a subtle label (for example `#154`), and two buttons: **Buy Now** and **Add to Cart**.
- **Out of stock:** card stays visible, image slightly dimmed, an "Out of stock" label, both buttons disabled (with `disabled` and visible disabled styling, not just opacity).
- Tapping the image or the name opens the same quantity popup (without choosing an action yet) if the design shows that; otherwise only the buttons open it.

### 11.3 Quantity popup (bottom sheet on mobile, centered modal on desktop)
- Opens from **Buy Now** or **Add to Cart**. Shows product image, name, price, quantity stepper (− / value / +), live line total, and two buttons:
  - **Order on WhatsApp** → builds a message for **this item only** at the chosen quantity and opens WhatsApp. **Does not touch the cart.**
  - **Add to Cart** → adds the chosen quantity to the cart (increasing the existing quantity if already present), closes the popup, and shows a short confirmation ("Added to cart") with the cart badge updating.
- Minimum quantity 1, maximum `maxQtyPerItem`. The quantity field accepts typing digits too (numeric keypad on mobile) and clamps invalid input.
- If opened via the Buy Now button, "Order on WhatsApp" is the visually primary button; if opened via Add to Cart, "Add to Cart" is primary. Both are always present.
- Close with ×, Escape key, tapping the backdrop, or the Android back button (push a history state when opening and close on `popstate`).
- Accessibility: `role="dialog"`, `aria-modal="true"`, labelled by the product name, focus moves into the dialog, focus is trapped, focus returns to the triggering button on close, page scroll is locked while open.

### 11.4 Cart (drawer or page, as designed)
- Opens from the header cart button; closes with ×, Escape, backdrop or the Android back button (same history approach).
- Each row: image, name, unit price, quantity stepper, line total, **Remove** button (clear label, not just an icon), optional **note** field (short text, max about 120 characters) with a visible label such as "Add a note (optional)".
- Footer: total amount; **free-shipping line** — if below the threshold: "Add ₹X more for free shipping" with a progress bar; if at or above: "You get free shipping"; the big **Send Order on WhatsApp** button.
- Empty cart state: friendly message and a "Browse products" button that closes the cart. The send button is disabled when empty.
- **No form fields for name, address or phone.** The customer types those in WhatsApp.
- Removing an item should offer a brief "Undo" in the confirmation message if it is simple to build; if it adds complexity, skip it and tell the owner.

### 11.5 States
- **Loading:** skeleton cards (simple CSS shimmer; respect `prefers-reduced-motion`).
- **No results:** plain message, the current search term, and a "Clear search" action.
- **Load failed:** friendly message and a Retry button. No raw error text.
- **Missing image:** the placeholder from the design (an inline SVG or a small local file; no external service).
- **Config problem (no WhatsApp number):** banner as described in section 10.

### 11.6 Info pages
- `about.html`, `return-policy.html`, `terms.html` share the same header, footer, tokens and layout as the home page, with a readable single column. Language switcher works on them too (UI chrome translated; the long legal text stays in English unless the owner supplies translations).
- Shop name, number and year come from config/JS (the footer year is computed).
- Keep the existing body text unless the owner says otherwise, but list inconsistencies you find.

### 11.7 Footer
Quick links (All Products, About, Return Policy, Terms), contact (number from config, WhatsApp link), a short "why choose us" list as designed, and the copyright line with the current year.

---

## 12. WhatsApp message specification

Link: `https://wa.me/<digits only>?text=<encodeURIComponent(message)>`, opened with `window.open(url, "_blank", "noopener")`; if the popup is blocked, fall back to `location.href`. Show a brief "Opening WhatsApp…" confirmation.

**Cart order message (exact structure):**

```
Hello BAZARIYAA!
I want to order these items:

1. <name> (#<id>)
   ₹<unit price> × <qty> = ₹<line total>
   Note: <note>            <- only if a note exists
2. ...

TOTAL AMOUNT: ₹<total>
Shipping: Free             <- when total >= freeShippingAbove
Shipping: To be confirmed  <- otherwise

My Name:
Address:
Phone:
```

- Use the shop name from config in the greeting.
- Single-item "Order on WhatsApp" from the popup uses the same structure with one line.
- Use the product name in English (`name`), even when the UI is in Hindi or Gujarati, so the shop can match it to stock. Include the `#id`.
- Total = sum of unit price × quantity, from the **current catalogue prices**, rounded to whole rupees for display. Use integer paise-safe maths if prices can have decimals.
- **Length safety:** very long URLs can be truncated by browsers/WhatsApp (limits vary). Measure the encoded URL length. If it exceeds a safe threshold (propose one in your plan, around 2,000 characters), first try a compact variant (drop numbering and the `#id`), and if still too long, split into parts ("Order part 1 of 2") with a separate send button per part and a clear explanation. Describe your chosen approach in the plan and test it with a 40-item cart.
- Do not add the customer's personal details; they type them in WhatsApp.

---

## 13. Cart rules

- Storage: `localStorage` key `bazariya_cart_v1`, value = array of `{ id, qty, note }` only. Wrap every `localStorage` access in try/catch; if storage is unavailable (private mode), keep the cart in memory and the site still works.
- Names, prices, images and stock are always looked up from the **current catalogue**. This way price changes in the Sheet apply to returning customers.
- When loading: drop items whose product no longer exists or is now out of stock, clamp quantities to `maxQtyPerItem`, and show one gentle message ("Some items in your cart are no longer available and were removed").
- Adding an existing id increases its quantity (capped). Changing quantity to 0 removes the line.
- Keep the badge, popup, cart and storage in sync from one small state module (no duplicated state).
- Optional: sync across tabs with the `storage` event.

## 14. Search, filter, paging

- Search is case-insensitive, trims whitespace, ignores extra spaces, and matches `name`, `id`, `category`, `description` (and `name_hi`/`name_gu` when present). Split the query into words; every word must match somewhere (AND).
- An exact id match (for example `154`) ranks first.
- Debounce input by ~150–200 ms.
- Search and category filter combine. Changing either resets paging to the first batch.
- Clearing the search restores the full list for the active category.
- Keep the active category and search text when the cart/popup is opened and closed.

## 15. Languages (English, Hindi, Gujarati)

- `js/i18n.js` holds a dictionary `{ en: {...}, hi: {...}, gu: {...} }` for all UI strings and uses `data-i18n` / `data-i18n-attr` attributes in HTML plus a `t(key, vars)` function in JS (for example for "Add ₹X more for free shipping").
- Persist the choice in `localStorage` (with try/catch). Set `<html lang>` to `en`, `hi` or `gu` on every change.
- Provide complete Hindi and Gujarati translations for every UI string. Mark them clearly as **"machine-drafted, needs native review"** in a comment and in your final report. Do not claim they are final.
- Fonts: Poppins for English. Load **Noto Sans Devanagari** and **Noto Sans Gujarati** from Google Fonts only when the user selects that language (inject the stylesheet on demand), with `font-display: swap`.
- Layout must tolerate longer labels in Hindi/Gujarati: buttons wrap or grow rather than overflow, and no fixed-width text containers.
- Numbers and currency stay in Western digits with `₹`. Product names come from `name_hi`/`name_gu` if present, else `name`.
- Long legal text on info pages stays English for now.

## 16. Accessibility (non-negotiable)

- Body text ≥ 16px; important text (price, buttons) ≥ 18px; line height ~1.5.
- Tap targets ≥ 48×48px with ≥ 8px spacing between neighbours.
- WCAG AA contrast (4.5:1 for normal text, 3:1 for large text and UI components).
- Visible focus outline on every interactive element; logical tab order; no keyboard traps except the intentional dialog trap.
- Real `<button>`, `<a>`, `<label>`, `<h1>`–`<h3>` structure, `<main>`, `<nav>`, `<footer>`; skip link to main content.
- No information by color alone (for example out-of-stock has a text label).
- Respect `prefers-reduced-motion`.
- No hover-only features. No gestures required (no swipe-only actions).
- Supports browser zoom to 200% without breaking layout.

## 17. Performance

- No render-blocking third-party scripts except what is necessary; load PapaParse with `defer`.
- Lazy-load product images (`loading="lazy"`, `decoding="async"`, explicit width/height or aspect-ratio).
- Render products in batches; use event delegation (one listener on the grid, not per card).
- Keep total JS small and split by responsibility (section 19). No large inline base64 assets.
- Target: first meaningful content on a throttled "Slow 4G, mid-range phone" profile in a few seconds; no layout jumps; no console errors.

## 18. Robustness and security

- Never use `innerHTML` with unescaped CSV data. Build DOM with `textContent` or a vetted escape helper.
- `rel="noopener"` on external links.
- The site must never throw an uncaught error because of bad data; each failure path has a user-friendly message (section 11.5).
- No secrets or keys in the repo. (There are none in this project; keep it that way.)
- Do not embed any real phone number in source files other than via `config.json`.

---

## 19. File structure (propose changes in the plan if you disagree)

```
index.html
about.html
return-policy.html
terms.html
config.json
css/
  styles.css              (tokens + base + components; split only if it helps)
js/
  config.js               (load config, defaults, validation)
  data.js                 (load + parse + validate CSV, fallback)
  catalogue.js            (search, filter, paging, render grid)
  popup.js                (quantity popup)
  cart.js                 (cart state, storage, cart UI)
  whatsapp.js             (message builder, link opener, length handling)
  i18n.js                 (dictionary, language switching)
  app.js                  (startup wiring)
data/
  products.csv            (final schema)
  products-raw.csv        (owner's original export, untouched)
  data-report.md
  categories-review.csv
images/
  placeholder.svg
  .gitkeep
design/                   (owner's PNGs and notes, untouched)
tools/
  convert-products.(py|js)
legacy/                   (old prototype files; owner deletes later)
README.md
CLAUDE.md
BUILD_BRIEF.md
```

`README.md` must cover: what the project is; how to run locally; how to edit products in the Sheet (columns, dropdowns, Y/N); how to publish the Sheet as CSV and where to paste the link; every `config.json` field; how to add images (`images/<id>.webp`, or a URL in the `image` column, and the recommended size ~600px and under ~60 KB); how to deploy on GitHub Pages; and the known limits (Google publish delay, WhatsApp URL length).

---

## 20. Milestones

**M0 — Plan (no code).** Read everything. Move old files to `legacy/`. Reply with: your understanding in 5–8 lines, the plan, any conflicts between PNGs and this brief, the list of questions, the length-safety threshold you propose, and the list of screens with no PNG. Wait for "go".

**M1 — Data.** Conversion script, `data/products.csv`, `data/data-report.md`, `data/categories-review.csv`, `config.json` with placeholders. *Accept when:* the CSV opens cleanly in a spreadsheet, every row has a valid category, bad rows are listed in the report, and no phone number appears anywhere.

**M2 — Base + catalogue.** Tokens and base CSS, header/trust strip/footer, search, chips, grid, product cards, paging, all states (loading, no results, error, missing image, out of stock). *Accept when:* it matches the home and card PNGs at 360px, search by name and by id works, "Show more" works, nothing overflows, and there are no console errors.

**M3 — Popup, cart, WhatsApp.** Quantity popup, cart, free-shipping line, message builder, length handling, no-number banner. *Accept when:* both popup actions work as specified, Buy Now never alters the cart, the message matches section 12 exactly, a 40-item cart is handled safely, and the Android back button closes popups.

**M4 — Sheet loading.** Sheet CSV with timeout and fallback, error states, documented caching behaviour, CORS note. *Accept when:* an empty `sheetCsvUrl` uses the fallback, a bad URL falls back with a small notice in the console (not a broken page), and both failing shows Retry.

**M5 — Info pages and README.** Shared layout for About/Return/Terms, footer, README. *Accept when:* pages match the design system and all links work under a sub-path.

**M6 — Languages.** `i18n.js`, switcher, Hindi and Gujarati strings, on-demand fonts. *Accept when:* every UI string switches, layouts hold with the longest strings, and `<html lang>` updates.

**M7 — QA and handover.** Run the checklist in section 21, fix what you can, and give a final report: what matches the designs, what differs and why, placeholders still needed, translation review needed, and recommended next steps. Do not delete `legacy/` yourself.

---

## 21. QA checklist (run in M7, and spot-check after each milestone)

- [ ] 360px, 412px, 768px, 1280px: no horizontal scroll, no overlapping text, grid and popup look right.
- [ ] Browser zoom 200%: still usable.
- [ ] Keyboard only: can search, filter, open popup, change quantity, add to cart, open cart, send order; focus is visible and returns correctly.
- [ ] Contrast checked for text/buttons/chips/disabled states.
- [ ] Search: name, partial name, id, category word, wrong case, extra spaces, no results.
- [ ] Out-of-stock card: cannot be added or ordered.
- [ ] Popup: min/max quantity, typed input, total updates, both actions, Esc/backdrop/back button.
- [ ] Cart: add, increase, decrease, remove, note, persistence after reload, price changed in CSV then reload (cart shows new price), removed product disappears with a message.
- [ ] WhatsApp message text is exactly per section 12; free vs. "to be confirmed" shipping line is correct at 498, 499 and 500; very long cart is handled.
- [ ] Empty `whatsappNumber`: banner shown, buttons disabled, nothing breaks.
- [ ] Sheet URL empty / wrong / valid; fallback works; both failing shows Retry.
- [ ] CSV edge cases: BOM, quoted commas, blank lines, `1,599`, bad price, duplicate id, missing image, `in_stock` variants.
- [ ] Hindi and Gujarati: all strings switch, fonts load only when chosen, no layout breaks, `lang` attribute updates.
- [ ] Works from a sub-path (simulate by serving the folder inside a subfolder).
- [ ] No console errors or warnings beyond the intentional one-line data summary.
- [ ] No hard-coded phone number anywhere (`grep` for digit patterns).
- [ ] Images lazy-load; a 400-product list scrolls smoothly on a throttled profile.

## 22. Placeholders the owner must provide

- `whatsappNumber` in `config.json`.
- The published Sheet CSV link (`sheetCsvUrl`).
- Product photos (`images/<id>.webp` or URLs).
- Review of the auto-assigned categories (`data/categories-review.csv`) and the rows in `data/data-report.md`.
- Native review of Hindi and Gujarati strings.
- Review of About, Return Policy and Terms text.

## 23. Defaults chosen (tell the owner if you change any)

Sort by id with in-stock first; 24 products per batch; max 99 per item; note limit ~120 characters; free-shipping threshold ₹499; shipping below the threshold is "To be confirmed" in the message; product names in WhatsApp stay English; legal pages stay English; categories as listed; image extension `webp`; Android back button closes popups.

## 24. How to report

Keep reports short and in plain language for a non-developer: what you did, how to test it (exact steps), what differs from the designs, what you assumed, what you need from the owner. Use a list of file paths for what changed. Always end with the single next step you recommend.
