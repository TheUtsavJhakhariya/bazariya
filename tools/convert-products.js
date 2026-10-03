/*
 * convert-products.js — ONE-OFF converter for the owner's old product export.
 *
 * Reads:   data/products-raw.csv   (columns: S.N., Product Name, Price (INR))
 * Writes:  data/products.csv           final schema used by the website
 *          data/data-report.md         what was skipped / needs checking
 *          data/categories-review.csv  id, name, category — to check in the Sheet
 *
 * How to run (from the project folder; needs Node.js, no packages):
 *     node tools/convert-products.js
 * Optional: node tools/convert-products.js <input.csv> <output-folder>
 *
 * Nothing here guesses prices. Rows with a price like "360/400" are left
 * out and listed in the report so the owner can decide.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const INPUT = process.argv[2] || path.join(ROOT, "data", "products-raw.csv");
const OUT_DIR = process.argv[3] || path.join(ROOT, "data");

// The fixed category list, in display order (BUILD_BRIEF section 9.3).
const CATEGORIES = [
  "Kitchen",
  "Cleaning",
  "Bathroom & Personal Care",
  "Car",
  "Lights & Electronics",
  "Kids & Toys",
  "Bags & Storage",
  "Home & Wall Decor",
  "Umbrellas & Rain",
  "Health & Massagers",
];
const FALLBACK_CATEGORY = "Home & Wall Decor";

/*
 * Keyword rules, checked TOP TO BOTTOM. The first rule with a matching
 * word wins. Specific groups come first (Car, Umbrellas, Health, Kids),
 * generic words like "bag", "box", "mat" come last.
 * Each keyword matches a whole word (an "s"/"es" plural is also accepted),
 * so "car" does not match "card" or "cart", and "fan" does not match "fancy".
 * Multi-word keywords ("hot water bag") match that exact phrase.
 */
// Note: "usb" and a bare "rain" were tried and removed: they pulled
// "USB Backpack Bag" into electronics and "Cloud Rain Humidifier" into Umbrellas.
// Cleaning is checked before Lights so "Fan Cleaning Mop" stays a cleaning item.
const RULES = [
  { category: "Car", words: ["car", "bike", "bicycle", "vehicle", "headrest", "fuel", "tyre", "tire", "fast tag", "fastag"] },
  { category: "Umbrellas & Rain", words: ["umbrella", "raincoat", "rain cover", "rain card"] },
  { category: "Health & Massagers", words: ["massager", "massage", "message gun", "hot water bag", "hot water rubber", "ice bag", "heating pad", "sugar control", "pill box", "pill", "knee", "eye mask", "nose strip", "nose clip", "nasal", "mask", "migraine", "socks", "insole", "detox", "sweat pad", "arm sleeve", "ice roller", "jawline", "motion sickness", "gripper", "gym grips", "skipping rope", "hula hoop", "pull reducer"] },
  { category: "Kids & Toys", words: ["kids", "kid", "baby", "child", "toy", "pop it", "art set", "drawing", "game", "chess", "domino", "slingshot", "doll", "balloon", "puzzle", "cartoon", "barbie", "teddy", "color pen", "markers", "color set", "pencil", "flash cards", "piggy bank", "shape sorting", "sand art", "magic book", "geometric ruler"] },
  { category: "Bathroom & Personal Care", words: ["soap", "toothbrush", "toothpaste", "loofah", "bath", "shower", "toilet", "hair", "hair dryer", "straightener", "trimmer", "wax", "shaver", "razor", "eyebrow", "nail", "makeup", "face", "facial", "comb", "derma", "scalp", "pedicure", "foot scrubber", "kojic", "scrunchies"] },
  { category: "Cleaning", words: ["mop", "brush", "cleaner", "cleaning", "scrubber", "scrubbing", "sponge", "duster", "stain", "drain", "detergent", "glass cleaner", "broom", "wipes", "dish cloth", "dish washing", "hand gloves", "lint remover", "laundry", "washing machine", "clothes line", "clothing rope", "mosquito", "cockroach", "smell remover", "freshener"] },
  { category: "Lights & Electronics", words: ["lamp", "light", "led", "torch", "solar", "clock", "cable", "charger", "speaker", "mic", "bluetooth", "projector", "fan", "cooler", "humidifier", "lighter", "kettle", "electric", "grinder", "steam iron", "camera", "voltage tester", "mobile", "phone", "laptop"] },
  { category: "Kitchen", words: ["kitchen", "dish drying", "garlic", "chopper", "peeler", "cutter", "spatula", "apron", "tawa", "kadai", "kadhai", "pan", "pot", "oil dispenser", "dispenser", "lunch box", "tiffin", "bottle", "flask", "mug", "cup", "glass", "tumbler", "juicer", "ice tray", "masala", "strainer", "stove", "scale", "coffee", "tea", "spice", "fridge", "knife", "sharpener", "sink", "faucet", "funnel", "straw", "jar", "container", "bowl", "spoon", "oven mitt", "momos", "atta", "flour", "cake", "egg", "candy", "sealing machine", "seasoning", "soup"] },
  { category: "Bags & Storage", words: ["bag", "storage", "box", "basket", "organizer", "organiser", "rack", "hanger", "cover", "pouch", "trolley"] },
  { category: "Home & Wall Decor", words: ["marble", "foil", "wallpaper", "sticker", "hook", "diya", "rangoli", "door stopper", "tape", "frame", "decor", "mat"] },
];

// ---------- small helpers ----------

// Escape regex special characters in a keyword.
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Pre-build one regex per keyword: whole word, optional plural.
const COMPILED_RULES = RULES.map((rule) => ({
  category: rule.category,
  tests: rule.words.map((w) => ({
    word: w,
    re: new RegExp("(^|[^a-z0-9])" + escapeRegex(w) + "(s|es)?($|[^a-z0-9])", "i"),
  })),
}));

/*
 * Minimal CSV parser (handles quotes, commas inside quotes, "" escapes,
 * CRLF/LF line endings). Returns an array of rows (arrays of strings).
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Quote a value for CSV output only when needed.
function csvCell(value) {
  const s = String(value == null ? "" : value);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// Collapse runs of spaces and trim.
function clean(s) {
  return String(s == null ? "" : s).replace(/\s+/g, " ").trim();
}

// For duplicate detection: lowercase, drop punctuation, collapse spaces.
function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/*
 * Turn a price cell into a number, or null if it is not a single clear number.
 * Accepts "₹1,599", "Rs. 250", "99.50". Rejects "360/400", "", "abc", 0.
 */
function parsePrice(raw) {
  const s = clean(raw).replace(/₹|rs\.?|inr/gi, "").replace(/,/g, "").trim();
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return n > 0 ? n : null;
}

// Find the first matching category rule. Also report other groups that matched,
// so uncertain items can be listed for the owner.
function categorize(name) {
  const hits = [];
  for (const rule of COMPILED_RULES) {
    const t = rule.tests.find((x) => x.re.test(name));
    if (t) hits.push({ category: rule.category, word: t.word });
  }
  if (hits.length === 0) return { category: FALLBACK_CATEGORY, word: null, fallback: true, others: [] };
  return {
    category: hits[0].category,
    word: hits[0].word,
    fallback: false,
    // other categories whose keywords also matched (excluding the winner)
    others: hits.slice(1).filter((h) => h.category !== hits[0].category),
  };
}

// Find the header row: the first row that has an "S.N" column and a "name" column.
function findHeader(rows) {
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].map((c) => clean(c).toLowerCase());
    const idCol = cells.findIndex((c) => /^s\.?\s*n\.?o?\.?$|^sr\.?\s*no\.?$|^serial/.test(c));
    const nameCol = cells.findIndex((c) => c.includes("name"));
    const priceCol = cells.findIndex((c) => c.includes("price"));
    if (idCol !== -1 && nameCol !== -1 && priceCol !== -1) return { index: i, idCol, nameCol, priceCol };
  }
  return null;
}

// ---------- main ----------

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error("Cannot find " + INPUT + "\nPut the Sheet export there as products-raw.csv and run again.");
    process.exit(1);
  }

  const text = fs.readFileSync(INPUT, "utf8").replace(/^﻿/, ""); // drop BOM
  const rows = parseCsv(text);
  const header = findHeader(rows);
  if (!header) {
    console.error("Could not find a header row with S.N., Product Name and Price columns.");
    process.exit(1);
  }

  const products = [];          // good rows, in file order
  const skipped = [];           // { line, reason, raw }
  const badPrices = [];         // { line, id, name, price }
  const seenIds = new Map();    // id -> product
  let blankRows = 0;

  for (let r = header.index + 1; r < rows.length; r++) {
    const line = r + 1; // 1-based line number as seen in a text editor
    const row = rows[r];
    if (row.every((c) => clean(c) === "")) { blankRows++; continue; }

    const rawId = clean(row[header.idCol]);
    const name = clean(row[header.nameCol]);
    const rawPrice = clean(row[header.priceCol]);
    const rawText = row.map(clean).join(" | ");

    if (!rawId) { skipped.push({ line, reason: "no S.N. (id)", raw: rawText }); continue; }
    if (!/^\d+\.?$/.test(rawId)) { skipped.push({ line, reason: "S.N. is not a whole number", raw: rawText }); continue; }
    const id = parseInt(rawId, 10);
    if (!name) { skipped.push({ line, reason: "no product name", raw: rawText }); continue; }
    if (seenIds.has(id)) {
      skipped.push({ line, reason: "duplicate S.N. " + id + " (first one kept: \"" + seenIds.get(id).name + "\")", raw: rawText });
      continue;
    }

    const price = parsePrice(rawPrice);
    if (price === null) {
      badPrices.push({ line, id, name, price: rawPrice });
      seenIds.set(id, { name });
      continue;
    }

    const cat = categorize(name);
    const product = { id, name, price, ...cat };
    products.push(product);
    seenIds.set(id, product);
  }

  // Probable duplicates: same normalized name, different ids.
  const byName = new Map();
  for (const p of products) {
    const key = normalizeName(p.name);
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(p);
  }
  const dupGroups = [...byName.values()].filter((g) => g.length > 1);

  // Sort by id for the output files.
  products.sort((a, b) => a.id - b.id);

  // ---- data/products.csv ----
  const headerCols = ["id", "name", "description", "price", "category", "image", "in_stock"];
  const csvLines = [headerCols.join(",")];
  for (const p of products) {
    csvLines.push([p.id, p.name, "", p.price, p.category, "", "Y"].map(csvCell).join(","));
  }
  // BOM so Excel shows ₹ and non-English text correctly. The site strips it.
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "products.csv"), "﻿" + csvLines.join("\r\n") + "\r\n", "utf8");

  // ---- data/categories-review.csv ----
  const reviewLines = ["id,name,category,matched_word,also_matched"];
  for (const p of products) {
    reviewLines.push([
      p.id, p.name, p.category,
      p.fallback ? "(none - fallback)" : p.word,
      p.others.map((o) => o.category + " (" + o.word + ")").join("; "),
    ].map(csvCell).join(","));
  }
  fs.writeFileSync(path.join(OUT_DIR, "categories-review.csv"), "﻿" + reviewLines.join("\r\n") + "\r\n", "utf8");

  // ---- data/data-report.md ----
  const counts = {};
  for (const c of CATEGORIES) counts[c] = 0;
  for (const p of products) counts[p.category]++;
  const fallbackItems = products.filter((p) => p.fallback);
  const uncertain = products.filter((p) => p.others.length > 0);
  const mdEscape = (s) => String(s).replace(/\|/g, "\\|");

  const md = [];
  md.push("# Product data report");
  md.push("");
  md.push("Made by `tools/convert-products.js` from `" + path.basename(INPUT) + "`. Re-running the script overwrites this file.");
  md.push("");
  md.push("## Summary");
  md.push("");
  md.push("- Rows read after the header: " + (rows.length - header.index - 1));
  md.push("- Products written to `products.csv`: **" + products.length + "**");
  md.push("- Blank rows ignored: " + blankRows);
  md.push("- Rows skipped (see below): " + skipped.length);
  md.push("- Prices that are not a single number (left out, not guessed): " + badPrices.length);
  md.push("- Probable duplicate names: " + dupGroups.length + " groups");
  md.push("- Products that fell into the fallback category (" + FALLBACK_CATEGORY + "): **" + fallbackItems.length + "**");
  md.push("");

  md.push("## Products per category");
  md.push("");
  md.push("| Category | Count |");
  md.push("|---|---|");
  for (const c of CATEGORIES) md.push("| " + c + " | " + counts[c] + " |");
  md.push("");

  md.push("## Prices that need fixing (left out of the catalogue)");
  md.push("");
  md.push("These rows were **not** added to `products.csv`. Put one clear number in the Sheet's `price` column and add them back.");
  md.push("");
  if (badPrices.length === 0) md.push("None.");
  else {
    md.push("| Line | S.N. | Name | Price as written |");
    md.push("|---|---|---|---|");
    for (const b of badPrices) md.push("| " + b.line + " | " + b.id + " | " + mdEscape(b.name) + " | " + mdEscape(b.price || "(empty)") + " |");
  }
  md.push("");

  md.push("## Rows skipped");
  md.push("");
  if (skipped.length === 0) md.push("None.");
  else {
    md.push("| Line | Reason | Row |");
    md.push("|---|---|---|");
    for (const s of skipped) md.push("| " + s.line + " | " + mdEscape(s.reason) + " | " + mdEscape(s.raw) + " |");
  }
  md.push("");

  md.push("## Probable duplicates (same name, different S.N.)");
  md.push("");
  md.push("All of these are in `products.csv`. Check whether they are really different items (size, colour) and rename or remove in the Sheet.");
  md.push("");
  if (dupGroups.length === 0) md.push("None.");
  else {
    md.push("| Name | S.N. and price |");
    md.push("|---|---|");
    for (const g of dupGroups) {
      const samePrice = g.every((p) => p.price === g[0].price);
      md.push("| " + mdEscape(g[0].name) + " | " + g.map((p) => p.id + " (₹" + p.price + ")").join(", ") + (samePrice ? "" : " — **prices differ**") + " |");
    }
  }
  md.push("");

  md.push("## Fallback category (no keyword matched)");
  md.push("");
  md.push("These went to **" + FALLBACK_CATEGORY + "** only because nothing else matched. Please check each one.");
  md.push("");
  if (fallbackItems.length === 0) md.push("None.");
  else for (const p of fallbackItems) md.push("- " + p.id + " — " + mdEscape(p.name));
  md.push("");

  md.push("## Uncertain categories (words from more than one group)");
  md.push("");
  md.push("The first group in the order below won. Check these in `categories-review.csv`.");
  md.push("");
  if (uncertain.length === 0) md.push("None.");
  else {
    md.push("| S.N. | Name | Assigned | Also matched |");
    md.push("|---|---|---|---|");
    for (const p of uncertain) {
      md.push("| " + p.id + " | " + mdEscape(p.name) + " | " + p.category + " (" + p.word + ") | " + p.others.map((o) => o.category + " (" + o.word + ")").join(", ") + " |");
    }
  }
  md.push("");

  md.push("## How categories were assigned");
  md.push("");
  md.push("Each name is checked against these groups **in this order**; the first group with a matching whole word wins. Specific groups come first so that, for example, \"Car Cleaning Duster\" becomes Car, not Cleaning, and generic words like bag, box and mat are checked last.");
  md.push("");
  RULES.forEach((r, i) => md.push((i + 1) + ". **" + r.category + "**: " + r.words.join(", ")));
  md.push("");
  md.push("If nothing matches: " + FALLBACK_CATEGORY + ".");
  md.push("");

  fs.writeFileSync(path.join(OUT_DIR, "data-report.md"), md.join("\n"), "utf8");

  console.log("Wrote " + products.length + " products. Skipped " + skipped.length +
    ", bad prices " + badPrices.length + ", duplicate-name groups " + dupGroups.length +
    ", fallback " + fallbackItems.length + ", uncertain " + uncertain.length + ".");
}

main();
