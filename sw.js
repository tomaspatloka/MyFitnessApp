// sw.js
const CACHE_NAME = 'trenink-tracker-v9';
const APP_VERSION = '1.8.0';
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
  console.log('[SW] Installing version:', APP_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  // Immediately activate
  self.skipWaiting();
});

// Aktivace: promažeme staré cache
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', APP_VERSION);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (k !== CACHE_NAME) {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        }
        return null;
      }))
    )
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Message handler pro skip waiting
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // NEVER cache sw.js itself - always fetch from network for version checks
  if (url.pathname === '/sw.js' || url.pathname.endsWith('/sw.js')) {
    event.respondWith(fetch(req));
    return;
  }

  // API calls - network only (no cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(req));
    return;
  }

  // Requests with cache-busting params - fetch from network
  if (url.searchParams.has('_refresh') || url.searchParams.has('nocache')) {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets - cache first, then network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // Cache GET requests with ok responses
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
