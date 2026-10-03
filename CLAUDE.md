# CLAUDE.md — BAZARIYAA

Standing rules for this project. Full details are in `BUILD_BRIEF.md`; the visual designs are in `design/`.

## What this is
BAZARIYAA ("Ghar Ka Bazaar") is a mobile-first product catalogue for an Indian household shop. Customers browse 400+ items, keep a cart in their browser, and send the order as a pre-filled WhatsApp message. No accounts, payment, database or backend. Hosted on GitHub Pages. Cash on delivery and shipping happen off-site.

## Who it is for
Indian families, many older and not tech-savvy, on cheap Android phones and slow networks. The owner is a non-developer who updates products by editing a Google Sheet.

## Stack (do not add to it without asking)
- Plain HTML, CSS, vanilla JavaScript. No framework, no build step.
- PapaParse (CDN, pinned version) for CSV. Nothing else.
- Data: published Google Sheet CSV (`config.json` -> `sheetCsvUrl`), fallback `data/products.csv`.
- Settings: `config.json`. State: `localStorage` (cart, language), always in try/catch.

## Rules
1. Plan first, wait for "go", then work milestone by milestone (M0–M7 in BUILD_BRIEF.md). Commit after each one and stop for review.
2. The PNGs in `design/` decide how it looks; BUILD_BRIEF.md decides how it behaves. Ask when they conflict or are unclear. Never edit `design/`.
3. Never invent products, prices, phone numbers, policy text or final translations.
4. No hard-coded phone number anywhere except via `config.json`. Do not copy any old number from `legacy/`.
5. Relative paths only (works under a GitHub Pages sub-path).
6. Escape all CSV text before putting it in the DOM. No inline `onclick`. Use event delegation.
7. Senior-friendly: text ≥ 16px, tap targets ≥ 48px, WCAG AA contrast, visible focus, no hover-only actions.
8. Buy Now never changes the cart. The cart stores only `{id, qty, note}` and reads prices from the current catalogue.
9. WhatsApp message format is fixed in BUILD_BRIEF.md section 12.
10. Do not build anything not in scope (no admin panel, login, payment, analytics, PWA).
11. Keep code simple and commented for a beginner. Report plainly, including what you could not verify.

## Folders
`index.html`, `about.html`, `return-policy.html`, `terms.html` · `css/` · `js/` · `data/` · `images/` · `design/` · `tools/` · `legacy/` (old prototype, owner deletes later)

## Run locally
`fetch()` needs a server: run `python -m http.server 8000` in the project folder and open `http://localhost:8000`.

## Languages
English, Hindi, Gujarati via `js/i18n.js`. Hindi and Gujarati strings are machine-drafted and must be marked "needs native review".
