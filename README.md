# Humane Quotient (HuQ) Website

Interactive site for the Humane Quotient: introduction → 8-step test → HuQ Profile → Action Plan.
Every completed test is saved as one confidential row in an Excel file.

## Run
    npm install
    npm start            # http://localhost:3000

## Excel backend
- Responses file: `data/HuQ_Responses.xlsx` (sheet **Responses** = one row per person, sheet **Summary** = live averages and care-level counts)
- Columns: ID, time (IST), age group, gender, role and qualification (each with "Other: …" detail when Other is chosen), organization, course / department / field and year / experience / stage (the last two only for Student, Teacher / Faculty and Researcher roles), 8 scores (/60), 8 quotients (/10), 8 care levels, HuQ total (/480), HuQ (/10), HuQ care level, strongest quotient(s), then all 96 raw answers (1–5).
- Backup copy of raw answers: `data/responses.jsonl`
- Download from any browser: `http://your-site/admin` (enter the admin key). The key is printed at start-up and saved in `data/admin_key.txt`; set your own with the `ADMIN_KEY` environment variable.
- No names, emails or IP addresses are stored.

## Settings (environment variables)
`PORT` (default 3000) · `DATA_DIR` (where Excel/backup live; use a persistent disk when hosting) · `ADMIN_KEY`

## Emailing the report
Name, email, age group, gender, role (and the specification if "Other"), organization and qualification are compulsory, plus course and year for academic roles. The name and email are used only to email the report and are never written to Excel or the backup file.
Set these to enable email (any SMTP provider): `SMTP_HOST` · `SMTP_PORT` (587 or 465) · `SMTP_USER` · `SMTP_PASS` · `MAIL_FROM` (optional, defaults to SMTP_USER).
Without them the test still works and the profile page says the report could not be emailed.

## Scoring (as in the book)
Each answer = 1–5 marks (Almost Never … Almost Always); 12 questions per value → 12–60.
Quotient = score ÷ 6 (out of 10). HuQ = total ÷ 48 (out of 10, total 96–480).
Care level per quotient: 12–28 Self-Care · 29–44 Socio-Care · 45–60 Universal Care.
Overall HuQ: ≤228 Self-Care · 229–356 Socio-Care · 357–480 Universal Care (the same bands scaled by 8).

## Files
`server.js` backend · `public/index.html` · `public/css/styles.css` (palette) · `public/js/huq-data.js` (all questions, assessments, action plans, scoring) · `public/js/app.js` (interface and results infographic) · `public/img/` (HuQ flower, mark, and the hero picture `hero-red-desktop.webp` and its centred phone crop `hero-red-mobile.webp`)

## Responsive design
Mobile-first CSS with breakpoints 480 / 640 / 768 / 1024 / 1280 / 1536 — see `RESPONSIVE.md` for the device-by-device rules, the before/after comparison and the test matrix. To change the hero picture, replace `public/img/hero-red-mobile.webp` (shown below 768 px) and `public/img/hero-red-desktop.webp` (768 px and up) — use new file names, because images are cached for 30 days — and update the names in `app.js`, `index.html` and `sw.js` (bump the cache name there too). The same pair is used on the Introduction, Profile and Action Plan banners.

## States and effects
- **Flower-logo states** — the real logo mark is shown for loading (splash, only if the app takes > 300 ms), saving, save failed, "loading failed / offline", 404 pages, "no data yet" (Profile / Action Plan before the test is finished), page errors and the offline / back-online toast. See `AUDIT.md` for the full list. Server pages for 404 / 500 live in `server.js` (`statePage`).
- **Card hover** — one recipe for every card: lifts 4 px, icon scales 10 %, shadow grows. Tokens in `:root` of `styles.css`: `--lift`, `--icon-pop`, `--hover-dur`, `--shadow-hover`. Content panels that hold controls or charts (test questions, the explore panel, the big profile panels, the form) deliberately stay still.
- **Underline / bar sweeps** — one slow timing for all of them: `--sweep-dur` (1.2 s) and `--sweep-ease`. Change those two values to speed them all up or slow them all down together.
- **Numerals** — lining figures everywhere (`font-variant-numeric: lining-nums` on `body`), so "1" is a proper 1.
- **Profile reveal** — the Profile page opens on a closed flower and one line ("Your results are ready"). Nothing from the result is in the page until the flower is clicked (or tapped, or activated with Enter / Space): then the bud opens, the real flower blooms in its place, glides to the left while the strongest quotient and the ranked list slide in, the page opens upward to show the overall score (with confetti for Socio-Care and above), and the rest of the profile (journey bar, quotient cards, summary table, characteristics, buttons) fades in as you scroll. It is gated on every arrival at Profile; to remember the reveal for the session instead, set a `sessionStorage` flag in `reveal()` (`app.js`) and skip the gate when it is set. Under `prefers-reduced-motion` the whole result appears at once. The timeline is the list of `later(…)` calls at the end of `reveal()`; the closed flower is `budSVG()`; styles are in the "Profile: the closed flower and the reveal" block at the end of `styles.css`.
