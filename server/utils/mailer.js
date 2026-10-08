const nodemailer = require('nodemailer');
const HUQ = require('../huq-data');

const SMTP = {
  host: process.env.SMTP_HOST,
  port: +(process.env.SMTP_PORT || 587),
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@humanequotient.org'
};

const mailer = SMTP.host && SMTP.user && SMTP.pass
  ? nodemailer.createTransport({
      host: SMTP.host,
      port: SMTP.port,
      secure: SMTP.port === 465,
      auth: { user: SMTP.user, pass: SMTP.pass },
      connectionTimeout: 8000,
      socketTimeout: 12000
    })
  : null;

const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function reportHtml(name, r) {
  const LEVEL_NAMES = HUQ.levels.map((l) => l.name);
  const col = (i) => HUQ.levels[i].color;
  const ink = (i) => HUQ.levels[i].ink;

  const rows = r.values.map((v, i) => {
    const def = HUQ.values[i];
    return `<tr>
      <td style="padding:12px 10px;border-bottom:1px solid #E4D5CB">
        <b>${esc(v.name)}</b><br><span style="color:#A27C3F;font-size:12px">${esc(def.facet)}</span>
      </td>
      <td style="padding:12px 10px;border-bottom:1px solid #E4D5CB;text-align:center;font-family:Georgia,serif;font-size:20px;color:#850500">
        ${(Math.round(v.quotient * 10) / 10).toFixed(1)}<span style="font-size:11px;color:#A27C3F"> /10</span>
      </td>
      <td style="padding:12px 10px;border-bottom:1px solid #E4D5CB">
        <span style="display:inline-block;background:${col(v.level)};color:${ink(v.level)};border-radius:100px;padding:3px 12px;font-size:12px;font-weight:bold">${esc(LEVEL_NAMES[v.level])}</span>
      </td>
    </tr>`;
  }).join('');

  const topKey = r.strongest && r.strongest[0];
  const top = HUQ.values.find((v) => v.key === topKey) || HUQ.values[0];

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
    <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px">
      <tr>
        <th align="left" style="padding:10px;font-size:11px;letter-spacing:1px;color:#A27C3F;text-transform:uppercase">Quotient</th>
        <th style="padding:10px;font-size:11px;letter-spacing:1px;color:#A27C3F;text-transform:uppercase">Score</th>
        <th align="left" style="padding:10px;font-size:11px;letter-spacing:1px;color:#A27C3F;text-transform:uppercase">Care level</th>
      </tr>
      ${rows}
    </table>
    <p style="margin:22px 0 6px;font-size:13px;color:#6B3A33">Visit the website to view your full <b>Profile</b> and <b>Action Plan</b> for practical steps to grow your Humane Quotient.</p>
    <p style="font-size:12px;color:#A27C3F">HuQ is designed for honest self-evaluation and personal growth. HuQ is not for judging, comparing or labelling individuals.<br>Sri Sathya Sai University for Human Excellence</p>
  </div></div>`;
}

async function sendReportEmail(name, toEmail, results) {
  if (!mailer) {
    console.log(`[Email] Mailer not configured with SMTP. Simulating email send to ${toEmail}.`);
    return false;
  }
  try {
    await mailer.sendMail({
      from: SMTP.from,
      to: toEmail,
      subject: 'Your Humane Quotient (HuQ) Report',
      html: reportHtml(name, results)
    });
    return true;
  } catch (err) {
    console.error('Mail delivery failed:', err.message);
    return false;
  }
}

module.exports = {
  sendReportEmail,
  reportHtml
};
