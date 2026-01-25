// sw.js
const CACHE_NAME = 'trenink-tracker-v8';
const APP_VERSION = '1.7.0';
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
  '/js/profiles.js',
  '/js/app.js',
  '/js/sync.js',
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

// Message handler pro skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: cache-first pro statické věci, network-first pro API
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // API calls - network first (no cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(req));
    return;
  }

  // Static assets - cache first
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
