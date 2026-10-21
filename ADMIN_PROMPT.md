# BAZARIYAA — Admin Panel, Phase 2 (Cursor build brief)

Read this whole file before writing code. Build in the milestones at the bottom, and stop after each one so I can test it.

## 0. What this is

The storefront is done. `admin-panel.html` + `js/admin.js` + `css/admin.css` currently has only a fake login, with username and password hardcoded in JS. Turn it into a real admin panel where the shop owner can manage products, images and site settings without touching code.

There is no backend. The GitHub repo is the database. The admin panel reads and writes files in the repo through the GitHub REST API. GitHub Pages redeploys after each publish.

## 1. Hard rules (do not break)

- **Stack:** plain HTML, CSS and vanilla JS (ES5-style IIFE modules, same as the existing `js/*.js`). No frameworks, no npm, no build step, no TypeScript, no bundler, no Tailwind.
- **Libraries:** the only library allowed is PapaParse 5.4.1 from cdnjs (already used). Image compression uses `<canvas>` and needs no library. GitHub calls use `fetch` and need no Octokit.
- **No secrets in code, ever.** Delete the hardcoded `USERNAME` and `PASSWORD` from `js/admin.js`.
- **Reuse the design system:** `css/tokens.css` and `base.css` (Anton, Geist, colours, radii). The admin should look like part of BAZARIYAA, but plain and functional, with a dense table layout. Make it mobile-first, because the owner will mostly use his phone. Breakpoints are 360 / 768 / 1200.
- **Keep the storefront working at every milestone.** Every new field must be optional, and old CSV files and old `config.json` must still load.
- **No `alert()`, `confirm()` or `prompt()`.** Use the existing dialog/toast styles (`css/dialogs.css`).
- **Comments in plain English**, matching the existing style.

## 2. URL and files

- Create `adminpanel/index.html` so the panel lives at `/adminpanel/`. Use relative paths (`../css/...`, `../js/...`), because GitHub Pages serves from a subpath.
- Replace `admin-panel.html` with a tiny redirect to `adminpanel/`.
- Add `<meta name="robots" content="noindex">` to the panel, and add `Disallow: /adminpanel/` to `robots.txt`. Create `robots.txt` if it doesn't exist.
- New JS modules in `js/admin/`:

  | File | What it does |
  |---|---|
  | `github.js` | API wrapper |
  | `auth.js` | Token login |
  | `store.js` | Draft state, undo, validation |
  | `products.js` | Product list, search, edit form |
  | `bulk.js` | Bulk actions |
  | `images.js` | Upload, compression, URL images |
  | `settings.js` | Shop, theme, logo, delivery, areas, categories |
  | `io.js` | CSV import and export |
  | `publish.js` | Commit to GitHub |
  | `app.js` | Tabs and boot |

- Put admin-only styles in `css/admin.css`.

## 3. Single source of truth

- **Products:** `data/products.csv`. Move `Product sheets - Products.csv` there and set `fallbackCsv` to `data/products.csv`.
- **Settings:** `config.json`.
- **Product images:** `images/products/<id>-<n>.webp`.
- **Logo:** `images/logo.<svg|png|webp>`.
- **Google Sheet override:** if `config.sheetCsvUrl` is not empty, the storefront loads the Google Sheet first, so admin product edits would be ignored. The admin must show a clear warning banner when `sheetCsvUrl` is set, with a one-click "Use the admin panel as the source (clear Sheet URL)" button.

## 4. Login (replace the fake one)

- **Login form fields:** "GitHub access token" (password input) and a "Remember on this device" checkbox.
- **Repo settings:** stored in `config.json`:
  ```json
  "admin": { "repoOwner": "", "repoName": "", "branch": "main" }
  ```
- **Verify the token** with `GET /repos/{owner}/{repo}`. Accept it only if the response has `permissions.push === true`.
- **Error messages, in plain words:**
  - Bad token: "This token doesn't work."
  - No access: "This token can't edit this shop's files."
  - Network: "No internet."
- **Token storage:** `sessionStorage` by default, `localStorage` only if "Remember" is ticked. Never put the token in a URL, a log or `console`.
- **Sign out** clears both storages and the in-memory state.
- **Help link** under the form, "How do I get a token?", that opens a short help dialog with these steps: GitHub → Settings → Developer settings → Fine-grained tokens → only this repo → Contents: Read and write → copy and paste.

## 5. GitHub layer (`github.js`)

- Every call sends:
  - `Authorization: Bearer <token>`
  - `Accept: application/vnd.github+json`
  - `X-GitHub-Api-Version: 2022-11-28`
- **Read files from the API** (contents endpoint plus base64 decode, UTF-8 safe for Hindi and Gujarati text), not from the Pages URL, so the admin always sees the latest saved version.
- **Publish is one atomic commit** using the Git Data API:
  1. Get the branch ref sha.
  2. Get that commit's tree sha.
  3. Create blobs for each changed file (base64 for images, utf-8 for CSV and JSON).
  4. Create a tree with `base_tree`.
  5. Create a commit with message `Admin: <summary>`.
  6. PATCH the ref.

  Deleted images go into the tree with `sha: null`.
- **Conflict check:** remember the branch head sha at load time. Before publishing, if the head has moved, stop and show: "Someone changed the shop since you opened this page. Reload to get the latest, then redo your changes." Offer to download the current draft as CSV so nothing is lost.
- **Error handling:** handle 401, 403, 404, 409, 422 and rate limit, each with a plain message.

## 6. Draft model (`store.js`)

- On load, parse `data/products.csv` with PapaParse into objects and parse `config.json`. Keep both as the "published" snapshot and a "draft" copy.
- Every edit changes only the draft. Show a sticky bottom bar: "N unsaved changes · Discard · Publish".
- **Autosave the draft** to `localStorage` (`bazariyaa-admin-draft`), not the token. On reload, if a draft exists and is based on the same head sha, offer "Restore unsaved changes?"
- **Undo:** keep a stack of the last 20 actions. One bulk action is one undo step. Add a visible Undo button and Ctrl/Cmd+Z.
- **Validation before publish** (block publishing and list the problems; clicking one jumps to that product):
  - `id` is unique and not empty.
  - `name` is not empty.
  - `price` is a number greater than 0.
  - `sale_price` is empty or a number with 0 < sale_price < price.
  - `category` is not empty.
  - Image URLs are https or `images/...`.
- **CSV output:** `Papa.unparse` with a fixed column order (section 7), UTF-8 with no BOM, `\n` line endings.

## 7. Product columns

Existing columns, keep all of them:

```
id, name, description, price, category, images, in_stock, popular, most_ordered, name_hi, name_gu
```

Add these at the end. All are optional, and old CSVs without them must still load:

| Column | Meaning |
|---|---|
| `sale_price` | Discounted price in ₹. Empty means no discount. |
| `hidden` | `Y` hides the product from the storefront without deleting it |
| `areas` | Pipe-separated area names where this product can be ordered. Empty means all areas. |
| `max_qty` | Per-product quantity limit. Empty means use `config.maxQtyPerItem`. |
| `sort` | Number. Lower shows first inside its category. Empty goes last. |

## 8. Products tab (`products.js`)

- **Search box**, live and debounced 150 ms. It matches id, name, description, `name_hi` and `name_gu`, is case-insensitive and ignores extra spaces.
- **Filters** (chips/selects), combinable:
  - Category
  - In stock / Out of stock
  - Popular
  - On sale
  - Hidden
  - **No image**, which is important: it finds products with an empty `images` column
  - Changed in this draft
- **Sort by:** id, name, price, category, recently changed.
- **List layout:**
  - Mobile: cards with thumbnail, name, `#id`, price (sale price shown as strikethrough), and stock and visible toggles inline.
  - ≥768px: a table with sticky header.
  - Both: checkbox per row, plus a "select all N filtered" checkbox.
  - Paginate or virtualise at 50 rows. The CSV can have 600+ products and must stay smooth on a cheap Android phone.
- **Quick inline edits** with no dialog: in stock toggle, hidden toggle, price, sale price.
- **Full edit form** (side drawer on desktop, full-screen sheet on mobile):
  - Text fields: name, description, name_hi, name_gu.
  - Numbers: price, sale price, plus a "% off" helper that fills the sale price.
  - Category: dropdown from `config.categories`, plus a "+ New category" option.
  - Switches: in stock, popular, hidden.
  - Ranks and limits: most-ordered rank, sort, max qty.
  - Areas: multi-select from the configured areas, with "All areas" as the default.
  - Image manager (section 10).
  - Buttons: Save to draft, Cancel, Duplicate product, Delete (with a confirm dialog).
  - Show a live preview of how the product card will look on the storefront, reusing storefront card markup and classes.
- **Add product** button. The new id is the next free number.

## 9. Bulk edit (`bulk.js`)

- When 1 or more rows are selected, show a bulk bar: "N selected · Actions ▾ · Clear".
- **Actions:**
  - Set in stock / out of stock
  - Set popular on / off
  - Hide / show
  - Change category
  - Price: set to ₹X, change by ±₹X, or change by ±X% (round to the nearest ₹1, and give an option to round to the nearest ₹5 or ₹9 ending)
  - Discount: set sale price to X% off, or clear sale price
  - Set areas (replace, add or remove)
  - Set max qty
  - Find & replace in name or description (case-sensitive toggle)
  - Delete
- Every bulk action opens a preview dialog first. It shows how many products change and a before → after table for the first 10. Then the owner confirms. The whole action is one undo step.
- After applying, keep the selection so the owner can chain actions.

## 10. Images (`images.js`)

- **Per product, up to 6 images.** Image 1 is the main photo. Owner can reorder by drag on desktop or up/down buttons on mobile, and remove any image.
- **Upload from device:** file input with `accept="image/*"`; on phones it should offer the camera. Also support drag-and-drop on desktop.
  - Compress in the browser with canvas: max 800×800 (keep aspect ratio and contain, no crop), WebP quality 0.8, falling back to JPEG if WebP isn't supported. If the result is still over 200 KB, step quality down to 0.6.
  - Reject the file if the source is not an image or is over 15 MB.
  - Name it `images/products/<id>-<n>.webp`. The image is staged in the draft as base64 and only committed on Publish. Show it immediately from an object URL.
- **Add by URL:** paste an https image URL. Test-load it in an `<img>` first; if it fails, show "This link isn't an image."
- **Missing images view:** a "Needs photos (N)" shortcut that opens the "No image" filter and steps through those products one by one: upload or paste, then Next.
- When a product or image is deleted, its repo image file is deleted in the publish commit, but only if no other product uses it.
- **Size guard:** total repo images should stay well under 1 GB. Show the total size of `images/products/` in Settings (from the tree API) and warn above 500 MB.

## 11. Settings tab (`settings.js`), all saved to `config.json`

Sub-sections, each a card:

1. **Shop:** shop name, tagline, city, WhatsApp number (validate 8–15 digits and show a "Test WhatsApp link" button), currency symbol.
2. **Logo:** current logo preview. Upload SVG, PNG or WebP, saved to `images/logo.<ext>`, which sets `config.logo`. Also allow upload of a separate favicon (`config.favicon`).
3. **Colours:** colour pickers for `accent`, `band`, `bg`, `surface`, `text` (defaults are the current `tokens.css` values).
   - Save to `config.theme`.
   - Show a live mini preview of a product card and a button.
   - Warn, without blocking, if text/background contrast is below 4.5:1.
   - Add "Reset to default".
4. **Delivery:** free delivery above ₹X, and default delivery charge.
5. **Areas:** an editable list. Each area has name, delivery charge (₹, empty means "to be confirmed"), free-delivery minimum (overrides the global one), and an active toggle. Owner can add, remove and reorder. Save as `config.areas = [{ "name", "charge", "freeAbove", "active" }]`.
6. **Categories:** move the hardcoded `CATEGORIES` array out of `js/data.js` into `config.categories = [{ "id", "label", "tag", "order", "visible" }]`. Owner can rename the label (the id stays the same), reorder, hide, and add new ones.
   - **Note:** the current `CATEGORIES` ids ("Kitchen & Dining", etc.) do not match the CSV category values ("Kitchen", "Cleaning", "Bathroom & Personal Care", etc.). Build the initial `config.categories` from the categories actually used in the CSV, so nothing breaks.
   - Block deleting a category that still has products. Offer to move them first.
7. **Catalogue behaviour:** popularCount, showMoreStep, maxQtyPerItem, noteMaxLength, defaultLanguage, enabled languages.
8. **Data source:** `sheetCsvUrl`, with the warning from section 3.

## 12. Import and export (`io.js`)

- **Export:**
  - Download the current draft as `bazariyaa-products-YYYY-MM-DD.csv`.
  - Also offer "Download backup" (CSV plus `config.json` as two downloads).
- **Import CSV:**
  - Parse it with PapaParse.
  - Show a column-mapping step if the headers don't match exactly. Auto-match by name and ignore case and spaces.
  - Then a preview: "X new, Y updated, Z unchanged, W rows with errors" (errors listed with row numbers).
  - Modes:
    - **Update and add** (upsert by id, the default)
    - **Replace all** (with a strong confirm)
    - **Only update existing**
  - Empty cells in the import do not wipe existing values in update mode, unless "Empty cells clear values" is ticked.
- Import goes into the draft only. Nothing is committed until Publish.

## 13. Publish (`publish.js`)

- Publish button opens a summary: "12 products changed, 3 images added, 1 removed, settings changed." Show an optional message field.
- Commit everything in one commit (section 5). Show progress: "Uploading images 2/3 → Saving → Done".
- After success, show: "Published. The shop will update in about 1–2 minutes." Add a link to open the shop. Reset the draft to the new published state and store the new head sha.
- On failure, nothing is half-saved, because the commit is atomic. The draft stays intact.

## 14. Storefront changes (must stay backward-compatible)

- **`js/config.js`:**
  - Merge the loaded config over the defaults instead of replacing them, so missing keys don't break the site.
  - Fetch `config.json` with `{ cache: 'no-cache' }`.
  - Normalise `areas`: a plain string array still works and becomes `{ name, charge: null, freeAbove: null, active: true }`.
- **Theme:** on load, if `config.theme` exists, set the matching CSS custom properties on `:root`.
- **Logo:** if `config.logo` is set, use it in the header, footer and favicon instead of `images/Logo.svg`.
- **`js/data.js`:**
  - Read the new columns.
  - Filter out `hidden === 'Y'` products everywhere: list, search, popular and cart restore.
  - Use `sort` within a category.
  - Read categories from `config.categories`, falling back to the current behaviour.
- **Sale price:**
  - Product card and viewer show the sale price big and the old price struck through, plus a small "−X%" tag using the accent colour.
  - Cart, cart total, the free-delivery check and the WhatsApp message all use the sale price.
  - WhatsApp line format: `Name (#id) ₹sale × qty = ₹total`. Append `(was ₹price)` only on the line item.
- **Areas:**
  - Only active areas show in the area picker.
  - The delivery line in the WhatsApp message uses the chosen area's charge and free-above rule. If the charge is empty, it says "To be confirmed".
  - If a cart item isn't available in the chosen area (product `areas` column), show it in the cart with "Not delivered to <area>" and leave it out of the order total and the message.
- **`max_qty`:** per-product, overriding the global maximum in the quantity dialog.
- Fetch `data/products.csv` with `{ cache: 'no-cache' }` too.

## 15. Security notes (put these in README)

- The token is the only lock. Use a fine-grained token, limited to this one repo, with Contents read/write only and an expiry.
- If the phone is lost, revoke the token on GitHub.
- Anyone can read the admin page code. That is fine because it holds nothing secret.

## 16. Milestones (stop after each, list what changed and how to test)

| # | Milestone | Done when |
|---|---|---|
| A1 | `/adminpanel/` route, token login, GitHub read, sign out, Sheet-URL warning | I can log in with a token and see "Loaded 70 products, config OK" |
| A2 | Products tab: search, filters, list, quick toggles, full edit form, add, duplicate, delete, draft bar, undo, autosave | Edits survive a page reload as a draft |
| A3 | Publish (atomic commit, conflict check, validation) | A change goes live on Pages in about 2 minutes |
| A4 | Images: upload and compress, URL, reorder, remove, "Needs photos" flow | A phone photo becomes a WebP under 200 KB in `images/products/` |
| A5 | Bulk edit with preview and undo, plus CSV import and export | 50 products get 10% off in one action and one undo reverts it |
| A6 | Settings tab (shop, logo, colours, delivery, areas, categories, behaviour) and all storefront changes in section 14 | Changing the accent colour and an area charge shows on the live site and in the WhatsApp message |

After A6: test on a 360px-wide phone screen, test with 600+ products, and confirm the storefront still loads with the old CSV and old `config.json`.
