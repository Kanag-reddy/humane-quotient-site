/* Humane Quotient website — front-end (no framework, hash-routed single page) */
(function () {
  'use strict';
  const H = window.HUQ;
  const V = H.values;
  const $app = document.getElementById('app');
  const $nav = document.getElementById('nav');

  document.addEventListener('touchstart', function () {}, { passive: true });   // lets iOS Safari apply :active press feedback

  /* ---------------- state ---------------- */
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  const state = {
    answers: Array(H.totalQuestions).fill(0),
    demo: { age: '', gender: '', role: '', roleOther: '', organization: '', qualification: '', qualificationOther: '', course: '', stage: '' },
    phase: 'intro', step: 0, result: null, sent: false
  };
  (function restore() {
    const a = store.get('huq.answers');
    if (Array.isArray(a) && a.length === H.totalQuestions) state.answers = a;
    const d = store.get('huq.demo'); if (d) state.demo = d;
    state.sent = !!store.get('huq.sent'); state.mailed = !!store.get('huq.mailed');
    if (complete()) state.result = H.score(state.answers);
  })();
  function complete() { return state.answers.every((x) => x >= 1 && x <= 5); }

  /* ---------------- helpers ---------------- */
  const ICONS = {
    se: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    em: '<circle cx="12" cy="12" r="2.4"/>' + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = i * Math.PI / 4; return `<circle cx="${(12 + 8 * Math.sin(a)).toFixed(2)}" cy="${(12 - 8 * Math.cos(a)).toFixed(2)}" r="1.5"/>`; }).join(''),
    in: '<path d="M12 3l7 3v5c0 5-3.2 8.2-7 10-3.8-1.8-7-5-7-10V6z"/><path d="M8.8 12l2.3 2.3L15.5 9.8"/>',
    ac: '<circle cx="9" cy="12" r="5.2"/><circle cx="15" cy="12" r="5.2"/>',
    re: '<circle cx="12" cy="7" r="2.3"/><circle cx="5.8" cy="9.5" r="2"/><circle cx="18.2" cy="9.5" r="2"/><path d="M3 18c3.2 3 15 3 18 0"/><path d="M8 14.5c1.2-1.2 2.4-1.6 4-1.6s2.8.4 4 1.6"/>',
    eq: '<path d="M12 4v16M7 20h10M5 7.5h14"/><path d="M5 7.5L2.6 13.5a2.6 2.6 0 0 0 4.8 0zM19 7.5l-2.4 6a2.6 2.6 0 0 0 4.8 0z"/>',
    di: '<path d="M12 3l9 9-9 9-9-9z"/><path d="M12 8l4 4-4 4-4-4z"/>',
    ic: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'
  };
  function icon(key, size, color) {
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color || 'currentColor'}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[key]}</svg>`;
  }
  const pol = (r, i) => { const a = i * Math.PI / 4; return [r * Math.sin(a), -r * Math.cos(a)]; };
  const petalPath = (r0, L, w) => {
    const d = L - r0;
    return `M0,${-r0} C${w},${-(r0 + d * .22)} ${w * .95},${-(r0 + d * .78)} 0,${-L} C${-w * .95},${-(r0 + d * .78)} ${-w},${-(r0 + d * .22)} 0,${-r0}Z`;
  };
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const f1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
  const lvl = (i) => H.levels[i];
  const byKey = (k) => V.find((v) => v.key === k);
  const idxOf = (k) => V.findIndex((v) => v.key === k);

  /* ---------------- infographic: the HuQ flower ---------------- */
  function flowerResult(res) {
    const R0 = 44, L1 = 215;
    let track = '', fills = '', labels = '';
    res.values.forEach((v, i) => {
      const pct = clamp((v.score - H.VALUE_MIN) / (H.VALUE_MAX - H.VALUE_MIN), 0, 1);
      const len = R0 + (L1 - R0 - 6) * (0.1 + 0.9 * pct);
      const top = res.strongest.indexOf(v.key) > -1;
      track += `<g transform="rotate(${i * 45})"><path class="bt" style="animation-delay:${(0.2 + i * 0.07).toFixed(2)}s" d="${petalPath(R0, L1, 68)}" fill="#E4D5CB" fill-opacity=".55" stroke="#D5BDAF" stroke-opacity=".6"/></g>`;
      fills += `<g transform="rotate(${i * 45})"><path class="bp" style="animation-delay:${(0.7 + i * 0.08).toFixed(2)}s" d="${petalPath(R0, len, 50)}" fill="${lvl(v.level).color}" fill-opacity=".95" stroke="${top ? '#470500' : '#FFFDE9'}" stroke-width="${top ? 2.6 : 1}"/></g>`;
      if (top) { const [sx, sy] = pol(R0 + (L1 - R0) * .55 + 0, i); fills += `<g transform="translate(${sx.toFixed(1)},${sy.toFixed(1)})"><g class="bs" style="animation-delay:${(1.5 + i * 0.07).toFixed(2)}s"><path transform="scale(1.5)" d="M0,-9 2.6,-3 9,-2.5 4.2,1.8 5.6,8 0,4.7 -5.6,8 -4.2,1.8 -9,-2.5 -2.6,-3Z" fill="#E0AC27" stroke="#470500" stroke-width="1.2"/></g></g>`; }
      let [lx, ly] = pol(252, i);
      if (i === 0) ly -= 14; if (i === 4) ly += 8;
      labels += `<g class="bl" style="animation-delay:${(1.4 + i * 0.06).toFixed(2)}s"><text x="${lx.toFixed(1)}" y="${(ly - 2).toFixed(1)}" text-anchor="middle" class="flower-label" font-size="13" fill="#470500">${v.name.toUpperCase()}${top ? ' ★' : ''}</text>
        <text x="${lx.toFixed(1)}" y="${(ly + 14).toFixed(1)}" text-anchor="middle" font-family="Jost,sans-serif" font-size="12" font-weight="500" fill="#A27C3F">${v.score}/60 · ${f1(v.quotient)}/10</text></g>`;
    });
    return `<svg class="bloom" viewBox="-335 -335 670 670" role="img" aria-label="Your HuQ flower showing your score for each of the eight quotients">
      <title>Click to watch the flower bloom again</title>
      <circle class="bring" r="262" fill="none" stroke="#E4D5CB" stroke-dasharray="2 8"/>${track}<g class="bsway">${fills}</g>${labels}
      <g class="bc"><circle r="47" fill="#FFFDE9" stroke="#850500" stroke-width="3"/>
      <text y="4" text-anchor="middle" font-family="'Cormorant Garamond',serif" font-weight="600" font-size="30" fill="#850500">${f1(res.huq)}</text>
      <text y="19" text-anchor="middle" font-family="Jost,sans-serif" font-weight="600" font-size="8" letter-spacing="1" fill="#470500">HuQ / 10</text></g></svg>`;
  }
  function spectrum(score, min, max, label, sm) {
    const pct = clamp((score - min) / (max - min), 0, 1) * 100;
    return `<div class="spectrum${sm ? ' sm' : ''}" role="img" aria-label="${label}: between Self-Care, Socio-Care and Universal Care">
      <div class="zones"><span class="z z1" style="width:34.4%">Self-Care</span><span class="z z2" style="width:33.3%">Socio-Care</span><span class="z z3" style="width:32.3%">Universal Care</span></div>
      <div class="mk" data-pct="${pct.toFixed(1)}" style="--pct:${pct.toFixed(1)}%"><b>${label}</b><i></i></div></div>`;
  }
  function animateMarkers(root) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const mk = Array.from(root.querySelectorAll('.mk[data-pct]'));
      const widths = mk.map((m) => m.parentElement.clientWidth);                       // read once ...
      mk.forEach((m, i) => m.style.setProperty('--from', (parseFloat(m.dataset.pct) / 100 * widths[i]).toFixed(1) + 'px'));
      requestAnimationFrame(() => mk.forEach((m) => m.classList.add('go')));            // ... then animate next frame
      root.querySelectorAll('.mini i[data-w]').forEach((b) => { b.style.setProperty('--w', (b.dataset.w / 100).toFixed(3)); });
    }));
  }


  /* ---------------- ambient motion: petals + parallax ---------------- */
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* page lifecycle: everything a page starts (observers, timers, frames) is stopped when the next page renders */
  let io = null; const cleanups = [];
  function teardown() {
    if (io) { io.disconnect(); io = null; }
    while (cleanups.length) { try { cleanups.pop()(); } catch (e) { /* ignore */ } }
  }
  function later(fn, ms) { const id = setTimeout(fn, ms); cleanups.push(() => clearTimeout(id)); return id; }
  /* low-end devices and data-saver: no blur, no ambient loops. Hidden tab: pause every animation. */
  (function perfMode() {
    const n = navigator, root = document.documentElement;
    if ((n.deviceMemory && n.deviceMemory <= 4) || (n.hardwareConcurrency && n.hardwareConcurrency <= 4) || (n.connection && n.connection.saveData)) root.classList.add('lite');
    document.addEventListener('visibilitychange', () => root.classList.toggle('tab-hidden', document.hidden));
  })();
  function petals() {
    const hero = $app.querySelector('.hero, .prof-hero, .plan-hero');
    if (!hero || hero.querySelector('.petals') || reduced()) return;
    let g = '';
    for (let i = 0; i < 9; i++) {
      const left = 4 + (i * 11.3) % 92, size = 26 + (i * 17) % 40, dur = 12 + (i * 5) % 9, delay = -((i * 7) % 12);
      g += `<svg class="pt-s" viewBox="-30 -60 60 70" style="left:${left}%;width:${size}px;animation-duration:${dur}s;animation-delay:${delay}s" aria-hidden="true"><path d="${petalPath(2, 54, 22)}" fill="${i % 3 ? '#FFFDE9' : '#E4D5CB'}" fill-opacity="${i % 2 ? .07 : .1}"/></svg>`;
    }
    const d = document.createElement('div'); d.className = 'petals'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = g;
    hero.insertBefore(d, hero.firstChild);
  }
  /* parallax is for desktop-class pointer devices only: on touch screens it fights native momentum scrolling */
  const pxQuery = window.matchMedia ? window.matchMedia('(min-width:1024px) and (hover:hover) and (pointer:fine)') : { matches: false };
  let pxOn = false;
  function parallaxInit() {
    if (pxOn || reduced()) return; pxOn = true;
    let tick = false;
    const reset = () => $app.querySelectorAll('.hero-art img, .stream svg').forEach((el) => { el.style.transform = ''; });
    if (pxQuery.addEventListener) pxQuery.addEventListener('change', () => { if (!pxQuery.matches) reset(); });
    window.addEventListener('scroll', () => {
      if (tick || !pxQuery.matches) return; tick = true;
      requestAnimationFrame(() => {
        tick = false;
        const vh = window.innerHeight, y = window.scrollY, jobs = [];
        $app.querySelectorAll('.hero-art img, .stream svg').forEach((el) => {          // reads first ...
          const r = el.parentElement.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const hero = !!el.closest('.hero-art');
          jobs.push([el, hero ? y * 0.3 : -(vh / 2 - (r.top + r.height / 2)) * 0.3]);
        });
        jobs.forEach(([el, d]) => { el.style.transform = `translate3d(0,${d.toFixed(1)}px,0)`; }); // ... then writes
      });
    }, { passive: true });
  }

  /* ---------------- nav: glass on scroll, mobile menu ---------------- */
  (function navMotion() {
    let t = false;
    const apply = () => { t = false; $nav.classList.toggle('scrolled', window.scrollY > 20); };
    window.addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(apply); } }, { passive: true }); apply();
    const btn = document.getElementById('navBtn'), menu = document.getElementById('mainNav'), foot = document.querySelector('.foot');
    if (btn && menu) {
      /* phones: full-screen overlay. While open the page behind it is inert (no focus, no scroll), Esc closes, focus returns to the button. */
      const set = (open, refocus) => {
        $nav.classList.toggle('open', open); document.documentElement.classList.toggle('nav-open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false'); btn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
        $app.inert = open; if (foot) foot.inert = open;
        if (open) { const a = menu.querySelector('a[aria-current="page"], a.active') || menu.querySelector('a:not(.locked)'); if (a) a.focus({ preventScroll: true }); }
        else if (refocus) btn.focus({ preventScroll: true });
      };
      btn.addEventListener('click', () => set(!$nav.classList.contains('open'), false));
      menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false, false)));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $nav.classList.contains('open')) { set(false, true); } });
      const wide = window.matchMedia ? window.matchMedia('(min-width:768px)') : null;       // the overlay only exists below 768px
      if (wide && wide.addEventListener) wide.addEventListener('change', () => { if (wide.matches && $nav.classList.contains('open')) set(false, false); });
    }
  })();

  /* ---------------- score count-up + confetti ---------------- */
  function countUp(root) {
    if (reduced()) return;
    root.querySelectorAll('[data-count]').forEach((el) => {
      const to = parseFloat(el.dataset.count), dur = 900, t0 = performance.now();
      let raf = 0;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = (to * e).toFixed(1);
        if (k < 1) raf = requestAnimationFrame(tick); else el.textContent = to.toFixed(1);
      };
      cleanups.push(() => cancelAnimationFrame(raf));
      el.textContent = (0).toFixed(1); raf = requestAnimationFrame(tick);
    });
  }
  function confetti(host) {
    if (reduced() || !host) return;
    const cols = ['#E0AC27', '#C97F1C', '#A8450F', '#850500', '#FFFDE9', '#D5BDAF'];
    const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 12; i++) {
      const c = document.createElement('i');
      c.style.cssText = `left:${6 + i * 7.8}%;background:${cols[i % cols.length]};animation:confetti ${1.6 + (i % 5) * .2}s ease-out ${(i % 7) * .12}s forwards`;
      box.appendChild(c);
    }
    host.appendChild(box); later(() => box.remove(), 4200); cleanups.push(() => box.remove());
  }

  /* ---------------- flower-logo states: not found, no data, error ---------------- */
  const BADGES = {
    notfound: '<path d="M9.2 9.2a2.9 2.9 0 1 1 4.1 2.6c-.9.5-1.3 1.1-1.3 2.1M12 17.4h.01"/>',
    empty: '<path d="M4 13l2.5-7h11L20 13v5H4z"/><path d="M4 13h4.5l1 2h5l1-2H20"/>',
    error: '<path d="M12 6.5v7M12 17.5h.01"/>',
    offline: '<path d="M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8a15 15 0 0 0-8.3-3.7M5.6 12.4a10 10 0 0 1 3.1-1.8M18.4 12.4a10 10 0 0 0-3.5-2M8.8 16a5 5 0 0 1 6.4 0M12 19.5h.01M3 3l18 18"/>'
  };
  /* the real logo mark, optionally with a small status badge (the same mark is used for every loading / error / empty state) */
  function logoMark(kind) {
    return `<div class="state-logo"><img class="state-mark" src="img/huq-mark.webp" width="120" height="120" alt="">${kind ? `<i class="state-badge"><svg viewBox="0 0 24 24" aria-hidden="true">${BADGES[kind]}</svg></i>` : ''}</div>`;
  }
  function stateView(o) {
    teardown();
    $app.innerHTML = `<section class="state-page"><div class="wrap"><div class="state state-${o.kind}" role="${o.kind === 'error' ? 'alert' : 'status'}">
      ${logoMark(o.kind)}<span class="eyebrow">${o.eyebrow}</span><h1>${o.title}</h1><p class="lead">${o.text}</p>
      <div class="state-actions">${o.actions.map((a, i) => a.href ? `<a class="btn ${i ? 'ghost' : 'primary'}" href="${a.href}">${a.label}</a>` : `<button class="btn ${i ? 'ghost' : 'primary'}" type="button" data-act="${a.act}">${a.label}</button>`).join('')}</div></div></div></section>`;
    $app.querySelectorAll('[data-act="reload"]').forEach((b) => { b.onclick = () => location.reload(); });
  }
  function notFoundView() {
    stateView({ kind: 'notfound', eyebrow: 'Error 404', title: 'We can’t find that page', text: 'The page you are looking for does not exist or has moved. Let’s take you back to the beginning.',
      actions: [{ href: '#/', label: 'Go to the introduction' }, { href: '#/test', label: 'Take the test' }] });
  }
  function emptyView(r) {
    const done = state.answers.filter((x) => x >= 1).length, what = r === 'plan' ? 'action plan' : 'profile';
    stateView({ kind: 'empty', eyebrow: 'No data yet', title: `Your ${what} is waiting for your answers`,
      text: done ? `You have answered ${done} of ${H.totalQuestions} questions so far. Finish the test and your ${what} will appear here.` : `Your ${what} appears here once you have answered all ${H.totalQuestions} questions. It takes about 12 minutes.`,
      actions: [{ href: '#/test', label: done ? 'Continue the test →' : 'Begin the test →' }, { href: '#/', label: 'Read the introduction' }] });
  }
  function errorView() {
    try {
      stateView({ kind: 'error', eyebrow: 'Something went wrong', title: 'That page didn’t load properly', text: 'Something unexpected happened on our side. Your answers are safe on this device — reload the page to continue.',
        actions: [{ act: 'reload', label: 'Reload page' }, { href: '#/', label: 'Go to the introduction' }] });
    } catch (e) { $app.innerHTML = '<p style="padding:48px 20px;text-align:center">Something went wrong. Please reload the page.</p>'; }
  }

  /* ---------------- router ---------------- */
  const routes = { '': home, about: home, test: test, profile: profile, plan: plan };
  function currentRoute() { return (location.hash.replace(/^#\/?/, '') || '').split('?')[0]; }
  let navToken = 0, firstPaint = true;
  function route() {
    const r = currentRoute();
    const known = Object.prototype.hasOwnProperty.call(routes, r);
    const empty = known && (r === 'profile' || r === 'plan') && !state.result;      // no results yet: show the empty state, not a blank page
    const token = ++navToken;
    setNav(known && !empty ? (r === 'about' ? 'home' : r || 'home') : '');
    const render = () => {
      if (token !== navToken) return;                    // a newer navigation took over
      teardown();
      $app.classList.remove('out');
      try { if (!known) notFoundView(); else if (empty) emptyView(r); else routes[r](r); } catch (err) { console.error(err); errorView(); }
      if (!reduced() && $app.animate) $app.animate([{ opacity: 0, transform: 'translate3d(14px,0,0)' }, { opacity: 1, transform: 'none' }], { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' });
      if (r !== 'about') window.scrollTo({ top: 0, behavior: 'instant' });
      observeReveal();
      $app.focus({ preventScroll: true });
    };
    if (firstPaint || reduced() || !$app.firstElementChild) { firstPaint = false; render(); return; }
    $app.classList.add('out');                           // exit (150 ms), then enter
    setTimeout(render, 150);
  }
  $nav.addEventListener('click', (e) => { const a = e.target.closest('a[aria-disabled="true"]'); if (a) e.preventDefault(); });
  function setNav(r) {
    $nav.querySelectorAll('nav a').forEach((a) => {
      a.classList.toggle('active', a.dataset.route === r);
      if (a.dataset.route === 'profile' || a.dataset.route === 'plan') {
        a.classList.toggle('locked', !state.result);
        if (!state.result) { a.setAttribute('aria-disabled', 'true'); a.tabIndex = -1; } else { a.removeAttribute('aria-disabled'); a.removeAttribute('tabindex'); }
      }
    });
  }
  function observeReveal(root, late) {
    root = root || $app;
    const els = Array.from(root.querySelectorAll('.rv'));
    const seen = new Map();
    els.forEach((e) => { const p = e.parentElement; const n = seen.get(p) || 0; seen.set(p, n + 1); e.style.transitionDelay = (n % 3) * 80 + 'ms'; });   // stagger: 0 / 80 / 160 ms
    if (!late) { petals(); parallaxInit(); }
    if (!('IntersectionObserver' in window)) return;
    if (late) els.forEach((e) => e.classList.add('pre'));                       // content revealed by a click: every block fades in as it scrolls into view
    /* no layout reads: the observer's first callback tells us what is already on screen */
    const ob = new IntersectionObserver((en) => en.forEach((e) => {
      const t = e.target, first = !t.__seen; t.__seen = true;
      if (!e.isIntersecting) { if (first && !late) t.classList.add('pre'); return; }   // below the fold: hide until it scrolls in
      ob.unobserve(t);                                                          // each element is handled once
      if (first && !late) { t.style.transitionDelay = ''; return; }             // visible on load: no animation
      t.classList.add('in');
      const done = () => { t.classList.remove('pre'); t.style.transitionDelay = ''; };   // releases will-change
      t.addEventListener('transitionend', done, { once: true }); later(done, 900);
    }), { threshold: 0.12 });
    if (late) cleanups.push(() => ob.disconnect()); else io = ob;
    els.forEach((e) => ob.observe(e));
  }

  /* ---------------- HOME / INTRODUCTION ---------------- */
  function home(r) {
    $app.innerHTML = `
    <section class="hero"><picture class="hero-bg" aria-hidden="true"><source media="(min-width:768px)" srcset="img/hero-red-desktop.webp" width="1920" height="1300"><img src="img/hero-red-mobile.webp" width="1000" height="1300" alt="" decoding="async" fetchpriority="high"></picture>
      <a class="cue" href="#/about" aria-label="Scroll to the introduction"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg></a>
      <div class="wrap">
        <div>
          <span class="eyebrow pill-eb">A self-reflection tool for eight humane values</span>
          <h1><small>Test your</small>Humane<br>Quotient</h1>
          <p class="lead">How far has your care evolved — from caring for yourself, to caring for family and community, to caring for everyone? Discover your Humane Quotient and a path to grow it.</p>
          <div class="actions">
            <a class="btn gold" href="#/test">Begin the test →</a>
            <a class="btn ghost" href="#/about">What is HuQ?</a>
          </div>
          <div class="facts"><div><b>8</b>core humane values</div><div><b>96</b>reflective questions</div><div><b>~12</b>minutes</div></div>
        </div>
        <div class="hero-art"><img src="img/huq-flower-520.webp" srcset="img/huq-flower-520.webp 520w, img/huq-flower-760.webp 760w, img/huq-flower.webp 1000w" sizes="(max-width:639px) 78vw, (max-width:1023px) 56vw, 503px" width="1000" height="1000" fetchpriority="high" decoding="async" alt="The HuQ flower: eight core humane values around the centre, Selflessness, Empathy, Integrity, Acceptance, Responsibility, Equity, Diversity and Inclusivity, each linked to a facet of One World One Family"></div>
      </div>
    </section>

    <section id="about"><div class="wrap two">
      <div class="rv">
        <span class="eyebrow">Introduction</span>
        <h2>Our humaneness can be measured, nurtured and grown.</h2>
        <p class="lead">A <em>quotient</em> quantifies an attribute of a person — like IQ or EQ. The <b>Humane Quotient (HuQ)</b> evaluates how <em>humane</em> an individual is.</p>
        <p>Being <em>human</em> describes who we are. Being <em>humane</em> describes the quality of showing compassion and care for others. HuQ turns eight universal humane values into something you can reflect on, assess and work upon.</p>
        <div class="pillrow"><span class="pill">Self-reflection</span><span class="pill">Questionnaire · Score · Action plan</span></div>
      </div>
      <div class="card rv"><h3 class="serif" style="font-size:1.7rem;font-weight:600">“Humaneness” — a definition</h3>
        <p class="serif" style="font-size:1.35rem;line-height:1.4;margin:0">The quality of compassion or consideration for others. Cultivating humane qualities helps an individual evolve and find the true purpose of life — <em>oneness with everyone</em>.</p>
        <p style="margin:1.1rem 0 0;color:#6b3a33;font-size:.97rem">The model rests on values that apply to everyone, regardless of culture, belief or background. In line with the ideal of One World One Family.</p></div>
    </div></section>

    <section id="care"><div class="wrap">
      <div class="rv" style="max-width:760px"><span class="eyebrow">The core idea</span>
        <h2>The Evolution of Care</h2>
        <p class="lead">Like drops of water that begin in a small stream, flow into a river and finally merge into the ocean — the drops stay the same, but their form evolves. Care grows the same way: from Self-Care, to Socio-Care, to Universal Care.</p></div>
      <div class="stream rv">${streamSVG()}</div>
      <div class="care">
        <div class="c c1 rv"><div class="big">Stream</div><h3>Self-Care</h3><p>Care solely for the individual, with little or no regard for others.</p></div>
        <div class="c c2 rv"><div class="big">River</div><h3>Socio-Care</h3><p>Care for one’s family, friends and community with kindness and loyalty.</p></div>
        <div class="c c3 rv"><div class="big">Ocean</div><h3>Universal Care</h3><p>Care for all people with compassion, kindness and empathy.</p></div>
      </div>
    </div></section>

    <section id="values"><div class="wrap">
      <div class="rv" style="max-width:760px"><span class="eyebrow">The HuQ model</span>
        <h2>Eight core humane values</h2>
        <p class="lead">Five values — <b>Selflessness, Empathy, Integrity, Acceptance, Responsibility</b> — form the <b>Human Essence</b>. Three — <b>Equity, Diversity, Inclusivity</b> — are the practical lens for real-world interaction.</p></div>
      ${equation()}
    </div></section>

    <section id="explore"><div class="wrap">
      <div class="rv" style="max-width:760px"><span class="eyebrow">Explore</span>
        <h2>Explore the eight values</h2></div>
      <div class="vals rv">
        <div class="fl" id="flowerBox"><div class="fimg"><img src="img/huq-flower.webp" width="1000" height="1000" loading="lazy" decoding="async" alt="" aria-hidden="true"><button type="button" class="hs" data-i="0" aria-label="Selflessness" style="left:50.0%;top:15.5%"></button><button type="button" class="hs" data-i="1" aria-label="Empathy" style="left:74.4%;top:25.6%"></button><button type="button" class="hs" data-i="2" aria-label="Integrity" style="left:84.5%;top:50.0%"></button><button type="button" class="hs" data-i="3" aria-label="Acceptance" style="left:74.4%;top:74.4%"></button><button type="button" class="hs" data-i="4" aria-label="Responsibility" style="left:50.0%;top:84.5%"></button><button type="button" class="hs" data-i="5" aria-label="Equity" style="left:25.6%;top:74.4%"></button><button type="button" class="hs" data-i="6" aria-label="Diversity" style="left:15.5%;top:50.0%"></button><button type="button" class="hs" data-i="7" aria-label="Inclusivity" style="left:25.6%;top:25.6%"></button></div><p class="hint">Each humane value becomes visible as a facet of One World One Family — Service, Compassion, Ethics, Harmony, Stewardship, Social Justice, Interconnectedness and Wholeness.</p></div>
        <div class="detail" id="detail"></div>
      </div></div></section>

    <section id="how"><div class="wrap">
      <div class="rv" style="max-width:760px"><span class="eyebrow">How it works</span><h2>Eight steps. One profile.</h2></div>
      <div class="steps3 rv">
        <div class="card"><b class="n">1</b><h3>Answer honestly</h3><p>Eight short steps, one per value, twelve questions each. For every statement, choose how often it is true for you in a typical week — from <em>Almost Never</em> to <em>Almost Always</em>.</p></div>
        <div class="card"><b class="n">2</b><h3>Get your HuQ Profile</h3><p>See your score for every quotient, your overall HuQ, your strongest value, and where each sits on the journey from Self-Care to Socio-Care to Universal Care.</p></div>
        <div class="card"><b class="n">3</b><h3>Grow with an action plan</h3><p>Use your strongest value as a foundation to build the others, with practical steps ordered by where you can grow most.</p></div>
      </div>
      <div class="note rv" style="margin-top:34px">HuQ is designed for honest <b>self-evaluation and personal growth</b>. HuQ is not for judging, comparing or labelling individuals.</div>
      <div style="text-align:center;margin-top:44px" class="rv"><a class="btn primary" href="#/test">Take the Humane Quotient test →</a></div>
    </div></section>`;

    // interactive flower + detail panel
    const box = document.getElementById('flowerBox');
    const detail = document.getElementById('detail');
    function show(i) {
      const v = V[i];
      box.querySelectorAll('[data-i]').forEach((g) => g.classList.toggle('on', +g.dataset.i === i));
      detail.innerHTML = `<span class="tag ${i > 4 ? 'edi' : ''}">${v.group}</span>
        <h3>${v.name}</h3><div class="fc">${v.facet} · ${v.code}</div>
        <div class="def">${v.definition}</div><p>${v.facetText}</p>
        <div class="dots">${V.map((x, k) => `<button data-k="${k}" class="${k === i ? 'on' : ''}" aria-label="${x.name}">${x.name}</button>`).join('')}</div>`;
      detail.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => show(+b.dataset.k)));
    }
    box.addEventListener('mouseover', (e) => { const g = e.target.closest('[data-i]'); if (g) show(+g.dataset.i); });
    box.addEventListener('click', (e) => {
      const g = e.target.closest('[data-i]'); if (!g) return;
      show(+g.dataset.i);
      if (window.matchMedia && !window.matchMedia('(min-width:1024px)').matches) detail.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });   // stacked layout: the panel sits below the flower
    });
    show(0);

    if (r === 'about') later(() => { const a = document.getElementById('about'); if (a) a.scrollIntoView({ behavior: 'smooth' }); }, 50);
  }


  /* ---------------- interactive framing: Human Essence + EDI = Humaneness ---------------- */
  function streamSVG() {
    const stops = ['#E0AC27', '#C97F1C', '#A8450F', '#850500'];
    const top = (x) => 330 + Math.sin(x / 150) * 22 - x * 0.03;
    let up = '', dn = '';
    for (let x = 0; x <= 1100; x += 20) { const t = 125 + Math.sin(x / 150) * 22 - x * 0.03 - (x / 1100) * 14; up += (x ? 'L' : 'M') + x + ' ' + (t).toFixed(1) + ' '; }
    for (let x = 1100; x >= 0; x -= 20) { const t = 125 + Math.sin(x / 150) * 22 - x * 0.03 + 34 + (x / 1100) * 36; dn += 'L' + x + ' ' + t.toFixed(1) + ' '; }
    let drops = '';
    for (let i = 0; i < 8; i++) { const x = 80 + i * 135; const y = 142 + Math.sin(x / 150) * 22 - x * 0.03 + (x / 1100) * 11; drops += `<circle cx="${x}" cy="${y.toFixed(1)}" r="${(4 + i * 1.1).toFixed(1)}" fill="#FFFDE9" opacity=".9"/>`; }
    return `<div class="stream-labels" aria-hidden="true"><span>Self-Care</span><span>Socio-Care</span><span>Universal Care</span></div><svg viewBox="0 64 1100 130" role="img" aria-label="A stream widening into a river and then an ocean: care growing from Self-Care to Socio-Care to Universal Care">
      <defs><linearGradient id="stg" x1="0" x2="1">${stops.map((s, i) => `<stop offset="${i * 33.3}%" stop-color="${s}"/>`).join('')}</linearGradient></defs>
      <path d="${up}${dn}Z" fill="url(#stg)"/>${drops}</svg>`;
  }

  function equation() {
    const chip = (i) => `<span class="eqchip"><span class="eqi">${icon(V[i].key, 20)}</span><span>${V[i].name}</span></span>`;
    return `<figure class="eqn rv" id="eqn">
      <div class="eqrow">
        <div class="eqc" data-g="he" role="group" aria-label="Human Essence">
          <span class="eqt">Human Essence</span>
          <div class="eqchips">${[0, 1, 2, 3, 4].map(chip).join('')}</div>
        </div>
        <span class="eqop" aria-hidden="true">+</span>
        <div class="eqc" data-g="edi" role="group" aria-label="Equity, Diversity and Inclusivity">
          <span class="eqt">EDI</span>
          <div class="eqchips">${[5, 6, 7].map(chip).join('')}</div>
        </div>
        <span class="eqop" aria-hidden="true">=</span>
        <div class="eqc eqh" data-g="all" role="group" aria-label="Humaneness">
          <span class="eqt">Humaneness</span>
          <img src="img/huq-mark.webp" class="eqf" width="130" height="130" loading="lazy" decoding="async" alt="" aria-hidden="true">
          <p class="eqs">Leading to the ideal of <b>One World One Family</b></p>
        </div>
      </div>
      <figcaption>How the eight values are framed: the five values of the Human Essence, together with Equity, Diversity and Inclusivity (EDI), lead to Humaneness.</figcaption>
    </figure>`;
  }
  /* ---------------- TEST ---------------- */
  function test() {
    if (state.phase === 'intro') return testIntro();
    if (state.phase === 'step') return testStep();
    if (state.phase === 'saving') return testSaving();
  }

  function testIntro() {
    const sel = (id, label, list, val) => `<div class="field"><label for="${id}">${label} <span class="req" aria-hidden="true">*</span></label>
      <select id="${id}" required><option value="">Select…</option>${list.map((o) => `<option ${o === val ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`;
    const txt = (id, label, val, ac) => `<div class="field"><label for="${id}">${label} <span class="req" aria-hidden="true">*</span></label><input id="${id}" type="text" autocomplete="${ac}" maxlength="80" required value="${esc(val || '')}"></div>`;
    const done = complete() && state.result;
    $app.innerHTML = `<div class="test"><div class="t-narrow">
      ${done ? `<div class="card" style="margin-bottom:22px;display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap"><span><b>You have already completed the test in this session.</b></span><span style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn primary" href="#/profile">View my profile</a><button class="btn ghost" id="retake">Retake</button></span></div>` : ''}
      <div class="intro-card">
        <span class="eyebrow">Before you begin</span>
        <h1>Test your Humane Quotient</h1>
        <p class="lead" style="font-size:1.1rem">Eight steps, twelve statements each. Think of a <b>typical week</b> in your life and answer as you truly are — not as you wish to be. There are no right or wrong answers. It takes about 12 minutes.</p>
        <div class="privacy"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#A8450F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>
          <div><b>Your privacy.</b> Your responses are stored <b>confidentially</b> and used only for data interpretation and research on the Humane Quotient. Taking part is entirely voluntary for Self Analysis.</div></div>
        <p style="margin-bottom:6px"><b>About you</b> — all fields are required to create your profile and email you the report:</p>
        <div class="fields f2">
          <div class="field"><label for="f-name">Full name <span class="req" aria-hidden="true">*</span></label><input id="f-name" type="text" autocomplete="name" maxlength="80" required value="${esc(state.demo.name || '')}"></div>
          <div class="field"><label for="f-email">Email id <span class="req" aria-hidden="true">*</span></label><input id="f-email" type="email" autocomplete="email" maxlength="254" required value="${esc(state.demo.email || '')}"></div>
        </div>
        <div class="fields f2">${sel('f-age', 'Age group', ['Below 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65+'], state.demo.age)}${sel('f-gender', 'Gender', ['Female', 'Male', 'Non-binary / Other', 'Prefer not to say'], state.demo.gender)}</div>
        <div class="fields f2">${sel('f-role', 'Role', H.profile.roles, state.demo.role)}${txt('f-org', 'Organization', state.demo.organization, 'organization')}</div>
        <div class="fields f2" id="g-other" hidden>${txt('f-roleother', 'Please specify your role', state.demo.roleOther, 'off')}</div>
        <div class="fields f2">${sel('f-qual', 'Qualification', H.profile.qualifications, state.demo.qualification)}<div id="g-qother">${txt('f-qualother', 'Please specify your qualification', state.demo.qualificationOther, 'off')}</div></div>
        <div class="fields f2" id="g-acad" hidden>
          <div class="field"><label for="f-course" id="l-course">Course / Programme <span class="req" aria-hidden="true">*</span></label><input id="f-course" type="text" autocomplete="off" maxlength="80" value="${esc(state.demo.course || '')}"></div>
          <div class="field"><label for="f-stage" id="l-stage">Year of study <span class="req" aria-hidden="true">*</span></label><select id="f-stage"></select></div>
        </div>
        <p class="fine" id="formerr" role="alert" hidden></p>
        <p class="fine">Your name and email are used only to prepare your profile and send you your report. They are not saved with your confidential responses.</p>
        <div class="note" style="margin-bottom:26px">HuQ is designed for honest <b>self-evaluation and personal growth</b>. HuQ is not for judging, comparing or labelling individuals.</div>
        <button class="btn primary" id="start">I understand — begin the test →</button>
      </div></div></div>`;
    function syncRole() {
      const r = val('f-role'), ac = H.profile.academic[r];
      document.getElementById('g-other').hidden = r !== H.profile.other;
      document.getElementById('g-qother').hidden = val('f-qual') !== H.profile.other;
      document.getElementById('g-acad').hidden = !ac;
      if (ac) {
        document.getElementById('l-course').firstChild.nodeValue = ac.course + ' ';
        document.getElementById('l-stage').firstChild.nodeValue = ac.stageLabel + ' ';
        const st = document.getElementById('f-stage'), keep = state.demo.stage;
        st.innerHTML = '<option value="">Select…</option>' + ac.stages.map((o) => `<option ${o === keep ? 'selected' : ''}>${o}</option>`).join('');
      }
    }
    document.getElementById('f-qual').onchange = syncRole;
    document.getElementById('f-role').onchange = () => { state.demo.stage = ''; syncRole(); };
    syncRole();
    const rt = document.getElementById('retake');
    if (rt) rt.onclick = () => { resetAll(); testIntro(); setNav('test'); window.scrollTo(0, 0); };
    document.getElementById('start').onclick = () => {
      const r = val('f-role'), ac = H.profile.academic[r], isOther = r === H.profile.other;
      const d = { name: val('f-name').trim(), email: val('f-email').trim(), age: val('f-age'), gender: val('f-gender'), role: r,
        roleOther: isOther ? val('f-roleother').trim() : '', organization: val('f-org').trim(), qualification: val('f-qual'), qualificationOther: val('f-qual') === H.profile.other ? val('f-qualother').trim() : '',
        course: ac ? val('f-course').trim() : '', stage: ac ? val('f-stage') : '' };
      const err = document.getElementById('formerr');
      const bad = !d.name ? 'f-name' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email) ? 'f-email' : !d.age ? 'f-age' : !d.gender ? 'f-gender' : !d.role ? 'f-role' : (isOther && !d.roleOther) ? 'f-roleother' : !d.organization ? 'f-org' : !d.qualification ? 'f-qual' : (d.qualification === H.profile.other && !d.qualificationOther) ? 'f-qualother' : (ac && !d.course) ? 'f-course' : (ac && !d.stage) ? 'f-stage' : '';
      if (bad) {
        err.hidden = false; err.textContent = bad === 'f-email' ? 'Please enter a valid email id.' : 'Please complete every field to continue.';
        document.getElementById(bad).focus(); return;
      }
      err.hidden = true;
      state.demo = d;
      store.set('huq.demo', state.demo);
      state.phase = 'step';
      state.step = firstIncompleteStep();
      testStep(); window.scrollTo({ top: 0, behavior: 'instant' });
    };
    function val(id) { return document.getElementById(id).value; }
  }
  function firstIncompleteStep() {
    for (let s = 0; s < 8; s++) for (let q = 0; q < 12; q++) if (!state.answers[s * 12 + q]) return s;
    return 0;
  }
  function resetAll() {
    state.answers = Array(H.totalQuestions).fill(0); state.result = null; state.sent = false; state.mailed = false; state.subId = ''; state.phase = 'intro'; state.step = 0;
    store.del('huq.answers'); store.del('huq.sent'); store.del('huq.mailed');
  }

  function testStep() {
    const s = state.step, v = V[s];
    const answeredTotal = state.answers.filter(Boolean).length;
    const stepper = V.map((x, i) => {
      const dn = state.answers.slice(i * 12, i * 12 + 12).every(Boolean);
      return `<div class="sd ${i === s ? 'cur' : dn ? 'done' : ''}" role="img" aria-label="${dn && i !== s ? 'completed' : i === s ? 'current step' : 'upcoming step'}"><i>${icon(x.key, 18)}</i></div>`;
    }).join('');
    const qs = H.questions.slice(s * 12, s * 12 + 12).map((q, k) => `
      <div class="q ${state.answers[q.index] ? 'ans' : ''}" data-q="${q.index}" style="--k:${k}">
        <span class="qn" aria-hidden="true">${icon(v.key, 18)}</span>
        <p class="qt" id="qt${q.index}">${q.text}</p>
        <div class="scale" role="radiogroup" aria-labelledby="qt${q.index}">
          ${H.options.map((o) => `<label class="opt o${o.marks}"><input type="radio" name="q${q.index}" value="${o.marks}" ${state.answers[q.index] === o.marks ? 'checked' : ''}><span class="dot"></span><span class="lbl">${o.label}</span></label>`).join('')}
        </div></div>`).join('');
    $app.innerHTML = `
      <div class="stepper"><div class="row">${stepper}</div><div class="bar" role="progressbar" aria-label="Test progress" aria-valuemin="0" aria-valuemax="96" aria-valuenow="${answeredTotal}"><i style="--p:${(answeredTotal / 96).toFixed(4)}"></i></div></div>
      <div class="test" style="padding-top:0"><div class="t-narrow">
        <div class="step-head"><div class="ico">${icon(v.key, 36)}</div>
          <span class="eyebrow" style="margin-bottom:.4rem">${v.facet}</span>
          <h1>${v.name}</h1><p>${v.definition} Think of a typical week.</p></div>
        ${qs}
        <div class="nav-row">
          <button class="btn ghost" id="back">← ${s === 0 ? 'Back to start' : 'Previous step'}</button>
          <span class="counter" id="counter"></span>
          <button class="btn primary" id="next"></button>
        </div></div></div>`;
    const next = document.getElementById('next'), counter = document.getElementById('counter');
    let scrollTimer = 0;
    function refresh() {
      const n = state.answers.slice(s * 12, s * 12 + 12).filter(Boolean).length;
      counter.innerHTML = Array.from({ length: 12 }, (_, i) => `<i class="${i < n ? 'on' : i === n ? 'next' : ''}"></i>`).join(''); counter.setAttribute('role', 'img'); counter.setAttribute('aria-label', n + ' of 12 questions answered in this step');
      next.disabled = n < 12;
      next.textContent = s === 7 ? 'See my HuQ profile →' : 'Next step →';
      const done = state.answers.filter(Boolean).length, bar = document.querySelector('.bar');
      bar.firstElementChild.style.setProperty('--p', (done / 96).toFixed(4)); bar.setAttribute('aria-valuenow', done);
    }
    refresh();
    $app.querySelectorAll('.q input').forEach((inp) => inp.addEventListener('change', (e) => {
      const card = e.target.closest('.q'), idx = +card.dataset.q;
      state.answers[idx] = +e.target.value;
      store.set('huq.answers', state.answers);
      card.classList.add('ans');
      refresh();
      clearTimeout(scrollTimer);                                   // debounce: only the last answer scrolls
      scrollTimer = later(() => {
        if (!document.body.contains(card)) return;                 // user already moved to another step
        const nextQ = Array.from($app.querySelectorAll('.q')).find((c) => !state.answers[+c.dataset.q]);
        const target = nextQ || document.querySelector('.nav-row');
        if (target && target.scrollIntoView) target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
        if (nextQ) { nextQ.classList.add('flash'); later(() => nextQ.classList.remove('flash'), 900); }
      }, 300);                                                     // let the selection register first
    }));
    document.getElementById('back').onclick = () => {
      if (s === 0) { state.phase = 'intro'; testIntro(); } else { state.step--; testStep(); }
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    next.onclick = () => {
      if (s < 7) { state.step++; testStep(); window.scrollTo({ top: 0, behavior: 'instant' }); }
      else finish();
    };
  }

  function testSaving() {
    $app.innerHTML = `<div class="saving state-loading" role="status">${logoMark()}<h2>Preparing your Humane Quotient Profile…</h2><p>Bringing your eight quotients together.</p><div class="waves" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<i style="animation-delay:${(i * 0.1).toFixed(1)}s"></i>`).join('')}</div></div>`;
  }
  function finish() {
    state.result = H.score(state.answers);
    state.phase = 'saving'; testSaving(); window.scrollTo({ top: 0, behavior: 'instant' });
    if (state.sent) { later(goProfile, 900); return; }
    save();
  }
  function goProfile() { location.hash = '#/profile'; setTimeout(() => { state.phase = 'intro'; }, 0); }
  function save() {
    const t0 = Date.now(), ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctl ? setTimeout(() => ctl.abort(), 15000) : 0;
    if (!state.subId) state.subId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
    fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl ? ctl.signal : undefined,
      body: JSON.stringify({ answers: state.answers, demographics: state.demo, name: state.demo.name, email: state.demo.email, submissionId: state.subId }) })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok || !j || !j.ok) throw new Error((j && j.error) || 'save failed');
        state.sent = true; store.set('huq.sent', true); state.mailed = !!j.emailed; store.set('huq.mailed', state.mailed);
        setTimeout(goProfile, Math.max(0, 1300 - (Date.now() - t0)));
      })
      .catch((e) => saveFailed(e && e.name === 'AbortError' ? 'The connection timed out.' : (e && e.message && !/fetch|network|load failed/i.test(e.message) ? e.message : 'We could not reach the server.')))
      .then(() => clearTimeout(timer));
  }
  function saveFailed(msg) {
    if (state.phase !== 'saving') return;
    $app.innerHTML = `<div class="saving">${logoMark(navigator.onLine === false ? 'offline' : 'error')}<h2>We couldn’t save your response</h2><p role="alert">${esc(msg)} Your answers are safe on this device.</p>
      <div class="cta-row" style="justify-content:center"><button class="btn primary" id="retrySave">Try again</button><button class="btn ghost" id="skipSave">View my profile without saving</button></div></div>`;
    document.getElementById('retrySave').onclick = () => { testSaving(); save(); };
    document.getElementById('skipSave').onclick = goProfile;
  }

  /* ---------------- PROFILE ---------------- */
  /* the closed flower shown before the reveal: the same flower, folded, with no data in it */
  function budSVG() {
    let o = '';
    for (let i = 0; i < 8; i++) o += `<g transform="rotate(${i * 45})"><path d="${petalPath(44, 215, 68)}" fill="#E4D5CB" fill-opacity=".7" stroke="#D5BDAF"/></g>`;
    for (let i = 0; i < 8; i++) o += `<g transform="rotate(${i * 45})"><path d="${petalPath(44, 170, 50)}" fill="${i % 2 ? '#A8450F' : '#850500'}" fill-opacity=".95" stroke="#FFFDE9" stroke-width="1"/></g>`;
    return `<svg class="bud" viewBox="-335 -335 670 670" aria-hidden="true" focusable="false"><circle class="bd-ring" r="262" fill="none" stroke="#E4D5CB" stroke-dasharray="2 8"/><circle class="bd-rip" r="62" fill="none" stroke="#A8450F" stroke-width="3"/><g class="bd-pet">${o}</g>
      <g class="bd-c"><circle r="47" fill="#FFFDE9" stroke="#850500" stroke-width="3"/><text y="9" text-anchor="middle" font-family="'Cormorant Garamond',serif" font-weight="600" font-size="30" fill="#850500">HuQ</text></g></svg>`;
  }

  function profile() {
    const res = state.result;
    const L = lvl(res.level);
    const strongest = res.strongest.map(byKey);
    const topS = strongest[0];
    const sorted = res.values.slice().sort((a, b) => b.score - a.score);
    const legend = H.levels.map((l) => `<span><i style="background:${l.color}"></i>${l.name}</span>`).join('');
    const cards = res.values.map((v, i) => {
      const def = V[i], isTop = res.strongest.indexOf(v.key) > -1, l = lvl(v.level);
      return `<article class="vcard rv ${isTop ? 'top' : ''}">
        ${isTop ? '<span class="badge">★ Strongest</span>' : ''}
        <header><div class="ic">${icon(v.key, 24)}</div><h3>${def.name}<small>${def.facet} · ${def.code}</small></h3>
          <div class="num"><b data-count="${f1(v.quotient)}">${f1(v.quotient)}</b><span>${v.score}/60</span></div></header>
        <span class="lv" style="background:${l.color};color:${l.ink}">${l.name}</span>
        ${spectrum(v.score, H.VALUE_MIN, H.VALUE_MAX, v.score, true)}
        <p class="as">${def.assess[v.level]}</p>
        <div class="mini">${v.aspects.map((a, k) => `<div><span>${def.aspects[k].name}</span><span class="t"><i data-w="${(a / 15 * 100).toFixed(0)}" style="--w:0"></i></span><em>${a}/15</em></div>`).join('')}</div></article>`;
    }).join('');
    const rows = res.values.map((v, i) => `<tr role="row"><td role="cell"><b>${V[i].name}</b> <span style="color:var(--bronze)">(${V[i].code})</span></td><td role="cell" data-label="Score">${v.score}/60</td><td role="cell" data-label="Quotient">${f1(v.quotient)}/10</td><td role="cell" data-label="Care level"><span class="chip" style="background:${lvl(v.level).color};color:${lvl(v.level).ink}">${lvl(v.level).name}</span></td></tr>`).join('');
    const chars = strongest.slice(0, 2).map((v) => `<div class="card"><h3>${v.name} · ${v.facet}</h3><ul>${v.traits.map((t) => `<li>${t}</li>`).join('')}</ul></div>`).join('');

    /* The page opens on a closed flower. Nothing of the result is put on the page until the person clicks it. */
    const heroExtra = `<div class="sc"><b data-count="${f1(res.huq)}">${f1(res.huq)}</b><span>/ 10</span></div><br>
      <span class="lvl">${L.name} is your priority</span>
      <p class="d">${H.huqAssessment[res.level]}</p>`;
    const detailsHTML = `
          <div class="strong"><span class="eyebrow">Your strongest quotient${strongest.length > 1 ? 's' : ''}</span>
            <h3>${strongest.map((v) => v.name).join(' &amp; ')}</h3>
            <div class="fc">${strongest.map((v) => v.facet).join(' · ')} — ${f1(res.max / 6)}/10</div>
            <p>${strongest.length > 1 ? 'You are equally strong in these values. ' : ''}${topS.leverage}</p></div>
          <h3 style="margin:26px 0 8px">Your quotients, ranked</h3>
          ${sorted.map((v) => `<div style="display:grid;grid-template-columns:130px 1fr 46px;gap:10px;align-items:center;margin:7px 0;font-size:.92rem"><span><b>${v.name}</b></span><span style="height:9px;background:var(--sand);border-radius:9px;overflow:hidden"><i style="display:block;height:100%;width:${((v.score - 12) / 48 * 100).toFixed(0)}%;background:${lvl(v.level).color};border-radius:9px"></i></span><span style="text-align:right;color:var(--bronze);font-weight:600">${f1(v.quotient)}</span></div>`).join('')}`;
    const restHTML = `
    <section style="padding-top:36px"><div class="wrap">
      <div class="big-card rv">
        <h2>Your journey from Self-Care to Universal Care</h2>
        <p style="color:#6b3a33;margin-bottom:0">Overall HuQ score ${res.total} out of 480. The marker shows where your care currently rests on the Evolution of Care.</p>
        ${spectrum(res.total, H.TOTAL_MIN, H.TOTAL_MAX, res.total, false)}
      </div>

      <div style="margin-top:56px" class="rv"><span class="eyebrow">Quotient by quotient</span><h2>Where you stand on each value</h2>
        <p style="max-width:62ch">Each quotient is scored out of 60 and shown out of 10. Scores of 12–28 reflect <b>Self-Care</b>, 29–44 <b>Socio-Care</b> and 45–60 <b>Universal Care</b>.</p></div>
      <div class="vgrid">${cards}</div>

      <div class="big-card rv" style="margin-top:36px"><h2>Assessment summary</h2>
        <table class="sumtable" role="table"><thead role="rowgroup"><tr role="row"><th role="columnheader">Core humane value</th><th role="columnheader">Score</th><th role="columnheader">Quotient</th><th role="columnheader">Care level</th></tr></thead><tbody role="rowgroup">${rows}
        <tr role="row"><td role="cell"><b>Humane Quotient (HuQ)</b></td><td role="cell" data-label="Score"><b>${res.total}/480</b></td><td role="cell" data-label="Quotient"><b>${f1(res.huq)}/10</b></td><td role="cell" data-label="Care level"><span class="chip" style="background:${L.color};color:${L.ink}">${L.name}</span></td></tr></tbody></table></div>

      <div style="margin-top:56px" class="rv"><span class="eyebrow">Characteristics of humaneness</span><h2>What your strength looks like</h2></div>
      <div class="chars rv">${chars}</div>

      <div class="cta-row"><a class="btn primary" href="#/plan">See my action plan →</a><button class="btn ghost" id="print">Print / save as PDF</button><a class="btn ghost" href="#/test" id="again">Retake the test</a></div>
      <p class="savednote">${state.sent ? 'Your response was recorded confidentially. Thank you for contributing to HuQ research.' + (state.mailed ? ' Your report has been emailed to ' + esc(state.demo.email) + '.' : ' We could not email your report right now; you can print or save this page instead.') : 'Your profile is shown here; your response could not be recorded right now.'}</p>
    </div></section>`;

    $app.innerHTML = `
    <section class="prof-hero"><picture class="hero-bg" aria-hidden="true"><source media="(min-width:768px)" srcset="img/hero-red-desktop.webp" width="1920" height="1300"><img src="img/hero-red-mobile.webp" width="1000" height="1300" alt="" decoding="async"></picture><div class="wrap">
      <span class="eyebrow">Your Humane Quotient Profile</span>
      <h1>${state.demo && state.demo.name ? esc(state.demo.name) + '’s HuQ' : 'Your HuQ'}</h1>
      <div class="hx hx-wait"><div><p class="d">Your results are ready. Open the flower below to see them.</p></div></div>
      <div class="hx hx-res"><div id="heroRes"></div></div>
    </div></section>

    <div class="wrap pull"><div class="big-card fl-card locked" id="flCard" tabindex="-1"><div class="fl-res">
      <div class="fl-flower" id="flFlower">
        <div class="fl-stack" id="flStack">${budSVG()}</div>
        <span class="reveal-cta" aria-hidden="true"><span class="cta-click">Click</span><span class="cta-tap">Tap</span> to reveal your profile</span>
        <button class="reveal-hit" id="revealBtn" type="button" aria-label="Click to reveal your profile"></button>
      </div>
      <div class="fl-details" id="flDetails"></div>
    </div></div></div>
    <div id="rest"></div>
    <p class="sr-only" id="revealLive" role="status" aria-live="polite"></p>`;

    const q = (sel) => $app.querySelector(sel);
    function reveal() {
      const card = q('#flCard'), flowerEl = q('#flFlower'), stack = q('#flStack'), cta = q('.reveal-cta'), bud = q('svg.bud');
      const hero = q('.prof-hero'), heroRes = q('#heroRes'), details = q('#flDetails'), rest = q('#rest');
      q('#revealBtn').remove();
      details.innerHTML = detailsHTML;
      flowerEl.insertAdjacentHTML('beforeend', `<div class="legend">${legend}<span>★ strongest</span></div>`);
      stack.insertAdjacentHTML('beforeend', flowerResult(res));
      const real = stack.querySelector('svg.bloom'), legendEl = flowerEl.querySelector('.legend');
      const showHero = () => { heroRes.innerHTML = heroExtra; hero.classList.add('is-open'); };
      const showRest = () => {
        rest.innerHTML = restHTML;
        document.getElementById('print').onclick = () => window.print();
        document.getElementById('again').onclick = () => resetAll();
        animateMarkers(rest); countUp(rest); observeReveal(rest, true);
      };
      const bindReplay = () => {
        real.style.cursor = 'pointer';
        real.addEventListener('click', () => { real.classList.remove('go'); void real.getBoundingClientRect(); real.classList.add('go'); });
      };
      q('#revealLive').textContent = 'Your profile is revealed.';
      card.focus({ preventScroll: true });
      if (reduced() || !card.animate) {                                         // no motion: everything appears at once
        card.classList.remove('locked'); bud.remove(); cta.remove(); real.classList.add('go', 'done');
        showHero(); showRest(); bindReplay(); return;
      }
      /* 1. note where the flower is, 2. switch to the final two-column layout, 3. hold the flower there and glide it home later (FLIP) */
      const c0 = stack.getBoundingClientRect(), hPre = card.offsetHeight;
      details.classList.add('fx-pre'); legendEl.classList.add('fx-pre');
      card.classList.remove('locked');
      const c1 = stack.getBoundingClientRect(), hFinal = card.offsetHeight;
      const inv = `translate(${(c0.left + c0.width / 2) - (c1.left + c1.width / 2)}px,${(c0.top + c0.height / 2) - (c1.top + c1.height / 2)}px) scale(${c0.width / c1.width})`;
      stack.animate([{ transform: inv }, { transform: inv, offset: .56 }, { transform: 'none' }], { duration: 2500, easing: 'cubic-bezier(.22,1,.36,1)' });
      const grow = card.animate([{ height: hPre + 'px' }, { height: hFinal + 'px' }], { duration: 1000, delay: 900, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
      grow.onfinish = () => grow.cancel();
      const fade = cta.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: 'forwards' });
      fade.onfinish = () => cta.remove();
      bud.classList.add('open');                                                // 0.00 s  the bud opens
      later(() => real.classList.add('go'), 250);                               // 0.25    the real flower blooms in its place
      later(() => bud.remove(), 1500);
      later(() => { details.classList.remove('fx-pre'); legendEl.classList.remove('fx-pre'); }, 1400);   // 1.40    the flower glides left; the scores slide in
      later(showHero, 2300);                                                    // 2.30    the page opens upward: the overall score
      later(() => countUp(heroRes), 2700);
      later(() => { if (res.level >= 1) confetti(hero); }, 2900);
      later(bindReplay, 2600);
      later(showRest, 3000);                                                    // 3.00    the rest of the profile
    }
    q('#revealBtn').addEventListener('click', reveal, { once: true });
  }

  /* ---------------- ACTION PLAN ---------------- */
  function plan() {
    const res = state.result;
    const L = lvl(res.level);
    const top = byKey(res.strongest[0]);
    const topScore = res.values[idxOf(top.key)];
    const items = Object.keys(top.plan).map((k) => ({ v: byKey(k), s: res.values[idxOf(k)], text: top.plan[k] }))
      .sort((a, b) => a.s.score - b.s.score);
    const tips = items.map((it, n) => {
      const l = lvl(it.s.level);
      return `<div class="tip rv ${n < 2 ? 'focus' : ''}"><div class="ic">${icon(it.v.key, 26)}</div>
        <div><h4 role="heading" aria-level="3">${top.name} → ${it.v.name} <span style="color:var(--bronze);font-weight:500">· ${it.v.facet}</span></h4><p>${it.text}</p></div>
        <span class="st" style="background:${l.color};color:${l.ink}">${f1(it.s.quotient)}/10</span>${n < 2 ? '<span class="ff">Focus First</span>' : ''}</div>`;
    }).join('');
    const stage = [
      { i: 0, t: 'Self-Care', li: ['Notice one need around you each day and act on it.', 'Practise listening fully before replying.', 'Do small acts of help without expecting anything back.'] },
      { i: 1, t: 'Socio-Care', li: ['Extend the loyalty you give family and friends to new people and strangers.', 'Make decisions that consider your whole community.', 'Welcome differences of background, belief and opinion.'] },
      { i: 2, t: 'Universal Care', li: ['Put collective well-being first as a natural instinct.', 'Work to remove barriers and share power and influence.', 'Steward people, society, nature and future generations.'] }
    ].map((s) => `<div class="card ${s.i === res.level ? 'cur' : ''}">${s.i === res.level ? '<span class="you">You are here</span>' : ''}<h3>${s.t}</h3><ul>${s.li.map((x) => `<li>${x}</li>`).join('')}</ul></div>`).join('');

    $app.innerHTML = `
    <section class="plan-hero"><picture class="hero-bg" aria-hidden="true"><source media="(min-width:768px)" srcset="img/hero-red-desktop.webp" width="1920" height="1300"><img src="img/hero-red-mobile.webp" width="1000" height="1300" alt="" decoding="async"></picture><div class="wrap">
      <span class="eyebrow">Action plan</span>
      <h1>Grow your Humane Quotient</h1>
      <p>Use your strongest humane value as the foundation for growing the others. Your steps below are ordered so the values with the most room to grow come first.</p>
    </div></section>
    <div class="wrap pull"><div class="lev-card rv"><div class="ring">${f1(topScore.quotient)}</div>
      <div><span class="eyebrow" style="color:var(--maroon);opacity:.7;margin-bottom:.3rem">Your strongest value${res.strongest.length > 1 ? ` (tied with ${res.strongest.slice(1).map((k) => byKey(k).name).join(', ')} — plan built on ${top.name})` : ''}</span>
        <h2>${top.name} · ${top.facet}</h2><p><b>Leverage:</b> ${top.leverage}</p></div></div></div>
    <section style="padding-top:44px"><div class="wrap">
      <div class="rv"><span class="eyebrow">How to use your strongest value to build the others</span><h2>Seven steps from ${top.name}</h2></div>
      <div class="tips">${tips}</div>
      <div style="margin-top:64px" class="rv"><span class="eyebrow">Evolution of Care</span><h2>Moving up the journey</h2>
        <p style="max-width:64ch">Your overall HuQ places you at <b>${L.name}</b>. Growth is a movement from Self-Care to Socio-Care to Universal Care — the drops of water stay the same; their form evolves.</p></div>
      <div class="ladder rv">${stage}</div>
      <div class="note rv" style="margin-top:40px"><b>Keep growing.</b> Revisit the test after a few months to see how your care is evolving. HuQ is for personal growth and self-improvement — not for judgement, comparison or labelling.</div>
      <div class="cta-row"><a class="btn primary" href="#/profile">← Back to my profile</a><button class="btn ghost" id="print">Print / save as PDF</button></div>
    </div></section>`;
    document.getElementById('print').onclick = () => window.print();
  }

  /* ---------------- connection toast ---------------- */
  const $net = document.createElement('div');
  $net.className = 'net'; $net.setAttribute('role', 'status'); $net.setAttribute('aria-live', 'polite');
  $net.innerHTML = '<img src="img/huq-mark.webp" width="36" height="36" alt=""><p></p>';
  document.body.appendChild($net);
  let netTimer = 0;
  function netShow(online) {
    clearTimeout(netTimer);
    $net.classList.toggle('ok', online);
    $net.querySelector('p').innerHTML = online ? '<b>Back online</b>You are connected again.' : '<b>You are offline</b>Your answers stay on this device. Saving your results needs a connection.';
    $net.classList.add('show');
    if (online) netTimer = setTimeout(() => $net.classList.remove('show'), 3500);
  }
  window.addEventListener('offline', () => netShow(false));
  window.addEventListener('online', () => netShow(true));
  if (navigator.onLine === false) netShow(false);

  /* a blank page is never left behind: if something throws while nothing is on screen, show the error state */
  window.addEventListener('error', () => { if (!$app.firstElementChild) errorView(); });
  window.addEventListener('unhandledrejection', () => { if (!$app.firstElementChild) errorView(); });

  /* the flower splash from index.html fades out once the first page is on screen (never seen if that took < 300 ms) */
  function bootDone() {
    const b = document.getElementById('boot'); if (!b) return;
    const o = parseFloat(getComputedStyle(b).opacity) || 0;
    b.style.pointerEvents = 'none';
    if (o < 0.05 || reduced() || !b.animate) { b.remove(); return; }
    b.animate([{ opacity: o }, { opacity: 0 }], { duration: 350, easing: 'ease' }).onfinish = () => b.remove();
  }

  /* ---------------- boot ---------------- */
  window.addEventListener('hashchange', () => { if (state.phase === 'saving' && currentRoute() !== 'profile') state.phase = 'intro'; route(); });
  route();
  window.__huqReady = true; bootDone();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* offline cache is optional */ }));
  }
})();
