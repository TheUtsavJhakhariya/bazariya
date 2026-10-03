# BAZARIYAA – Ghar Ka Bazaar

A simple online catalogue for a household shop. Customers browse the products, put them in a cart that is saved on their own phone, and press one button to send the order to the shop on WhatsApp. Payment is cash on delivery.

There are no accounts, no online payment and no server. The site is a set of plain files hosted for free on GitHub Pages. You change products by editing a Google Sheet.

---

## 1. Try it on your computer

Browsers block the product list when you double-click `index.html`, so start a small local server first.

**Option A: Node.js.** This needs nothing else installed.

```
node tools/serve.js
```

Then open <http://localhost:8000>. Press **Ctrl + C** in the terminal to stop it.

**Option B: Python, if it is installed:** `python -m http.server 8000`

**Option C:** the VS Code extension "Live Server". Right-click `index.html` and choose **Open with Live Server**.

To see the phone layout in Chrome, press **F12**, click the phone icon, and pick a 360-pixel-wide phone.

---

## 2. Products: the Google Sheet

### Columns
Row 1 must have exactly these names, in lowercase:

| column | needed? | what to put |
|---|---|---|
| `id` | yes | Your S.N. number. Must be unique. Gaps are fine. Customers can search by it. |
| `name` | yes | Product name, shown on the site and sent in the WhatsApp order. |
| `description` | no | One short line. It shows in the quantity popup. |
| `price` | yes | A number only, such as `290` or `1599`. No ₹ and no `360/400`. |
| `category` | yes | One of the 10 categories below. |
| `image` | no | Leave empty to use `images/<id>.webp`, or type a file name or a full `https://` link. |
| `in_stock` | yes | `Y` or `N`. |
| `name_hi`, `name_gu` | no | Hindi or Gujarati name. Shown when the customer picks that language. Orders still use the English name. |

**Categories (use these exact spellings):** Kitchen, Cleaning, Bathroom & Personal Care, Car, Lights & Electronics, Kids & Toys, Bags & Storage, Home & Wall Decor, Umbrellas & Rain, Health & Massagers.

### Make mistakes hard (dropdowns)
1. Select the `category` column, not the header. Go to **Data → Data validation → Add rule → Dropdown** and add the 10 categories.
2. Select the `in_stock` column and add a dropdown with `Y` and `N`.
3. For the `price` column, add a rule that accepts numbers only.

### What happens with bad rows
A row with no id, no name, a price that isn't a number, or an id used twice is **left out** of the site. The site still works. Press F12 and open the "Console" tab to see a one-line summary of how many rows were skipped.

### First import
`data/products.csv` was made from your old export by `tools/convert-products.js`. Before importing it into the Sheet, check these two files:
- `data/data-report.md`: rows left out, probable duplicates, and items with unsure categories.
- `data/categories-review.csv`: every item with its category, so you can correct them.

To import, go to **File → Import → Upload** in Google Sheets, choose `data/products.csv`, then **Replace current sheet**.

---

## 3. Connect the Sheet to the site

1. In the Sheet, go to **File → Share → Publish to web**.
2. On the **Link** tab, choose your products tab (not "Entire document") and **Comma-separated values (.csv)**.
3. Click **Publish** and copy the link. It starts with `https://docs.google.com/spreadsheets/d/e/…/pub?…output=csv`.
4. Paste it into `config.json` as `"sheetCsvUrl": "…"`.

**Good to know**
- After you edit the Sheet, **wait about 5 minutes**. Google refreshes the published copy on its own schedule, so the site cannot make it faster.
- If the Sheet link is empty, wrong, or Google is slow (more than 8 seconds), the site quietly uses `data/products.csv` from this folder instead. Keep that file roughly up to date as a backup: **File → Download → CSV**, save it as `data/products.csv`, and upload it to GitHub.
- Anyone with the link can read a published Sheet. Keep private notes out of it.

---

## 4. Settings: `config.json`

| setting | meaning |
|---|---|
| `shopName` | Name used in the WhatsApp greeting ("Hello BAZARIYAA!"). |
| `tagline` | Shown under the logo. |
| `whatsappNumber` | **Fill this in.** Your WhatsApp number with country code, such as `91XXXXXXXXXX`. Spaces, `+` and `-` are fine. While it is empty, a banner says "Shop number is not set" and all order buttons are switched off. |
| `freeShippingAbove` | Free delivery from this amount (₹). Used in the cart bar and the WhatsApp message. |
| `currencySymbol` | `₹`. |
| `sheetCsvUrl` | The published Sheet link from section 3. Leave `""` to use only `data/products.csv`. |
| `fallbackCsv` | The backup product file. Leave as `data/products.csv`. |
| `imageExtension` | Photo type used for `images/<id>.<ext>`. Default `webp`. |
| `pageSize` | How many products show before "Show more". Default 24. |
| `maxQtyPerItem` | Highest quantity per product. Default 99. |
| `defaultLanguage` | `en`, `hi` or `gu`: the language for first-time visitors. |
| `languages` | Which languages can be picked. Remove one to hide it. |

---

## 5. Photos

- Name each photo with the product id, such as `154.webp`, and put it in the `images/` folder. Capital letters matter: `154.WEBP` will not be found.
- Aim for about **600 × 600 pixels and under 60 KB**. WebP is best; the free website **Squoosh** (squoosh.app) can convert and shrink photos.
- Or put a full `https://` photo link in the `image` column. Do **not** use Google Drive share links; they don't load.
- Without a photo, the card shows a grey box icon. Until photos are added, the browser console lists a "404" for each missing photo. This is expected and harmless.

---

## 6. Put it online (GitHub Pages)

1. Create a free GitHub account and a new **public** repository, for example `bazariya`.
2. Push this folder to it. The `legacy/` folder is excluded on purpose because it holds the old phone number.
   ```
   git branch -M main
   git remote add origin https://github.com/<your-username>/bazariya.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages → Build and deployment → Deploy from a branch → main → / (root) → Save**.
4. After a minute or two, the site is live at `https://<your-username>.github.io/bazariya/`.
5. Test it on your own phone by sending a real order to yourself.

To change something later (number, delivery amount, photos), edit the file on the GitHub website and click **Commit changes**. The site updates in about a minute.

---

## 7. How ordering works

- **Buy now** opens the quantity popup. "Order now on WhatsApp" sends **only that item** and never changes the cart.
- **Add to cart** adds the item. The cart is saved on the customer's phone and survives closing the browser.
- The cart always uses **today's prices** from the Sheet, so price changes apply to old carts too. Items that are deleted or set to `N` drop out of carts with a short message.
- **Send order on WhatsApp** opens WhatsApp with the order typed in. The customer adds name, address and phone below it and presses Send. When they come back, the site asks "Did you press Send?" and empties the cart on Yes.
- The message always uses English product names and item numbers, so you can match them to stock.
- **Very long orders:** links longer than about 2,000 characters can be cut off by phones. Long orders are first shortened (numbers and ids dropped). If still too long, they are split into "Order part 1 of 2", "part 2 of 2", each with its own Send button.

---

## 8. Languages

English, Hindi and Gujarati. The customer picks one with the globe button or **EN / हि / ગુ** in the footer, and the choice is remembered.

- All wording is in `js/i18n.js`. **The Hindi and Gujarati text was machine-drafted and must be checked by a fluent speaker** before launch.
- Product names stay in English unless you fill the `name_hi` / `name_gu` columns.
- The About, Return Policy and Terms text stays in English.

---

## 9. What is where

```
index.html            home page: search, categories, products, cart
about.html            About us
return-policy.html    Return policy
terms.html            Terms & conditions
config.json           settings (section 4)
css/styles.css        all styles; colours, fonts and sizes are at the top
js/i18n.js            all on-screen words in 3 languages
js/config.js          reads config.json
js/data.js            loads the Sheet / CSV and checks each row
js/catalogue.js       search, categories, product cards, "Show more"
js/popup.js           quantity popup
js/cart.js            cart (saved on the phone) and the cart drawer
js/whatsapp.js        builds the WhatsApp message, long-order splitting
js/order.js           "Opening WhatsApp…", "Did you press Send?"
js/language.js        language picker
js/ui.js, shell.js    shared popup/toast helpers, header and footer details
js/app.js, page.js    start-up for the home page / the info pages
data/                 products.csv (backup list), reports from the converter
images/               product photos (<id>.webp) and placeholder.svg
tools/                convert-products.js (one-off), serve.js (local server)
legacy/               old prototype, kept on this computer only; delete when happy
```

---

## 10. Known limits

- Google takes a few minutes to publish Sheet edits.
- Whether WhatsApp opens with the text depends on the customer's phone. If it doesn't, the "Opening WhatsApp…" popup offers **Copy order text**.
- Very long orders are split into several messages (section 7).
- The site needs internet to load products the first time; there is no offline mode.
- Hindi and Gujarati wording needs a native review.
