// 서비스 워커: 앱 설치(PWA) + 빠른 로딩
//  - 코드(html·js·css·json): 인터넷 먼저 → 끊기면 저장해 둔 것. 푸시하면 학생 화면에 바로 반영된다
//  - 그림·글꼴·아이콘(assets/, icons/): 저장해 둔 것 먼저 → 처음 한 번만 받는다 (그림을 바꾸면 파일 이름을 바꾼다: heroes-v3 …)
//  - v0.9.6 차시별 다운로드: STATIC = 공통 그림만. 던전 배경 · 포털 · 몬스터는 그 차시에 들어갈 때 받고(DS.Art.lessonEnter), 지금 · 바로 전 차시 것만 남긴다
//  - Firebase(다른 주소)는 건드리지 않는다. 수업 진행에는 인터넷이 필요하다
// 새 버전을 낼 때 CACHE 이름을 'ds-' + DS.VERSION 과 맞춘다 (tests/pwa.test.js 가 확인)
const CACHE = 'ds-citadel-0.9.8.2';
const ASSETS = 'ds-assets';
const CORE = [
  './', './index.html', './css/style.css', './manifest.webmanifest',
  './js/config.js', './assets/manifest.js',
  './js/engine/ui.js', './js/engine/video.js', './js/engine/audio.js', './js/engine/setgen.js', './js/engine/quiz.js', './js/engine/hint.js', './js/engine/lessons.js', './js/engine/sheet-lesson.js',
  './lessons/set-02.js', './lessons/set-03.js', './lessons/set-04.js', './lessons/set-05.js', './lessons/set-06.js', './lessons/eval-1.js', './lessons/curriculum.js', './js/engine/art.js', './js/engine/fx.js', './js/engine/qrcode.min.js', './js/engine/pwa.js',
  './js/raid/net.js', './js/raid/model.js', './js/raid/words.js', './js/raid/actions.js', './js/raid/account.js', './js/raid/control.js', './js/raid/fun-q.js', './js/raid/fun-ox.js', './js/raid/fun.js',
  './lessons/unit-set.js', './js/raid/cards.js', './js/raid/forge.js', './js/raid/grow.js', './js/raid/titles.js', './js/raid/result.js', './js/raid/note.js', './js/raid/survey.js', './js/raid/sharecard.js', './js/raid/bonus.js', './js/raid/campscene.js', './js/raid/camp.js', './js/raid/tcamp.js', './js/raid/student.js', './js/raid/bots.js', './js/raid/test.js', './js/raid/teacher.js', './js/raid/hall.js', './js/engine/xlsx-lite.js', './js/raid/prep.js', './js/raid/students.js', './js/raid/dash.js', './js/raid/sched.js', './js/raid/att.js', './js/raid/nav.js', './js/raid/app.js',
];
const STATIC = [
  './assets/art/heroes-v2.webp', './assets/art/hero-sword-v3c.webp', './assets/art/hero-blond-v2-2c.webp', './assets/art/hero-witch-v2c.webp', './assets/art/hero-elf-v2c.webp', './assets/art/hero-ninja-v2c.webp', './assets/art/hero-priest-v2c.webp', './assets/art/hero-lancer-v2c.webp', './assets/art/hero-dwarf-v2c.webp', './assets/art/hero-sage-v2c.webp', './assets/art/hero-paladin-v2c.webp', './assets/art/hero-monk-v2c.webp', './assets/art/hero-dancer-v2c.webp', './assets/art/hero-bard-v2c.webp', './assets/art/hero-alchemist-v2c.webp', './assets/art/hero-pirate-v2c.webp', './assets/art/hero-frost-v2c.webp', './assets/art/hero-tamer-v2c.webp', './assets/art/hero-math-v2c.webp', './assets/art/cards-v4.webp', './assets/art/frame-v2.webp', './assets/art/brand-bg-v1.webp', './assets/art/menu-icons-v1.webp', './assets/art/heroes-extra-v1.webp', './assets/art/card-frame-v1.webp', './assets/art/card-arts-v1.webp', './assets/art/forge-anvil-v1.webp', './assets/art/forge-hammer-v1.webp', './assets/art/camp-citadel-v2.webp', './assets/art/camp-castle-v1.webp', './assets/art/camp-tent-v1.webp', './assets/art/camp-tent-on-v1.webp', './assets/art/camp-gate-on-v1.webp', './assets/art/campfire-v2.webp', './assets/art/camp-trees-v1.webp', './assets/art/anvil-v1.webp', './assets/art/trophy-v1.webp', './assets/art/fun-arena-v1.webp', './assets/art/fun-dorm-v1.webp', './assets/art/monsters-mirror-v2.webp', './assets/art/monsters-mirrorboss-v2.webp', './assets/art/note-icons-v1.webp', './assets/art/medals-rank-v1.webp', './assets/art/medals-dungeon-v1.webp', './assets/art/forgec-anvil-v1.webp', './assets/art/forgec-hammer-v1.webp', './assets/art/forgec-material-v1.webp', './assets/art/forgec-operator-v1.webp', './assets/art/forgec-button-v1.webp', './assets/art/forgec-background-v1.webp', './assets/art/dportal-bonus-v1.webp', './assets/art/menu-bg-v1.webp', './assets/art/menu-logo-v1.webp', './assets/art/ui-emblem-v1.webp', './assets/art/ui-panel-v3.webp', './assets/art/ui-btn-v2.webp', './assets/art/ui-btn-press-v2.webp', './assets/art/ui-btn-off-v2.webp', './assets/art/ui-btn-gold-v2.webp', './assets/art/ui-btn-gold-press-v2.webp', './assets/art/ui-tab-v2.webp', './assets/art/ui-tab-on-v2.webp', './assets/art/ui-input-v2.webp', './assets/art/ui-icbtn-v2.webp', './assets/art/ui-icons-v2.webp', './assets/art/menu-prop-banner-v1.webp', './assets/art/menu-prop-chest-v1.webp', './assets/art/menu-prop-crystal-v1.webp', './assets/art/menu-prop-lantern-v1.webp', './assets/art/menu-prop-books-v1.webp', './assets/art/menu-prop-shield-v1.webp', './assets/fonts/Galmuri11.woff2', './assets/fonts/Galmuri11-Bold.woff2',
  './icons/icon-192-m2.png', './icons/icon-512-m2.png', './icons/icon-maskable-512-m2.png', './icons/apple-touch-icon-m2.png',
];
const isStatic = (url) => /\/(assets\/(img|art|fonts)|icons)\//.test(url.pathname);

self.addEventListener('install', (e) => {
  e.waitUntil(Promise.all([
    caches.open(CACHE).then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' })))), // 브라우저 HTTP 캐시(깃허브 10분)를 건너뛰고 새 판 그대로
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
  if (url.pathname.endsWith('.mp4')) return; // 영상(assets/video): 브라우저가 직접 받음 (부분 요청 · 저장 안 함)
  if (isStatic(url)) {
    e.respondWith(caches.open(ASSETS).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) c.put(req, res.clone());
      return res;
    }))));
    return;
  }
  // v0.9.8.1 속도: 앱 파일(html · js · css)은 이 판 캐시에서 바로 (예전: 열 때마다 깃허브에서 50여 개를 다시 받음 → 학교 망에서 느림)
  //   새 판은 sw.js 가 바뀌면(배포) 설치 때 통째로 새로 받음 → 섞이지 않음 · 캐시에 없는 것만 네트워크
  e.respondWith(caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: req.mode === 'navigate' }).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok && url.pathname.match(/\.(js|css|html|webmanifest)$|\/$/)) c.put(req, res.clone());
    return res;
  }).catch(() => c.match('./index.html')))));
});
