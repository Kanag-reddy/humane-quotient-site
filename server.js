/* Humane Quotient website — Express server with an Excel backend.
   Every completed test is appended as one confidential row to data/HuQ_Responses.xlsx
   (also mirrored to data/responses.jsonl as a safety backup). */
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');
// optional speed-ups: used when installed, silently skipped otherwise
let compression = null, esbuild = null;
try { compression = require('compression'); } catch (e) { /* optional */ }
try { esbuild = require('esbuild'); } catch (e) { /* optional */ }
const HUQ = require('./public/js/huq-data.js');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const XLSX_PATH = path.join(DATA_DIR, 'HuQ_Responses.xlsx');
const JSONL_PATH = path.join(DATA_DIR, 'responses.jsonl');
const KEY_PATH = path.join(DATA_DIR, 'admin_key.txt');

let ADMIN_KEY = process.env.ADMIN_KEY;
if (!ADMIN_KEY) {
  if (fs.existsSync(KEY_PATH)) ADMIN_KEY = fs.readFileSync(KEY_PATH, 'utf8').trim();
  else { ADMIN_KEY = crypto.randomBytes(12).toString('hex'); fs.writeFileSync(KEY_PATH, ADMIN_KEY); }
}

/* ---------- allowed answers for the fixed-choice fields ---------- */
const ALLOWED = {
  age: ['Below 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+'],
  gender: ['Female', 'Male', 'Non-binary / Other', 'Prefer not to say']
};
const pick = (list, v) => (list.includes(v) ? v : '');
// free-text answers (role, qualification): trimmed, control characters removed, 80 characters at most
const clean = (v) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);

/* ---------- workbook layout ---------- */
const LEVEL_NAMES = HUQ.levels.map((l) => l.name);
const HEADERS = ['Response ID', 'Submitted (IST)', 'Age group', 'Gender', 'Role', 'Organization', 'Qualification', 'Course / Department / Field', 'Year / Experience / Stage'];
const DEMO = HEADERS.length; // columns before the first score
HUQ.values.forEach((v) => HEADERS.push(v.code + ' Score (12–60)'));
HUQ.values.forEach((v) => HEADERS.push(v.code + ' Quotient (/10)'));
HUQ.values.forEach((v) => HEADERS.push(v.code + ' Care Level'));
HEADERS.push('HuQ Total (96–480)', 'HuQ (/10)', 'HuQ Care Level', 'Strongest Quotient(s)');
const FIRST_ANSWER_COL = HEADERS.length + 1;
HUQ.questions.forEach((q) => HEADERS.push(q.id));

const COLORS = { maroon: 'FF470500', crimson: 'FF850500', cream: 'FFFFFDE9', sand: 'FFE4D5CB', tan: 'FFD5BDAF' };

function styleHeader(ws) {
  const row = ws.getRow(1);
  row.height = 36;
  row.eachCell((cell, col) => {
    const isAnswer = col >= FIRST_ANSWER_COL;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAnswer ? COLORS.crimson : COLORS.maroon } };
    cell.font = { bold: true, color: { argb: COLORS.cream }, name: 'Calibri', size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });
  ws.views = [{ state: 'frozen', xSplit: DEMO, ySplit: 1 }];
  ws.getColumn(1).width = 16; ws.getColumn(2).width = 20;
  for (let c = 3; c <= DEMO; c++) ws.getColumn(c).width = 20;
  for (let c = DEMO + 1; c < FIRST_ANSWER_COL; c++) ws.getColumn(c).width = 15;
  for (let c = FIRST_ANSWER_COL; c <= HEADERS.length; c++) ws.getColumn(c).width = 9;
}

function colLetter(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }

function buildSummary(wb) {
  const ws = wb.addWorksheet('Summary');
  const LAST = 100000;
  ws.getCell('A1').value = 'Humane Quotient (HuQ) — Summary of responses';
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: COLORS.maroon } };
  ws.getCell('A3').value = 'Total responses';
  ws.getCell('B3').value = { formula: `COUNTA(Responses!A2:A${LAST})` };
  ws.getCell('A3').font = { bold: true };
  const head = ['Quotient', 'Average score (/60)', 'Average quotient (/10)', 'Self-Care', 'Socio-Care', 'Universal Care'];
  head.forEach((h, i) => {
    const c = ws.getCell(5, i + 1);
    c.value = h; c.font = { bold: true, color: { argb: COLORS.cream } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.maroon } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  HUQ.values.forEach((v, i) => {
    const r = 6 + i;
    const scoreCol = colLetter(DEMO + 1 + i), quotCol = colLetter(DEMO + 9 + i), lvlCol = colLetter(DEMO + 17 + i);
    ws.getCell(r, 1).value = v.name + ' (' + v.code + ')';
    ws.getCell(r, 2).value = { formula: `IFERROR(ROUND(AVERAGE(Responses!${scoreCol}2:${scoreCol}${LAST}),1),"")` };
    ws.getCell(r, 3).value = { formula: `IFERROR(ROUND(AVERAGE(Responses!${quotCol}2:${quotCol}${LAST}),2),"")` };
    LEVEL_NAMES.forEach((n, k) => { ws.getCell(r, 4 + k).value = { formula: `COUNTIF(Responses!${lvlCol}2:${lvlCol}${LAST},"${n}")` }; });
  });
  const r = 6 + HUQ.values.length;
  const totCol = colLetter(DEMO + 25), huqCol = colLetter(DEMO + 26), huqLvl = colLetter(DEMO + 27);
  ws.getCell(r, 1).value = 'Overall HuQ'; ws.getRow(r).font = { bold: true };
  ws.getCell(r, 2).value = { formula: `IFERROR(ROUND(AVERAGE(Responses!${totCol}2:${totCol}${LAST}),1),"")` };
  ws.getCell(r, 3).value = { formula: `IFERROR(ROUND(AVERAGE(Responses!${huqCol}2:${huqCol}${LAST}),2),"")` };
  LEVEL_NAMES.forEach((n, k) => { ws.getCell(r, 4 + k).value = { formula: `COUNTIF(Responses!${huqLvl}2:${huqLvl}${LAST},"${n}")` }; });
  ws.getCell(r + 2, 1).value = 'Score bands per quotient: 12–28 Self-Care · 29–44 Socio-Care · 45–60 Universal Care. Overall HuQ (96–480): ≤228 Self-Care · 229–356 Socio-Care · 357–480 Universal Care.';
  ws.getCell(r + 2, 1).font = { italic: true, color: { argb: 'FF6B5B4F' } };
  ws.getColumn(1).width = 30; for (let c = 2; c <= 6; c++) ws.getColumn(c).width = 18;
}

function buildNewWorkbook() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Humane Quotient Website';
  const ws = wb.addWorksheet('Responses');
  ws.addRow(HEADERS);
  styleHeader(ws);
  buildSummary(wb);
  wb.views = [{ activeTab: 0 }];
  return wb;
}

/* ---------- serialized writes ---------- */
let queue = Promise.resolve();
function appendRow(values) {
  const job = queue.then(async () => {
    let wb;
    if (fs.existsSync(XLSX_PATH)) {
      wb = new ExcelJS.Workbook(); await wb.xlsx.readFile(XLSX_PATH);
      if (wb.getWorksheet('Responses').getRow(1).getCell(DEMO).value !== 'Year / Experience / Stage') {
        // file written by an earlier layout: keep it untouched and start a fresh workbook
        fs.renameSync(XLSX_PATH, XLSX_PATH.replace(/\.xlsx$/, '') + '_previous_layout_' + Date.now() + '.xlsx');
        wb = buildNewWorkbook();
      }
    } else wb = buildNewWorkbook();
    const ws = wb.getWorksheet('Responses');
    ws.addRow(values);
    const tmp = XLSX_PATH + '.tmp';
    await wb.xlsx.writeFile(tmp);
    fs.renameSync(tmp, XLSX_PATH);
  });
  queue = job.catch(() => {});
  return job;
}

function istStamp(d) {
  return new Date(d.getTime() + 5.5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19);
}

/* ---------- app ---------- */
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
if (compression) app.use(compression());
app.use(express.json({ limit: '20kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// very small in-memory rate limit (IP is never stored on disk)
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 3600 * 1000, max = 40;
  const arr = (hits.get(ip) || []).filter((t) => now - t < win);
  arr.push(now); hits.set(ip, arr);
  return arr.length > max;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (!v.some((t) => now - t < 3600 * 1000)) hits.delete(k); }, 600000).unref();


/* ---------- email the report (name/email are used only for this; never written to Excel or JSONL) ---------- */
const SMTP = { host: process.env.SMTP_HOST, port: +(process.env.SMTP_PORT || 587), user: process.env.SMTP_USER, pass: process.env.SMTP_PASS, from: process.env.MAIL_FROM || process.env.SMTP_USER };
const mailer = SMTP.host && SMTP.user && SMTP.pass
  ? nodemailer.createTransport({ host: SMTP.host, port: SMTP.port, secure: SMTP.port === 465, auth: { user: SMTP.user, pass: SMTP.pass }, connectionTimeout: 8000, socketTimeout: 12000 })
  : null;
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function reportHtml(name, r) {
  const C = { Self: '#E0AC27', Socio: '#A8450F', Universal: '#850500' };
  const col = (i) => HUQ.levels[i].color, ink = (i) => HUQ.levels[i].ink;
  const rows = r.values.map((v, i) => {
    const def = HUQ.values[i];
    return `<tr><td style="padding:12px 10px;border-bottom:1px solid #E4D5CB"><b>${esc(v.name)}</b><br><span style="color:#A27C3F;font-size:12px">${esc(def.facet)}</span></td>
      <td style="padding:12px 10px;border-bottom:1px solid #E4D5CB;text-align:center;font-family:Georgia,serif;font-size:20px;color:#850500">${(Math.round(v.quotient * 10) / 10).toFixed(1)}<span style="font-size:11px;color:#A27C3F"> /10</span></td>
      <td style="padding:12px 10px;border-bottom:1px solid #E4D5CB"><span style="display:inline-block;background:${col(v.level)};color:${ink(v.level)};border-radius:100px;padding:3px 12px;font-size:12px;font-weight:bold">${esc(LEVEL_NAMES[v.level])}</span></td></tr>`;
  }).join('');
  const top = HUQ.values.find((v) => v.key === r.strongest[0]);
  return `<div style="background:#FFFDE9;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#470500">
  <div style="max-width:620px;margin:0 auto">
    <div style="background:#850500;color:#FFFDE9;border-radius:18px;padding:30px;text-align:center">
      <div style="letter-spacing:2px;font-size:12px;color:#E0AC27;text-transform:uppercase">Your Humane Quotient Report</div>
      <h1 style="font-family:Georgia,serif;font-weight:normal;margin:10px 0 0;font-size:26px">${esc(name)}</h1>
      <div style="font-family:Georgia,serif;font-style:italic;font-size:64px;line-height:1.1;color:#E0AC27">${(Math.round(r.huq * 10) / 10).toFixed(1)}<span style="font-size:20px;color:#E4D5CB"> / 10</span></div>
      <div style="display:inline-block;background:${col(r.level)};color:${ink(r.level)};border:1px solid #FFFDE9;border-radius:100px;padding:6px 20px;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:1px">${esc(LEVEL_NAMES[r.level])}</div>
    </div>
    <p style="margin:22px 0 6px"><b>Your strongest quotient:</b> ${esc(top.name)} &middot; ${esc(top.facet)}</p>
    <p style="margin:0 0 18px;color:#6B3A33">${esc(top.leverage)}</p>
    <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px"><tr><th align="left" style="padding:10px;font-size:11px;letter-spacing:1px;color:#A27C3F;text-transform:uppercase">Quotient</th><th style="padding:10px;font-size:11px;letter-spacing:1px;color:#A27C3F;text-transform:uppercase">Score</th><th align="left" style="padding:10px;font-size:11px;letter-spacing:1px;color:#A27C3F;text-transform:uppercase">Care level</th></tr>${rows}</table>
    <p style="margin:22px 0 6px;font-size:13px;color:#6B3A33">Open the website and visit <b>My Profile</b> and <b>Action Plan</b> for the full picture and practical steps to grow your Humane Quotient.</p>
    <p style="font-size:12px;color:#A27C3F">HuQ is designed for honest self-evaluation and personal growth. HuQ is not for judging, comparing or labelling individuals.<br>Sri Sathya Sai University for Human Excellence</p>
  </div></div>`;
}
async function sendReport(name, email, r) {
  if (!mailer) return false;
  try {
    await mailer.sendMail({ from: SMTP.from, to: email, subject: 'Your Humane Quotient (HuQ) report', html: reportHtml(name, r) });
    return true;
  } catch (e) { console.error('mail failed:', e.message); return false; }
}

// a retried submission (same submissionId) never creates a second row
const recent = new Map();
function remember(id, body) { if (!id) return; recent.set(id, { body, t: Date.now() }); if (recent.size > 500) recent.delete(recent.keys().next().value); }
function recall(id) { const r = id && recent.get(id); return r && Date.now() - r.t < 3600e3 ? r.body : null; }

app.post('/api/submit', async (req, res) => {
  try {
    const subId = typeof (req.body && req.body.submissionId) === 'string' ? req.body.submissionId.slice(0, 64) : '';
    const seen = recall(subId);
    if (seen) return res.json(seen);
    if (limited(req.ip)) return res.status(429).json({ ok: false, error: 'Too many submissions. Please try later.' });
    const { answers, demographics } = req.body || {};
    if (!Array.isArray(answers) || answers.length !== HUQ.totalQuestions ||
        !answers.every((a) => Number.isInteger(a) && a >= 1 && a <= 5)) {
      return res.status(400).json({ ok: false, error: 'Invalid answers.' });
    }
    const d = demographics || {};
    const name = String((req.body && req.body.name) || '').trim().slice(0, 80);
    const email = String((req.body && req.body.email) || '').trim();
    if (!name || email.length > 254 || !EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'Name and a valid email id are required.' });
    const P = HUQ.profile;
    const roleSel = pick(P.roles, d.role);
    const roleOther = clean(d.roleOther);
    const ac = P.academic[roleSel];
    const demo = {
      age: pick(ALLOWED.age, d.age), gender: pick(ALLOWED.gender, d.gender),
      role: roleSel === P.other ? (roleOther ? 'Other: ' + roleOther : '') : roleSel,
      organization: clean(d.organization),
      qualification: (() => { const q = pick(P.qualifications, d.qualification); return q === P.other ? (clean(d.qualificationOther) ? 'Other: ' + clean(d.qualificationOther) : '') : q; })(),
      course: ac ? clean(d.course) : '', stage: ac ? pick(ac.stages, d.stage) : ''
    };
    if (!demo.age || !demo.gender || !demo.role || !demo.organization || !demo.qualification || (ac && (!demo.course || !demo.stage))) return res.status(400).json({ ok: false, error: 'All profile fields are required.' });
    const r = HUQ.score(answers);
    const id = 'HuQ-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const ts = istStamp(new Date());
    const strongest = r.strongest.map((k) => HUQ.values.find((v) => v.key === k).name).join(' / ');
    const row = [id, ts, demo.age, demo.gender, demo.role, demo.organization, demo.qualification, demo.course, demo.stage]
      .concat(r.values.map((v) => v.score))
      .concat(r.values.map((v) => Math.round(v.quotient * 100) / 100))
      .concat(r.values.map((v) => LEVEL_NAMES[v.level]))
      .concat([r.total, Math.round(r.huq * 100) / 100, LEVEL_NAMES[r.level], strongest])
      .concat(answers);
    await appendRow(row);                                   // Excel first: if it fails the client is told and can retry
    try { fs.appendFileSync(JSONL_PATH, JSON.stringify({ id, ts, demo, answers }) + '\n'); } catch (e) { console.error('backup write failed:', e.message); }
    const emailed = await sendReport(name, email, r);
    const out = { ok: true, id, emailed };
    remember(subId, out);
    res.json(out);
  } catch (e) {
    console.error('submit failed:', e);
    res.status(500).json({ ok: false, error: 'Could not save response.' });
  }
});

function authed(req) {
  const k = req.get('x-admin-key') || req.query.key || '';
  const a = Buffer.from(String(k)), b = Buffer.from(ADMIN_KEY);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

app.get('/api/admin/download', (req, res) => {
  if (!authed(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  if (!fs.existsSync(XLSX_PATH)) return res.status(404).json({ ok: false, error: 'No responses recorded yet.' });
  res.download(XLSX_PATH, 'HuQ_Responses.xlsx');
});

app.get('/api/admin/count', (req, res) => {
  if (!authed(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const n = fs.existsSync(JSONL_PATH) ? fs.readFileSync(JSONL_PATH, 'utf8').split('\n').filter(Boolean).length : 0;
  res.json({ ok: true, count: n });
});

app.get('/admin', (req, res) => {
  res.type('html').send(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>HuQ Admin</title>
<style>body{font-family:system-ui,sans-serif;background:#FFFDE9;color:#470500;display:grid;place-items:center;min-height:100vh;margin:0}
.c{text-align:center;background:#fff;border:1px solid #E4D5CB;border-radius:18px;padding:32px;max-width:380px;width:90%;box-shadow:0 12px 40px rgba(71,5,0,.12)}
h1{font-size:20px;margin:0 0 6px}p{margin:0 0 18px;color:#A27C3F}input,button{width:100%;padding:12px 14px;border-radius:10px;font-size:15px;box-sizing:border-box}
input{border:1px solid #D5BDAF;margin-bottom:12px}button{border:0;background:#850500;color:#FFFDE9;font-weight:600;cursor:pointer}
#m{margin-top:12px;font-size:14px;min-height:20px}</style>
<div class="c"><img src="/img/huq-mark.webp" width="64" height="64" alt="" style="display:block;margin:0 auto 14px"><h1>Humane Quotient — Admin</h1><p>Download all responses as Excel.</p>
<input id="k" type="password" placeholder="Admin key" autocomplete="off"><button id="b">Download Excel</button><div id="m"></div></div>
<script>
const m=document.getElementById('m');
document.getElementById('b').onclick=async()=>{
  m.textContent='Checking…';
  try{
    const c=await fetch('/api/admin/count',{headers:{'x-admin-key':k.value}});
    if(!c.ok){m.textContent='Invalid admin key.';return}
    const n=(await c.json()).count;
    const r=await fetch('/api/admin/download',{headers:{'x-admin-key':k.value}});
    if(!r.ok){m.textContent=n? 'Could not download.' : 'No responses recorded yet.';return}
    const u=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=u;a.download='HuQ_Responses.xlsx';a.click();
    m.textContent='Downloaded ('+n+' responses).';
  }catch(e){m.textContent='Something went wrong.'}
};
</script>`);
});

/* ---------- static files: minified in memory, compressed, cached ---------- */
const PUB = path.join(__dirname, 'public');
const minCache = new Map();
function minified(rel, loader) {
  const file = path.join(PUB, rel), mt = fs.statSync(file).mtimeMs, hit = minCache.get(rel);
  if (hit && hit.mt === mt) return hit.code;
  const code = esbuild.transformSync(fs.readFileSync(file, 'utf8'), { loader, minify: true, legalComments: 'none' }).code;
  minCache.set(rel, { mt, code }); return code;
}
// the home document carries the (minified) stylesheet inline: no render-blocking request
const readIndex = () => fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');
app.get(['/', '/index.html'], (req, res, next) => {
  if (!esbuild) return next();
  try {
    const css = minified('css/styles.css', 'css').replace(/url\((['"]?)\.\.\//g, 'url($1');
    const html = readIndex().replace(/<link rel="stylesheet" href="css\/styles\.css">/, () => '<style>' + css + '</style>');
    res.set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }).send(html);
  } catch (e) { next(); }
});
app.get('/favicon.ico', (req, res) => res.redirect(301, '/img/huq-mark.webp'));
if (esbuild) {
  [['/css/styles.css', 'css', 'text/css; charset=utf-8'], ['/js/app.js', 'js', 'text/javascript; charset=utf-8'], ['/js/huq-data.js', 'js', 'text/javascript; charset=utf-8']].forEach(([url, loader, type]) => {
    app.get(url, (req, res, next) => {
      try { res.set({ 'Content-Type': type, 'Cache-Control': 'public, max-age=3600, must-revalidate' }).send(minified(url.slice(1), loader)); } catch (e) { next(); }
    });
  });
}
app.use(express.static(PUB, {
  extensions: ['html'],
  setHeaders(res, file) {
    if (/\.woff2$/.test(file)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    else if (/\.(webp|png|jpg|svg)$/.test(file)) res.setHeader('Cache-Control', 'public, max-age=2592000');
    else if (/(sw\.js|\.html)$/.test(file)) res.setHeader('Cache-Control', 'no-cache');
    else res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  }
}));

/* ---------- friendly error pages (flower logo) ---------- */
function statePage(eyebrow, title, text) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Humane Quotient</title><link rel="icon" type="image/webp" href="/img/huq-mark.webp"><meta name="theme-color" content="#850500">
<style>
@font-face{font-family:"Cormorant Garamond";font-weight:600;font-display:swap;src:url(/fonts/cormorant-garamond-latin-600-normal.woff2) format("woff2")}
@font-face{font-family:Jost;font-weight:100 900;font-display:swap;src:url(/fonts/jost-latin-wght-normal.woff2) format("woff2")}
body{margin:0;min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px;box-sizing:border-box;background:#FFFDE9;color:#470500;font-family:Jost,system-ui,sans-serif;text-align:center;line-height:1.6}
main{max-width:520px}
.l{position:relative;width:112px;height:112px;margin:0 auto 24px}
.l:before{content:"";position:absolute;inset:-24%;border-radius:50%;background:radial-gradient(circle,rgba(224,172,39,.3),rgba(224,172,39,0) 66%)}
.l img{position:relative;display:block;width:100%;height:100%;animation:in .9s cubic-bezier(.22,1,.36,1) both}
@keyframes in{from{opacity:0;transform:scale(.7) rotate(-45deg)}to{opacity:1;transform:none}}
.e{font-size:.78rem;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:#A8450F}
h1{font:600 clamp(2rem,6vw,3rem)/1.1 "Cormorant Garamond",Georgia,serif;margin:.2em 0 .4em}
p{margin:0}
a{display:inline-block;margin-top:24px;padding:14px 28px;border-radius:999px;background:#850500;color:#FFFDE9;font-weight:600;text-decoration:none}
a:focus-visible{outline:3px solid #E0AC27;outline-offset:3px}
@media (prefers-reduced-motion:reduce){.l img{animation:none}}
</style></head><body><main><div class="l"><img src="/img/huq-mark.webp" width="112" height="112" alt=""></div>
<span class="e">${eyebrow}</span><h1>${title}</h1><p>${text}</p><a href="/">Go to the Humane Quotient home</a></main></body></html>`;
}
const wantsJson = (req) => req.path.startsWith('/api/') || req.accepts(['html', 'json']) === 'json';
app.use((req, res) => {
  res.status(404).set('Cache-Control', 'no-store');
  if (wantsJson(req)) return res.json({ ok: false, error: 'Not found.' });
  res.type('html').send(statePage('Error 404', 'We can’t find that page', 'The page you are looking for does not exist or has moved. Let’s take you back to the beginning.'));
});
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('request failed:', err);
  if (res.headersSent) return next(err);
  res.status(status).set('Cache-Control', 'no-store');
  if (wantsJson(req)) return res.json({ ok: false, error: status === 413 ? 'Request too large.' : status < 500 ? 'Invalid request.' : 'Something went wrong on our side.' });
  res.type('html').send(statePage('Something went wrong', 'That page didn’t load properly', 'Something unexpected happened on our side. Please try again in a moment.'));
});

app.listen(PORT, () => {
  console.log(`\n  Humane Quotient site running on http://localhost:${PORT}`);
  console.log(`  Responses file : ${XLSX_PATH}`);
  console.log(`  Admin page     : http://localhost:${PORT}/admin   (key stored in ${process.env.ADMIN_KEY ? 'ADMIN_KEY env var' : KEY_PATH})\n`);
});
