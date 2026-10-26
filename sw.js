// 版號由 games/survivor/version.json 管理；執行 tools/version.cjs --write 同步。
// /erin/ 底下的檔案一律先問網路並更新快取，確保 ?v= 新版會立即生效；
// 只有離線時才忽略查詢字串，退回已快取的同名檔案。
const CACHE_NAME = 'erin-games-20261026ae';
const ROOT = '/erin/';
const PRECACHE_URLS = [
  'games/survivor/engine/timing.js',
  'games/survivor/manual-attack.js',
  'games/survivor/practice-engine.js',
  'games/survivor/practice-host.js',
  'games/survivor/practice-rules.js',
  'games/survivor/practice.css',
  'games/survivor/practice.html',
  'games/survivor/engine/body-separation.js',
  'games/survivor/engine/effect-blocks.js',
  'games/survivor/render/weapons.js',
  'games/survivor/engine/weapons.js',
  'games/survivor/engine/pacing.js',
  'games/survivor/engine/neutral.js',
  'games/survivor/engine/school-combat.js',
  'games/survivor/engine/schools.js',
  'games/survivor/engine/encounters.js',
  'games/survivor/engine/music.js',
  'games/survivor/engine/audio.js',
  'games/survivor/engine/zzfx.js',
  'games/survivor/render/monsters.js',
  'games/survivor/input.js',
  'games/survivor/ui/settings.js',
  'games/survivor/ui/levelup.js',
  'games/survivor/render/hud.js',
  'games/survivor/render/world.js',
  'games/survivor/stages.js',
  'games/survivor/engine/boss.js',
  'games/survivor/engine/spawn.js',
  'games/survivor/engine/combat.js',
  'games/survivor/engine/loop.js',
  'games/survivor/engine/state.js',
  'games/survivor/manifest.js',
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
  'games/survivor/', 'games/survivor/style.css', 'games/survivor/game.js',
  'games/survivor/preview.html', 'games/survivor/preview.js', 'games/survivor/preview-engine.js',
  'games/survivor/icons.js', 'games/survivor/data/defaults.js', 'games/survivor/data/schema.js',
  'games/survivor/maker/', 'games/survivor/maker/index.html', 'games/survivor/maker/style.css', 'games/survivor/maker/maker.js'
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
