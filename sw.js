const CACHE_NAME = 'sweethouse-v1';

// Yeh files pehli baar cache hongi
const CACHE_FILES = [
  '/',
  '/index.html'
];

// Install: files cache karo
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});

// Activate: purana cache delete karo
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: pehle network try karo, fail ho to cache se do
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Network se aaya — cache bhi update karo
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Network fail — cache se do
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // HTML request thi to index.html do
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
