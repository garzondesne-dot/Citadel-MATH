// 서비스 워커: 앱 설치(PWA) + 빠른 로딩
//  - 코드(html·js·css·json): 인터넷 먼저 → 끊기면 저장해 둔 것. 푸시하면 학생 화면에 바로 반영된다
//  - 그림·글꼴·아이콘(assets/, icons/): 저장해 둔 것 먼저 → 처음 한 번만 받는다 (그림을 바꾸면 파일 이름을 바꾼다: heroes-v3 …)
//  - Firebase(다른 주소)는 건드리지 않는다. 수업 진행에는 인터넷이 필요하다
// 새 버전을 낼 때 CACHE 이름을 'ds-' + DS.VERSION 과 맞춘다 (tests/pwa.test.js 가 확인)
const CACHE = 'ds-citadel-0.6.2';
const ASSETS = 'ds-assets';
const CORE = [
  './', './index.html', './css/style.css', './manifest.webmanifest',
  './js/config.js', './assets/manifest.js',
  './js/engine/ui.js', './js/engine/audio.js', './js/engine/setgen.js', './js/engine/quiz.js', './js/engine/lessons.js',
  './lessons/set-02.js', './lessons/set-03.js', './js/engine/art.js', './js/engine/fx.js', './js/engine/qrcode.min.js', './js/engine/pwa.js',
  './js/raid/net.js', './js/raid/model.js', './js/raid/words.js', './js/raid/actions.js', './js/raid/account.js', './js/raid/control.js',
  './lessons/unit-set.js', './js/raid/cards.js', './js/raid/forge.js', './js/raid/camp.js', './js/raid/student.js', './js/raid/bots.js', './js/raid/test.js', './js/raid/teacher.js', './js/raid/hall.js', './js/raid/prep.js', './js/raid/nav.js', './js/raid/app.js',
];
const STATIC = [
  './assets/art/heroes-v2.webp', './assets/art/monsters-v2.webp', './assets/art/cards-v4.webp', './assets/art/frame-v2.webp', './assets/art/dungeon.webp', './assets/art/monsters-new-v1.webp', './assets/art/dg-02-deep-forest-v1.webp', './assets/art/dg-05-ruins-v1.webp', './assets/art/brand-m2-title-v2.webp', './assets/art/brand-m2-header-v2.webp', './assets/art/brand-bg-v1.webp', './assets/art/menu-icons-v1.webp', './assets/art/heroes-extra-v1.webp', './assets/art/card-frame-v1.webp', './assets/art/card-arts-v1.webp', './assets/art/forge-anvil-v1.webp', './assets/art/forge-hammer-v1.webp', './assets/art/camp-forest-v1.webp', './assets/art/campfire-v1.webp', './assets/art/portal-02-deep-forest-v1.webp', './assets/art/portal-05-ruins-v1.webp', './assets/art/camp-trees-v1.webp', './assets/art/anvil-v1.webp',
  './assets/fonts/Galmuri11.woff2', './assets/fonts/Galmuri11-Bold.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
];
const isStatic = (url) => /\/(assets\/(img|art|fonts)|icons)\//.test(url.pathname);

self.addEventListener('install', (e) => {
  e.waitUntil(Promise.all([
    caches.open(CACHE).then((c) => c.addAll(CORE)),
    caches.open(ASSETS).then((c) => c.addAll(STATIC)),
  ]).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ds-') && k !== CACHE && k !== ASSETS).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (isStatic(url)) {
    e.respondWith(caches.open(ASSETS).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) c.put(req, res.clone());
      return res;
    }))));
    return;
  }
  e.respondWith(fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html'))));
});
