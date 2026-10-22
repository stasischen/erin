// 換新版網站時增加版本號，啟用後會清除舊快取。
// /erin/ 底下的檔案一律先問網路並更新快取，確保 ?v= 新版會立即生效；
// 只有離線時才忽略查詢字串，退回已快取的同名檔案。
const CACHE_NAME = 'erin-games-v4';
const ROOT = '/erin/';
const PRECACHE_URLS = [
  '',
  'style.css',
  'manifest.webmanifest',
  'register-sw.js',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'games/ice-cream-stacker/',
  'games/ice-cream-stacker/style.css',
  'games/ice-cream-stacker/game.js',
  'games/ice-cream-stacker/assets/audio/click1.ogg',
  'games/ice-cream-stacker/assets/audio/switch33.ogg',
  'games/ice-cream-stacker/assets/audio/switch7.ogg',
  'games/ice-cream-stacker/assets/kenney/ui/Kenney Future.ttf',
  'games/ice-cream-stacker/assets/kenney/ui/arrow_basic_e.svg',
  'games/ice-cream-stacker/assets/kenney/ui/arrow_basic_w.svg',
  'games/ice-cream-stacker/assets/kenney/ui/icon_play_light.svg',
  'games/ice-cream-stacker/assets/kenney/ui/icon_repeat_light.svg',
  'games/ice-cream-stacker/assets/kenney/ui/star.svg',
  'games/ice-cream-stacker/assets/kenney/ui/star_outline.svg',
  'games/rhythm-memory/', 'games/rhythm-memory/style.css', 'games/rhythm-memory/game.js',
  'games/clown-catch/', 'games/clown-catch/style.css', 'games/clown-catch/game.js',
  'games/racing/', 'games/racing/style.css', 'games/racing/game.js',
  'games/garden/', 'games/garden/style.css', 'games/garden/game.js',
  'games/mario-like/', 'games/mario-like/style.css', 'games/mario-like/game.js',
  'games/piano/', 'games/piano/style.css', 'games/piano/game.js',
  'games/pet-care/', 'games/pet-care/style.css', 'games/pet-care/game.js',
  'games/survivor/', 'games/survivor/style.css', 'games/survivor/game.js'
].map((path) => ROOT + path);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith('erin-games-') && name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(ROOT)) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone());
      return response;
    } catch (_) {
      return (await caches.match(request, { ignoreSearch: true })) || (await caches.match(ROOT));
    }
  })());
});
