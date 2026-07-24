/* WARCHESS 2 — Service Worker (PWA Cache) */
const CACHE = 'warchess2-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  '/css/main.css',
  '/css/animations.css',
  '/js/i18n.js',
  '/js/chess_engine.js',
  '/js/training.js',
  '/js/ai.js',
  '/js/multiplayer.js',
  '/js/main.js',
  '/assets/images/splash.jpg',
  '/assets/images/bg_hero.jpg',
  '/assets/images/board_bg.jpg',
  '/assets/images/pieces_white.png',
  '/assets/images/pieces_black.png',
  '/assets/images/icon_192.png',
  '/assets/images/icon_512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('SW: Некоторые активы не загружены:', err);
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
        // Если сеть недоступна, вернуть главную страницу
        return caches.match('/');
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
