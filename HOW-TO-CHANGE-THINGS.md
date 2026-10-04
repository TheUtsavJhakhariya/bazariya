# How to change things (plain guide)

Everything is in this folder:
`C:\Users\Utsav Jhakhariya\OneDrive\Desktop\SELF PROJECTS\Bazariya\Revamp Bazariya`

All files are plain text. Open them in **Notepad** or **VS Code** (right-click the file → Open with). Save, then refresh the browser to see the change. Nothing needs to be "built" or "compiled".

---

## Seeing the site

**Double-click `Start BAZARIYAA.bat`.** Your browser opens the site. Keep the black window open while you look, and close it when you're done.

Why not just double-click `index.html`? Browsers don't let a page read files (the product list, the settings) when it is opened straight from the disk. The page opens, but with no products and a message telling you to use `Start BAZARIYAA.bat`. Once the site is on the internet (GitHub Pages), this problem disappears.

---

## The pages

| Page | File |
|---|---|
| Home (products, search, cart) | `index.html` |
| About us | `about.html` |
| Return policy | `return-policy.html` |
| Terms & conditions | `terms.html` |

---

## "I want to change…" → open this file

| I want to change… | File | What to do |
|---|---|---|
| **WhatsApp number** | `config.json` (line 4) | `"whatsappNumber": "+1 6474096236"` → type the new number between the quotes. Include the country code. |
| **Free delivery amount** (₹499) | `config.json` (line 5) | Change `499`. The cart bar, top strip and WhatsApp message all update. |
| **Products per "Show more"** | `config.json` (line 10) | Change `24`. |
| **Products, prices, categories, in stock** | `data/products.csv`, or your Google Sheet once connected | Open in Excel or Google Sheets. One row = one product. Set `in_stock` to `N` for sold out. |
| **Connect the Google Sheet** | `config.json` (line 7) | Paste the "Publish to web" CSV link between the quotes of `"sheetCsvUrl": ""`. See README section 3. |
| **Product photos** | `images/` folder | Add `154.webp` for product number 154. No code change needed. |
| **About / Return / Terms text** | `about.html`, `return-policy.html`, `terms.html` | Search (Ctrl + F) for the sentence and edit the words between the tags, e.g. `<p>edit this text</p>`. Don't delete the `<` `>` parts. |
| **Any button or label wording** ("Buy now", "Add to cart", "Cash on delivery"…) | `js/i18n.js` | English starts at line 18, Hindi at line 179, Gujarati at line 325. Find the line, e.g. `buyNow: "Buy now",`, and change only the text inside the quotes. Change it in all 3 languages. |
| **Colours** | `css/styles.css` (top, lines 10–60) | e.g. `--color-accent: #FF8A3D;` is the orange. Change the code after the colon. One change updates the whole site. |
| **Fonts** | `css/styles.css` (around line 66) | `--font-display` = big titles (Anton), `--font-sans` = normal text (Geist). |
| **Text sizes** | `css/styles.css` (around lines 75–95) | e.g. `--text-price: 20px;`. Keep normal text at 16px or more for older customers. |
| **Shop name in the WhatsApp greeting** | `config.json` (line 2) | `"shopName": "BAZARIYAA"`. |
| **Which languages are offered** | `config.json` | `"languages": ["en", "hi", "gu"]`. Remove one to hide it. |

**Rule for `config.json`:** keep the quotes `" "` around text and the comma `,` at the end of each line (except the last). If the file breaks, the site falls back to safe defaults and shows "Shop number is not set". That means there's a typo in `config.json`.

---

## What each code file does (you rarely need these)

| File | In one line |
|---|---|
| `css/styles.css` | How everything looks. Colours, fonts and sizes are at the top. |
| `js/i18n.js` | Every word on screen, in English, Hindi and Gujarati. |
| `js/config.js` | Reads `config.json`. |
| `js/data.js` | Loads the product list (Sheet first, then `data/products.csv`) and skips bad rows. |
| `js/catalogue.js` | Search, category buttons, product cards, "Show more". |
| `js/popup.js` | The "How many?" popup. |
| `js/cart.js` | The cart (saved on the customer's phone) and the cart panel. |
| `js/whatsapp.js` | Writes the WhatsApp order message. |
| `js/order.js` | "Opening WhatsApp…" and "Did you press Send?". |
| `js/language.js` | The language picker. |
| `js/ui.js`, `js/shell.js` | Shared helpers: popups, small messages, header/footer details. |
| `js/app.js`, `js/page.js` | Start everything (home page / info pages). |
| `tools/serve.js` | The small local server that `Start BAZARIYAA.bat` runs. |
| `tools/convert-products.js` | One-off tool that turned your old Sheet export into `data/products.csv`. |

Every code file starts with a comment explaining what it does, in plain English.

---

## If you break something

Everything is saved in git, so any change can be undone. Ask Claude: *"undo my last change to config.json"*, or *"go back to the last commit"*.
