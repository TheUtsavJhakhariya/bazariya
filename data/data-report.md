# Product data report

Made by `tools/convert-products.js` from `products-raw.csv`. Re-running the script overwrites this file.

## Summary

- Rows read after the header: 608
- Products written to `products.csv`: **601**
- Blank rows ignored: 6
- Rows skipped (see below): 0
- Prices that are not a single number (left out, not guessed): 1
- Probable duplicate names: 5 groups
- Products that fell into the fallback category (Home & Wall Decor): **63**

## Products per category

| Category | Count |
|---|---|
| Kitchen | 101 |
| Cleaning | 65 |
| Bathroom & Personal Care | 78 |
| Car | 36 |
| Lights & Electronics | 52 |
| Kids & Toys | 50 |
| Bags & Storage | 47 |
| Home & Wall Decor | 101 |
| Umbrellas & Rain | 14 |
| Health & Massagers | 57 |

## Prices that need fixing (left out of the catalogue)

These rows were **not** added to `products.csv`. Put one clear number in the Sheet's `price` column and add them back.

| Line | S.N. | Name | Price as written |
|---|---|---|---|
| 585 | 673 | 14 in 1 Multipurpose Chopper | 360/400 |

## Rows skipped

None.

## Probable duplicates (same name, different S.N.)

All of these are in `products.csv`. Check whether they are really different items (size, colour) and rename or remove in the Sheet.

| Name | S.N. and price |
|---|---|
| Duck Oil Dispenser Bottle | 90 (₹85), 365 (₹95) — **prices differ** |
| Hair Line Powder Black | 171 (₹99), 465 (₹88) — **prices differ** |
| Pop it toy | 201 (₹55), 309 (₹50) — **prices differ** |
| Window Cleaning Brush | 290 (₹25), 291 (₹34) — **prices differ** |
| Frosty Water Bottle (pack of 6) | 343 (₹165), 518 (₹165) |

## Fallback category (no keyword matched)

These went to **Home & Wall Decor** only because nothing else matched. Please check each one.

- 4 — Magic Towel
- 22 — Self Defence Stick Rod Foldable
- 40 — 46 in 1 Screw Driver Set
- 63 — Golden tikdi White brick Available
- 69 — Automatic Door Closer
- 70 — 6 Pcs Silicone Lead Set
- 77 — Waterproof Leak Filler Spray
- 78 — Shoe Repairing Glue
- 79 — Tennis Trainer Rebound Ball
- 82 — Tiles Gap Filler Agent Tube (180 ml)
- 86 — Portable Turbine Washer
- 94 — Beauty Crystal Ball
- 96 — China Waterproof Glue
- 104 — Transparent Waterproof Water Glue
- 112 — Thermal Label Roll (400 Label)
- 139 — Stone With Roller
- 145 — Wall Mounted Penguin
- 174 — Window Screen Repair Kit Tap
- 181 — 2 In 1 USB Jari Flawless
- 212 — Green Spray Water Gun
- 213 — High Pressure Water Gun Nozzle
- 222 — 48 Tools In One with 360
- 223 — 3 in 1 Garden Sprinklers
- 225 — Metal Repairing Casting Glue AB Tube
- 234 — Tile reform Tube 280 ml
- 251 — Leather Repair Cream Liquid Shoe Polish
- 289 — Telly Counter
- 298 — Flexible Mirror Sheets (30 x 45 CM)
- 301 — Winter Cap
- 371 — Anti Slip Glow Tap
- 396 — Wall Paint Roller
- 400 — Hydrophobic Trim Coating (50ML)
- 407 — 4Pc Furniture Roller
- 408 — Golden Brass Nozzle
- 418 — Bedsheet Liftar / Bedsheet Lifter
- 432 — 2 In 1 Winter Cap With Scaf
- 436 — Velding Rod Set Of 3
- 459 — Air Sofa Chair
- 461 — Magic Stick
- 463 — Zipper Repair Kit
- 477 — Plant Watering Pipe (12 PCS)
- 499 — Summer Scarf
- 508 — Magic mash
- 511 — Wire Stripper
- 546 — 24 In 1 Screwdriver Set
- 554 — Snapon smile
- 582 — Water sprayer 2 ltr.
- 589 — Silver clip
- 590 — Brown Leather Repair Patch
- 596 — Sewing Tool Kit Tailor Small
- 598 — QishiShaver
- 603 — Alluminium tap 4 inch
- 607 — Cat Dancing Ball
- 616 — Bird house
- 617 — HD Vision Goggles
- 626 — Pistol water spray Gun
- 632 — Sunshade Roller Blinds 40*125 Cm (Black)
- 650 — Spring Door Closer
- 651 — Multiple Holder
- 658 — 1000 ML Waterproof Glue
- 674 — Double cylinder foot pump
- 676 — Bed Sofa
- 685 — Tissue Tablet

## Uncertain categories (words from more than one group)

The first group in the order below won. Check these in `categories-review.csv`.

| S.N. | Name | Assigned | Also matched |
|---|---|---|---|
| 1 | Electric Hot Water Bag | Health & Massagers (hot water bag) | Lights & Electronics (electric), Bags & Storage (bag) |
| 9 | 3D Cartoon Lunch Bag | Kids & Toys (cartoon) | Bags & Storage (bag) |
| 23 | Double Dacker Plastic Lunch Box | Kitchen (lunch box) | Bags & Storage (box) |
| 24 | Kitchen Mat 30*300 CM | Kitchen (kitchen) | Home & Wall Decor (mat) |
| 32 | Car Cleaning Duster | Car (car) | Cleaning (cleaning) |
| 41 | Steel Bottle Brush | Cleaning (brush) | Kitchen (bottle) |
| 46 | Bike Goggle Mask Rainbow | Car (bike) | Health & Massagers (mask) |
| 50 | Sink Hair Catching Drain 160 CM | Bathroom & Personal Care (hair) | Cleaning (drain), Kitchen (sink) |
| 52 | 48V Electric Car Pressure Washer Gun | Car (car) | Lights & Electronics (electric) |
| 54 | 2 in 1 Lofa Body Brush Loofah Brush | Bathroom & Personal Care (loofah) | Cleaning (brush) |
| 59 | Baby Nail Trimmer / Baby Nail Cutter | Kids & Toys (baby) | Bathroom & Personal Care (trimmer), Kitchen (cutter) |
| 60 | Ice Bag for Pain Relief (9 inch) | Health & Massagers (ice bag) | Bags & Storage (bag) |
| 61 | Steel Electric Coffee Grinder Mini Mixer | Lights & Electronics (electric) | Kitchen (coffee) |
| 67 | Pill Box / Pill Box | Health & Massagers (pill box) | Bags & Storage (box) |
| 68 | Cartoon Water Bottle With Straw | Kids & Toys (cartoon) | Kitchen (bottle) |
| 71 | Car Dust Removal Mini Brush | Car (car) | Cleaning (brush) |
| 73 | Makeup Remover Wipes | Bathroom & Personal Care (makeup) | Cleaning (wipes) |
| 80 | Sunmini UVLED Nail dryer Lamp | Bathroom & Personal Care (nail) | Lights & Electronics (lamp) |
| 88 | Deep Frying Pot with Basket 1200 ML | Kitchen (pot) | Bags & Storage (basket) |
| 99 | 3 In 1 Car Vacuum Cleaner | Car (car) | Cleaning (cleaner) |
| 100 | Round loofah scrubbing brush | Bathroom & Personal Care (loofah) | Cleaning (brush) |
| 101 | Kitchen Multi Cleaning Powder | Cleaning (cleaning) | Kitchen (kitchen) |
| 119 | Velvet hot water bag | Health & Massagers (hot water bag) | Bags & Storage (bag) |
| 120 | Baby play water mat | Kids & Toys (baby) | Home & Wall Decor (mat) |
| 127 | Ear Pick / Ear Cleaner for Kids | Kids & Toys (kids) | Cleaning (cleaner) |
| 130 | Toothpaste holder With Toothpaste Dispenser | Bathroom & Personal Care (toothpaste) | Kitchen (dispenser) |
| 143 | Baby tooth brush Kids U shape Tooth | Kids & Toys (kids) | Cleaning (brush) |
| 148 | Cartoon Toothbrush Holder | Kids & Toys (cartoon) | Bathroom & Personal Care (toothbrush) |
| 179 | Baby Knee Pad | Health & Massagers (knee) | Kids & Toys (baby) |
| 185 | Silicone Bath Brush | Bathroom & Personal Care (bath) | Cleaning (brush) |
| 187 | Bath Sponge | Bathroom & Personal Care (bath) | Cleaning (sponge) |
| 188 | Baby Shower/Bath Cap | Kids & Toys (baby) | Bathroom & Personal Care (bath) |
| 195 | Foot Scrubber USB | Bathroom & Personal Care (foot scrubber) | Cleaning (scrubber) |
| 210 | Car Cleaning Tablet | Car (car) | Cleaning (cleaning) |
| 215 | Car Washing/Cleaning Sponge | Car (car) | Cleaning (cleaning) |
| 216 | Microfiber car cleaning towel | Car (car) | Cleaning (cleaning) |
| 236 | Sink and Drain Cleaner Powder (100 GM) | Cleaning (cleaner) | Kitchen (sink) |
| 237 | Sink and Drain Cleaner DRAINGUN Powder (50 GM) | Cleaning (cleaner) | Kitchen (sink) |
| 244 | Toilet Cleaning Tablet (Pack of 10) | Bathroom & Personal Care (toilet) | Cleaning (cleaning) |
| 272 | 2 in 1 Liquid Soap Dispenser | Bathroom & Personal Care (soap) | Kitchen (dispenser) |
| 274 | Soap Pump Dispenser | Bathroom & Personal Care (soap) | Kitchen (dispenser) |
| 277 | Camera Coffee Mug | Lights & Electronics (camera) | Kitchen (mug) |
| 278 | Bottle Cleaning Brush | Cleaning (brush) | Kitchen (bottle) |
| 285 | Microfiber Fan Cleaning Mop | Cleaning (mop) | Lights & Electronics (fan) |
| 292 | 2 in 1 Glass Cleaner Brush | Cleaning (brush) | Kitchen (glass) |
| 303 | Bottle Umbrella | Umbrellas & Rain (umbrella) | Kitchen (bottle) |
| 317 | Car Foam Cleaner | Car (car) | Cleaning (cleaner) |
| 318 | Orange Kitchen Cleaner Spray | Cleaning (cleaner) | Kitchen (kitchen) |
| 319 | 3D Cartoon Lunch Box Bag | Kids & Toys (cartoon) | Kitchen (lunch box), Bags & Storage (bag) |
| 320 | Kitchen cleaning form Spray | Cleaning (cleaning) | Kitchen (kitchen) |
| 323 | 3 in 1 Baby Bed, Sleeping Bag | Kids & Toys (baby) | Bags & Storage (bag) |
| 326 | Bag Rain Cover | Umbrellas & Rain (rain cover) | Bags & Storage (bag) |
| 332 | Electric Nima Coffee Grinder | Lights & Electronics (electric) | Kitchen (coffee) |
| 335 | 3 In 1 Brush Bottle Cleaner | Cleaning (brush) | Kitchen (bottle) |
| 342 | Self Cleaning Hair Brush Comb | Bathroom & Personal Care (hair) | Cleaning (brush) |
| 346 | Silicon Toilet Brush | Bathroom & Personal Care (toilet) | Cleaning (brush) |
| 358 | Car Protection Foot Tape | Car (car) | Home & Wall Decor (tape) |
| 362 | Car Dust Cleaner Soft Hair Brush | Car (car) | Bathroom & Personal Care (hair), Cleaning (brush) |
| 366 | Drain sticker hair catcher | Bathroom & Personal Care (hair) | Cleaning (drain), Home & Wall Decor (sticker) |
| 372 | Donut Shaped Double Lunch Box | Kitchen (lunch box) | Bags & Storage (box) |
| 373 | Froggy Plastic Lunch Box | Kitchen (lunch box) | Bags & Storage (box) |
| 374 | Car Fast Tag Cover | Car (car) | Bags & Storage (cover) |
| 386 | Scalp Massager | Health & Massagers (massager) | Bathroom & Personal Care (scalp) |
| 389 | 5 In 1 Face, Facial Massager | Health & Massagers (massager) | Bathroom & Personal Care (face) |
| 402 | 6 Jar Spice Rack | Kitchen (spice) | Bags & Storage (rack) |
| 405 | Laptop Bag | Lights & Electronics (laptop) | Bags & Storage (bag) |
| 409 | Washing Machine Cover | Cleaning (washing machine) | Bags & Storage (cover) |
| 410 | Waterproof Fridge Cover | Kitchen (fridge) | Bags & Storage (cover) |
| 417 | Square Shape Non Slip Home Bath mat | Bathroom & Personal Care (bath) | Home & Wall Decor (mat) |
| 422 | Soap Dispenser bottle | Bathroom & Personal Care (soap) | Kitchen (dispenser) |
| 423 | Kids Barbie Lunch Box | Kids & Toys (kids) | Kitchen (lunch box), Bags & Storage (box) |
| 424 | Tokyo Lunch Box | Kitchen (lunch box) | Bags & Storage (box) |
| 426 | Masala Box (360° Revolving) | Kitchen (masala) | Bags & Storage (box) |
| 431 | Winter Face Mask - Windproof Face Mask | Health & Massagers (mask) | Bathroom & Personal Care (face) |
| 433 | 80 Pcs Kitchen Cleaning Wipes | Cleaning (cleaning) | Kitchen (kitchen) |
| 442 | Silicone Toilet Brush With Sticker - Holder Stand | Bathroom & Personal Care (toilet) | Cleaning (brush), Home & Wall Decor (sticker) |
| 449 | Magic gel kitchen Cleaner | Cleaning (cleaner) | Kitchen (kitchen) |
| 450 | Travel Portable Soap Box With Dish | Bathroom & Personal Care (soap) | Bags & Storage (box) |
| 451 | Multi Purpose 8 Hook Wooden Hangers | Bags & Storage (hanger) | Home & Wall Decor (hook) |
| 453 | Metal tape dispenser | Kitchen (dispenser) | Home & Wall Decor (tape) |
| 466 | Dish Drying Mat Kitchen Mat (30*40) | Kitchen (kitchen) | Home & Wall Decor (mat) |
| 471 | Facial Massager Gun | Health & Massagers (massager) | Bathroom & Personal Care (facial) |
| 473 | 3 in 1 Anti Wrinkles Face Neck Eyes Massager | Health & Massagers (massager) | Bathroom & Personal Care (face) |
| 474 | 3 In 1 Liquid Soap Dispenser | Bathroom & Personal Care (soap) | Kitchen (dispenser) |
| 476 | 6 Grid fridge Storage Organizer | Kitchen (fridge) | Bags & Storage (storage) |
| 481 | Universal Car Back Seat Headrest Hook | Car (car) | Home & Wall Decor (hook) |
| 484 | Teddy Bear Toothbrush Holder | Kids & Toys (teddy) | Bathroom & Personal Care (toothbrush) |
| 488 | Car Seat Back Organizer | Car (car) | Bags & Storage (organizer) |
| 490 | Car Push to Start Button Cover | Car (car) | Bags & Storage (cover) |
| 496 | Mini Car Dash Duster | Car (car) | Cleaning (duster) |
| 498 | Car Sunset Umbrella | Car (car) | Umbrellas & Rain (umbrella) |
| 507 | Head Massager Scalp | Health & Massagers (massager) | Bathroom & Personal Care (scalp) |
| 524 | Yummy Lunch Box With Bottle | Kitchen (lunch box) | Bags & Storage (box) |
| 530 | Feel Fresh Containers Lunch Box Set of 2 | Kitchen (lunch box) | Bags & Storage (box) |
| 535 | Toilet Active Oxygen Agent Cleaner Powder | Bathroom & Personal Care (toilet) | Cleaning (cleaner) |
| 538 | Car Cleaning Wash Glove | Car (car) | Cleaning (cleaning) |
| 542 | Foot Shower Scrubber | Bathroom & Personal Care (shower) | Cleaning (scrubber) |
| 553 | Car Protection tape White | Car (car) | Home & Wall Decor (tape) |
| 565 | Mobile Phones Waterproof Pouch Cover | Lights & Electronics (mobile) | Bags & Storage (cover) |
| 566 | 3 Compartment Steel Lunch Box | Kitchen (lunch box) | Bags & Storage (box) |
| 570 | 2 Pcs Kitchen Floor Mat (4060CM & 40120CM) | Kitchen (kitchen) | Home & Wall Decor (mat) |
| 571 | Travel Toothbrush Head Cover | Bathroom & Personal Care (toothbrush) | Bags & Storage (cover) |
| 576 | Super Cleaning Gel Car Glue | Car (car) | Cleaning (cleaning) |
| 579 | Ice Bag (6 Inch) | Health & Massagers (ice bag) | Bags & Storage (bag) |
| 588 | Multi Design Absorbent Bath Mat | Bathroom & Personal Care (bath) | Home & Wall Decor (mat) |
| 600 | Lady Hair Comb, Hair Brush With Handle | Bathroom & Personal Care (hair) | Cleaning (brush) |
| 610 | Hair Straightner Comb Brush | Bathroom & Personal Care (hair) | Cleaning (brush) |
| 614 | Smart Scalp Massager | Health & Massagers (massager) | Bathroom & Personal Care (scalp) |
| 620 | Silicone Long Handle Bath Brush | Bathroom & Personal Care (bath) | Cleaning (brush) |
| 634 | Wall Hanging Laundry Basket | Cleaning (laundry) | Bags & Storage (basket) |
| 639 | Mighty Lunch Box | Kitchen (lunch box) | Bags & Storage (box) |
| 641 | Dish Drying mat (Black, 40X60 CM) | Kitchen (dish drying) | Home & Wall Decor (mat) |
| 657 | Triangle Magnetic Glass Cleaner | Cleaning (cleaner) | Kitchen (glass) |
| 659 | Kids Projector Torch | Kids & Toys (kids) | Lights & Electronics (torch) |
| 663 | Car Magnetic Phone Holder | Car (car) | Lights & Electronics (phone) |
| 665 | Toilet Freshener injection Gel | Bathroom & Personal Care (toilet) | Cleaning (freshener) |
| 686 | Car Cleaning Wipes 80 Pcs | Car (car) | Cleaning (cleaning) |
| 691 | 4 in 1 Nail Cutter Set | Bathroom & Personal Care (nail) | Kitchen (cutter) |
| 699 | Car Duster Brush | Car (car) | Cleaning (brush) |

## How categories were assigned

Each name is checked against these groups **in this order**; the first group with a matching whole word wins. Specific groups come first so that, for example, "Car Cleaning Duster" becomes Car, not Cleaning, and generic words like bag, box and mat are checked last.

1. **Car**: car, bike, bicycle, vehicle, headrest, fuel, tyre, tire, fast tag, fastag
2. **Umbrellas & Rain**: umbrella, raincoat, rain cover, rain card
3. **Health & Massagers**: massager, massage, message gun, hot water bag, hot water rubber, ice bag, heating pad, sugar control, pill box, pill, knee, eye mask, nose strip, nose clip, nasal, mask, migraine, socks, insole, detox, sweat pad, arm sleeve, ice roller, jawline, motion sickness, gripper, gym grips, skipping rope, hula hoop, pull reducer
4. **Kids & Toys**: kids, kid, baby, child, toy, pop it, art set, drawing, game, chess, domino, slingshot, doll, balloon, puzzle, cartoon, barbie, teddy, color pen, markers, color set, pencil, flash cards, piggy bank, shape sorting, sand art, magic book, geometric ruler
5. **Bathroom & Personal Care**: soap, toothbrush, toothpaste, loofah, bath, shower, toilet, hair, hair dryer, straightener, trimmer, wax, shaver, razor, eyebrow, nail, makeup, face, facial, comb, derma, scalp, pedicure, foot scrubber, kojic, scrunchies
6. **Cleaning**: mop, brush, cleaner, cleaning, scrubber, scrubbing, sponge, duster, stain, drain, detergent, glass cleaner, broom, wipes, dish cloth, dish washing, hand gloves, lint remover, laundry, washing machine, clothes line, clothing rope, mosquito, cockroach, smell remover, freshener
7. **Lights & Electronics**: lamp, light, led, torch, solar, clock, cable, charger, speaker, mic, bluetooth, projector, fan, cooler, humidifier, lighter, kettle, electric, grinder, steam iron, camera, voltage tester, mobile, phone, laptop
8. **Kitchen**: kitchen, dish drying, garlic, chopper, peeler, cutter, spatula, apron, tawa, kadai, kadhai, pan, pot, oil dispenser, dispenser, lunch box, tiffin, bottle, flask, mug, cup, glass, tumbler, juicer, ice tray, masala, strainer, stove, scale, coffee, tea, spice, fridge, knife, sharpener, sink, faucet, funnel, straw, jar, container, bowl, spoon, oven mitt, momos, atta, flour, cake, egg, candy, sealing machine, seasoning, soup
9. **Bags & Storage**: bag, storage, box, basket, organizer, organiser, rack, hanger, cover, pouch, trolley
10. **Home & Wall Decor**: marble, foil, wallpaper, sticker, hook, diya, rangoli, door stopper, tape, frame, decor, mat

If nothing matches: Home & Wall Decor.
