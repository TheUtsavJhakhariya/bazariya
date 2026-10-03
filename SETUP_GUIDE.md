# BAZARIYAA — Setup Guide (for you, the owner)

This is the human guide. `BUILD_BRIEF.md` and `CLAUDE.md` are for Claude Code. Follow the steps in order.

---

## Part 1 — Get your Google Sheet ready (15 minutes)

Your current sheet has 3 columns (S.N., Product Name, Price). The final site uses 7. You can do this now or after the first build; Claude Code will convert the old export first.

**Final columns (row 1, exact names, lowercase):**

| id | name | description | price | category | image | in_stock |
|---|---|---|---|---|---|---|

Optional, for later: `name_hi`, `name_gu`.

**Add the dropdowns:**
1. Select the whole `category` column (without the header). Open **Data → Data validation → Add rule**. Choose **Dropdown**, and add these 10 items: Kitchen, Cleaning, Bathroom & Personal Care, Car, Lights & Electronics, Kids & Toys, Bags & Storage, Home & Wall Decor, Umbrellas & Rain, Health & Massagers.
2. Select the `in_stock` column. Add a dropdown rule with two items: `Y`, `N`.
3. For the `price` column, use a rule that accepts numbers only.

**Entering products:**
- `id` is your S.N. number. It must be unique. Gaps are fine.
- `price` is a number only (no ₹, no `360/400`).
- `image` can be left empty. If you leave it empty, the site looks for `images/<id>.webp`. Otherwise type a filename or a full `https://` link.

**Publish it (do this when the site is ready for the live link):**
1. **File → Share → Publish to web**.
2. In the **Link** tab, choose your sheet tab (not "Entire document") and **Comma-separated values (.csv)**.
3. Click **Publish**, confirm, and copy the link.
4. Paste it into `config.json` as `sheetCsvUrl`.
5. After that, edits in the Sheet show up on the site after a few minutes (Google caches the published file).

Remember: anyone with the link can read a published sheet. Keep private notes out of it.

---

## Part 2 — Prepare the project folder (10 minutes)

Your folder is `Bazariya` (the one you already have). Add these:

```
Bazariya/
  BUILD_BRIEF.md        <- from me
  CLAUDE.md             <- from me
  design/               <- you create this
    01-home.png
    02-product-card.png
    03-quantity-popup.png
    04-cart.png
    05-states.png       <- loading / no results / error / out of stock
    06-info-page.png
    design-notes.md     <- you write this (template below)
  data/
    products-raw.csv    <- your current Sheet exported as CSV
```

**How to export a design screen:** from Claude Design, download each screen you chose as PNG. Name them with a number first so the order is clear. Use the final chosen variant only. Leave the rejected ones out; keeping them in the folder only confuses the coding agent.

**How to export the Sheet:** **File → Download → Comma-separated values (.csv)**, rename it `products-raw.csv`, and put it in `data/`.

**Tip:** if Claude Design offers an HTML or CSS export or a "handoff" option for a screen, save that into `design/reference/`. It gives Claude Code exact values for colors and spacing.

### `design/design-notes.md` template (copy, fill, save)

```
# Design notes

Chosen variants
- Home: variant ___ (file 01-home.png)
- Product card: variant ___ (02-product-card.png)
- Quantity popup: variant ___ (03-quantity-popup.png)
- Cart: variant ___ (04-cart.png)
- States: (05-states.png)
- Info pages: (06-info-page.png)

Look and feel
- Main color: ___   Accent: ___   Font: ___
- Mood in one line: ___

Changes I want compared with the PNGs
- (example) Make the search bar taller
- (example) Use the cart layout from variant B but keep the free-shipping bar from variant C

Things that must not change
- (example) Buy Now and Add to Cart stay side by side on the card
```

---

## Part 3 — Run Claude Code (first time)

1. Open **Claude Code** (the desktop app or your terminal) and open your `Bazariya` folder as the project. Claude Code works inside that folder: it can read and edit the files there.
2. Check that it sees `BUILD_BRIEF.md`, `CLAUDE.md` and the `design/` folder. If not, you opened the wrong folder.
3. Paste this as your first message, and attach the PNGs if the app lets you (it can also read them from `design/`):

```
Read CLAUDE.md and BUILD_BRIEF.md completely, then look at every image in design/ (and design/design-notes.md if it exists), then look at the existing files in the project. Do not change or create any files yet. Reply with milestone M0 only: your understanding, a short plan, anything in the designs that conflicts with the brief, and your questions.
```

4. Read its reply. Answer its questions in plain language. If you are happy, reply: **"go with M0 cleanup and then M1."**
5. It will ask permission before editing files or running commands. Read what it wants to do, and approve it if it makes sense. If you do not understand a command, ask it: "Explain what this does in simple words."
6. After each milestone it will stop and tell you how to test. **Test it yourself** (Part 4), then either say "approved, continue to M2" or tell it what is wrong.

**Rules of thumb**
- One milestone at a time. Do not let it build everything in one go.
- If a result looks wrong, take a screenshot and paste it: "This is what I see. It should look like 04-cart.png. Fix the differences."
- Be specific. "The price is too small, make it 20px bold" beats "make it nicer".
- If a change makes things worse, ask it to undo to the last commit.

---

## Part 4 — How to test each milestone

Run a local server (a browser cannot read the CSV from a double-clicked file):
1. Open a terminal in the Bazariya folder.
2. Run `python -m http.server 8000`. (Or use the VS Code "Live Server" extension.)
3. Open `http://localhost:8000` in Chrome.
4. Press **F12**, then the phone icon ("device toolbar"), and pick a small phone (for example 360 wide). This is how most customers will see it.

What to look for:

| Milestone | Check |
|---|---|
| M1 Data | Open `data/products.csv` in a spreadsheet. Skim `data-report.md` and `categories-review.csv`. Fix wrong categories and bad prices in your Sheet. |
| M2 Catalogue | Looks like your PNGs at phone width. Search for a word and for a number (like 154). Filter by category. "Show more" works. |
| M3 Popup + cart | Buy Now opens the popup. "Order on WhatsApp" opens WhatsApp with one item and does not touch the cart. "Add to Cart" adds. Cart totals and the free-shipping line are right (try just under and over ₹499). The WhatsApp text matches the format in the brief. |
| M4 Sheet | Paste your published link into `config.json`, reload, and change a price in the Sheet. After a few minutes the site shows the new price. |
| M5 Pages | About, Return Policy and Terms look consistent. Read their text yourself. |
| M6 Languages | Switch to Hindi and Gujarati. Ask a native speaker to review the wording. |
| M7 QA | Read the final report. Fix the placeholders listed. |

You will need to fill in `whatsappNumber` in `config.json` before WhatsApp buttons work (a banner reminds you).

---

## Part 5 — Photos

- You can launch without photos; cards show a placeholder.
- When you have photos: resize them to about 600 px wide and under about 60 KB each (WebP is best), name each file by product id (for example `154.webp`) and put them in `images/`.
- Easiest bulk method: ask Claude Code to write a small script that resizes and renames a folder of photos, or use a free tool such as Squoosh for a few at a time.
- Alternative: put a full `https://` image link in the `image` column. Do not use Google Drive share links; they break.

---

## Part 6 — Put it online (GitHub Pages)

1. Create a free GitHub account if you do not have one, then a new **public** repository (for example `bazariya`).
2. In your project folder, ask Claude Code: "Make sure the project is committed and tell me the exact commands to push it to my new GitHub repository." It will give you something like:
   ```
   git branch -M main
   git remote add origin https://github.com/<your-username>/bazariya.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → / (root) → Save**.
4. After a minute or two your site is live at `https://<your-username>.github.io/bazariya/`.
5. Test it on your own phone. Place a real test order to your WhatsApp.
6. Delete the `legacy/` folder when you are happy, and commit again.

---

## Part 7 — Everyday use after launch

- **Add or change products:** edit the Sheet. Wait a few minutes.
- **Change the WhatsApp number, free-shipping amount or page size:** edit `config.json` and push to GitHub (you can edit the file in the GitHub website and click "Commit changes").
- **Add photos:** upload them to `images/` on GitHub (Add file → Upload files).
- **Mark something sold out:** set `in_stock` to `N`.

---

## Quick fixes

| Problem | Likely cause and fix |
|---|---|
| Page is blank or "products failed to load" | You opened `index.html` by double-clicking. Use the local server (Part 4). Or both the Sheet link and `data/products.csv` are missing. |
| WhatsApp buttons are grey and a banner shows | `whatsappNumber` in `config.json` is empty. Enter it with country code, for example `91XXXXXXXXXX`. |
| My Sheet edit does not show | Google caches the published file for a few minutes. Wait, then hard-refresh. |
| A product is missing | It has no valid price, a duplicate id, or no name. Check `data-report.md` and the browser console. |
| Wrong category | Fix it in the `category` column of the Sheet. |
| Photo not showing | The file name must match the id (for example `154.webp`) and live in `images/`. Check capital letters; GitHub Pages is case sensitive. |
| Hindi/Gujarati looks wrong | The strings are machine-drafted. Ask someone fluent to review `js/i18n.js`. |
| The site looks different from the design | Paste a screenshot to Claude Code with the PNG name and ask it to fix only the differences. |
