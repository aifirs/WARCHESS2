/* WARCHESS 2 — Service Worker (PWA Cache)
   Updated: use relative asset paths for better compatibility with static hosts/buckets
*/
const CACHE = 'warchess2-v2';
const ASSETS = [
  'index.html',
  'manifest.json',
  'sw.js',
  'css/main.css',
  'css/animations.css',
  'js/i18n.js',
  'js/chess_engine.js',
  'js/training.js',
  'js/ai.js',
  'js/multiplayer.js',
  'js/main.js',
  'assets/images/splash.jpg',
  'assets/images/bg_hero.jpg',
  'assets/images/board_bg.jpg',
  'assets/images/pieces_white.png',
  'assets/images/pieces_black.png',
  'assets/images/icon_192.png',
  'assets/images/icon_512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('SW: Some assets failed to cache:', err);
        // Continue even if some assets fail
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => {
      return r || fetch(e.request).catch(() => {
        // If network unavailable, return cached index.html as fallback
        return caches.match('index.html');
      });
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
