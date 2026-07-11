// Minimal offline service worker for /herrang only (registered with
// scope '/herrang'; the main site is untouched). Camp Wi-Fi is a rumor, so:
// network-first for the page itself (fresh program when there IS signal,
// cached page when there isn't), cache-first for hashed /_next/static assets.

const CACHE = 'herrang-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add('/herrang')));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('herrang-') && k !== CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put('/herrang', copy));
          return res;
        })
        .catch(() => caches.match('/herrang'))
    );
    return;
  }

  // Hashed build assets + fonts are immutable: serve from cache, fill on miss.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
            return res;
          })
      )
    );
  }
});
