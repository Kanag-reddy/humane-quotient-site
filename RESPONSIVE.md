# Responsive system — Desktop, Tablet and Mobile

One design language (same palette, fonts, components); three layouts. CSS is **mobile-first**: the base rules are the
phone layout (320–479 px) and each `@media (min-width: …)` layer only enhances it.

## Breakpoints

| Token | min-width | Device class | What changes |
|---|---|---|---|
| base | 320 | smallest phones (iPhone SE) | 1 column, hamburger + full-screen overlay, 44 px targets |
| `--bp-mobile-lg` | 480 | large phones | hero buttons stop being full width, bigger flower |
| `--bp-tablet-sm` | 640 | small tablets, phones in landscape | 2-column card grids, real table, equation on two rows, result-flower labels |
| `--bp-tablet` | 768 | iPad portrait | condensed horizontal nav (burger disappears), 62 px tip rows, blur 18 px |
| `--bp-tablet-lg` | 1024 | iPad landscape, laptops | split layouts (hero, intro, explore, results), 3-column grids, full nav, blur 24 px, parallax allowed |
| `--bp-desktop` | 1280 | desktop | container 1440, value cards in 4 columns, nav aligned to container |
| `--bp-desktop-lg` | 1536 | large monitors | container 1560 (1600 from 1920); content stays centred |

## What each device gets

**Navigation** — phone (< 768): hamburger, full-screen slide-in overlay (58 px rows, page behind is `inert`, scroll locked,
Esc closes, focus returns to the button). Tablet (768–1023): condensed horizontal nav (everything fits, so no "More" menu).
Desktop: full horizontal nav, 36 px minimum targets for precise pointers (44 px whenever the pointer is coarse).
The nav glass lives on a pseudo-element so the fixed overlay is never trapped inside a `backdrop-filter` parent.

**Grids** — phone 1 column; tablet 2 columns (a third item spans the row; the Evolution-of-Care arrows re-route
↓ / → / ↓); desktop 3 columns, value cards 4 (≈ 283–353 px wide, inside the 280–420 px readability limits).
Cards inside narrow columns use a container query so the three mini-bars stack instead of squeezing.

**Fluid type and space** — body `clamp(15.5px, .35vw + 14.2px, 17.5px)`, h2/h3/hero/test headings `clamp()`, no fixed px font
sizes (print excepted). Spacing tokens: `--space-section`, `--space-card`, `--space-gap`, `--panel-pad`, `--gutter`.

**Side gaps** — container 1120 px → 1200 / 1440 / 1560 / 1600 px; glass-panel margin 28 px; page gutter `clamp(14px, 3.2vw, 40px)`.

**Hero picture** — one red geometric artwork, art-directed with `<picture>`: `hero-red-mobile.webp` (1000×1300, a centred crop of the
same artwork, since the pattern is concentric) below 768 px, `hero-red-desktop.webp` (1920×1300) from 768 px; no overlay on top;
the same band is used on the Introduction, Profile and Action Plan heroes. Text contrast over the pattern was measured against the
lightest pixel under every text box at 320 / 390 / 820 / 1024 / 1440 px: all ≥ 4.5:1 (≥ 3:1 for large text). The home stat pills use
cream labels and a faint deep-red tint for that reason.

**Touch vs cursor** — all 24 `:hover` rules sit in `@media (hover:hover) and (pointer:fine)`; coarse pointers get
`:active { transform: scale(.97) }`; `touch-action: manipulation`, gold tap highlight, momentum scrolling on scrollable
panels; parallax runs only on `(min-width:1024px) and (hover:hover) and (pointer:fine)`.

**Glass** — blur 12 px (phones) → 18 px (tablet) → 24 px (desktop); hero pills have no blur below 1024 px; at most
2 blurred layers on a phone screen; `@supports not (backdrop-filter)` gives solid fallbacks.

**Phone specifics** — `100dvh`, `viewport-fit=cover` + `env(safe-area-inset-*)` on nav, containers, footer and button row,
`interactive-widget=resizes-content`, `scroll-margin` on inputs so the keyboard never hides them.

## Before / after

| Viewport | Before | After |
|---|---|---|
| 320 × 640 (min) | profile page scrolled sideways **+41 px**; answer options 38 px wide | no overflow; options ≥ 52 px; labels all visible |
| 360 × 800 (Galaxy S21) | profile **+1 px** overflow (summary table) | no overflow; table becomes one card per row |
| 375 / 393 / 430 phones | passed, but nav links 39 px, burger 42 px, brand 34 px, scroll cue 22×30, chips 31 px tall | every target ≥ 44 px |
| 640 (zoom 200 % of 1280) | desktop-sized padding in a single column | 2-column grids, real table |
| 768 / 820 iPad portrait | phone layout stretched (single column, hamburger only below 700 px so 701–900 had cramped links) | tablet layout: 2 columns, condensed nav, bigger hero |
| 900 / 1024 / 1100 | single column up to 900 px, jump to desktop | split layouts from 1024; 3-column grids; no overflow at 900 / 1100 |
| 1280 / 1440 | side gaps 80 px / 160 px | 28 px (panel) — content uses the screen |
| 1920 | side gaps **400 px** | 160 px |
| 2560 | side gaps 720 px | 480 px (capped at 1600, centred) |
| All | 24 bare `:hover` rules; blur 24 px on phones (4–6 blurred layers on screen); parallax on touch; `100vh`; fixed 17 px body | gated hover; 12 px blur, ≤ 2 layers; desktop-only parallax; `100dvh`; fluid type |

## Verified matrix

iPhone SE 375×667 · iPhone 14 Pro 393×852 · Galaxy S21 360×800 · iPhone 14 Pro Max 430×932 · 320×640 · iPad Mini 768×1024 ·
iPad Air 820×1180 · iPad Pro 1024×1366 · laptop 1280×800 and 1440×900 · desktop 1920×1080 · 4K 2560×1440 · zoom 150 % (853) and
200 % (640) · odd widths 900 and 1100 · landscape: SE 667×375, 14 Pro 852×393, iPad Mini 1024×768, iPad Air 1180×820 ·
split view 320 / 507 / 678 wide · extra: 1000, 1200, 1366, 1600, iPad Pro landscape 1366×1024.
For every page (home, form, test step, profile, plan): no horizontal overflow, no element outside the viewport,
touch targets ≥ 44 px below 1024 px, ≥ 32 px above.
Lighthouse (mobile): Performance 97, Accessibility 100, Best Practices 100, SEO 100, CLS 0.

## Deliberate content decisions (no lazy `display:none`)

* Result flower, below 640 px: the eight in-graphic name labels would render at ≈ 5 px, so they are hidden; the same names and
  scores are listed directly beneath in "Your quotients, ranked", and the flower is drawn larger instead.
* Small spectrum bars inside value cards never show zone names (the level chip above them says the same thing).
* `display:none` that remains: print rules, reduced-motion / low-end ambient effects, `[hidden]` form groups, the burger at ≥ 768 px.
  Everything else that used to be hidden on phones (brand name, stream labels, summary-table column, answer labels, stepper
  labels) is now restructured to fit.
