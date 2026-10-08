/* Offline cache for static assets. Responses are never cached: /api is always network-only. */
const CACHE = 'huq-static-v5';
const CORE = ['./', 'css/styles.css', 'js/huq-data.js', 'js/app.js', 'img/huq-flower.webp', 'img/huq-flower-520.webp', 'img/huq-flower-760.webp', 'img/huq-mark.webp', 'img/hero-red-mobile.webp', 'img/hero-red-desktop.webp',
  'fonts/jost-latin-wght-normal.woff2', 'fonts/cormorant-garamond-latin-600-normal.woff2', 'fonts/cormorant-garamond-latin-500-normal.woff2', 'fonts/cormorant-garamond-latin-500-italic.woff2'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n !== CACHE).map((n) => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/') || url.pathname === '/admin') return;
  const heavy = /\.(woff2|webp|png|jpg)$/.test(url.pathname);
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (heavy && hit) return hit;                                   // fonts and images: cache first
    const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; });
    if (hit) { net.catch(() => {}); return hit; }                   // css / js / page: show cached copy, refresh in background
    return net.catch(() => (req.mode === 'navigate' ? cache.match('./') : Response.error()));
  }));
});
