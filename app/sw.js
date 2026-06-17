// sw.js — offline shell cache for BestEats PWA.
const CACHE = 'besteats-v2';
const SHELL = [
  './', 'index.html',
  'recipe-data.jsx', 'recipe-ui.jsx', 'storage.jsx', 'cloud.jsx', 'auth-ui.jsx', 'recipe-screens.jsx', 'recipe-detail.jsx', 'app.jsx',
  'manifest.webmanifest', 'bestEats-mark.svg', 'icon-192.png', 'icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Same-origin app files: network-first (so updates ship), cache as offline fallback.
// Cross-origin libs (React/Babel CDN): cache-first (immutable, versioned URLs).
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (sameOrigin) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => { try { c.put(req, copy); } catch (_) {} });
        return res;
      }).catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
    );
  } else {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => { try { c.put(req, copy); } catch (_) {} });
        return res;
      }))
    );
  }
});
