/* YOR WALLET service worker: offline app shell only.
   It NEVER caches Supabase/API traffic, so balances and transactions always come from the server. */
const CACHE = 'yor-shell-v11.1.0';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'assets/icons/icon.svg', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   /* Supabase + CDN: untouched */
  e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
    .catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
});
