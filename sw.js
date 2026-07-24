/* WARCHESS 2 — Service Worker (PWA Cache) */
const CACHE = 'warchess2-v1';
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
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(err => {
      console.error('SW install failed:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/')))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});
