const CACHE_NAME = 'ace-fitness-v1';
const ASSETS = [
  '/',
  '/public/assets/css/styles.css',
  '/public/assets/js/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
