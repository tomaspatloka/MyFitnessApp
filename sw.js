// sw.js
const CACHE_NAME = 'trenink-tracker-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-128.png',
  '/icons/icon-512.png',
  '/css/style.css',
  '/css/notifications.css',
  '/css/exercises.css',
  '/js/data.js',
  '/js/app.js',
  '/js/notifications.js',
  '/js/exercises.js'
];

// Instalace: uložíme základní soubory
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Aktivace: promažeme staré cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first pro statické věci, fallback na index
self.addEventListener('fetch', (event) => {
  const req = event.request;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // Uložíme do cache jen GET a jen ok odpovědi
          if (req.method === 'GET' && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});
