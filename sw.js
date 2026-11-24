// CMind service worker. Bump CACHE_NAME on every deploy that changes cached files.
const CACHE_NAME = 'cmind-v3';
const PRECACHE = ['/', '/css/main.css', '/js/main.js', '/assets/logo.png', '/manifest.json'];

self.addEventListener('install', (event) => {
  // allSettled: one missing file must never abort the whole install
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(PRECACHE.map((u) => cache.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch third-party (Formspree, Google Fonts)

  // Pages: network first so deploys show up immediately; cache is the offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(request, copy)); }
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match('/')))
    );
    return;
  }

  // Static assets: serve cached copy, refresh it in the background
  event.respondWith(
    caches.match(request).then((cached) => {
      const refresh = fetch(request)
        .then((res) => {
          if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(request, copy)); }
          return res;
        })
        .catch(() => cached);
      return cached || refresh;
    })
  );
});
