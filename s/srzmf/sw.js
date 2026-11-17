/* 📲 모두의 던전 베타 · 서비스 워커 (#38 · vite.config.ts 가 빌드 때 판 번호 · 파일 목록을 넣음 · 직접 고치지 말 것)
 *  ① 미리 저장 = 첫 화면 · 엔진(CORE) · 판마다 새 칸(dgb-core-판) · 옛 판 칸은 지움 · 이름이 같은 엔진 조각(지문 hash 같음)은 옛 칸에서 옮겨 담음 = 새 판 때 바뀐 조각만 받음
 *  ② index.html · version.json · server.json = 늘 네트워크 먼저(안 되면 저장본) → 옛 판에 갇히지 않음
 *  ③ 그림 · 소리 · 배경음 · 글꼴 = 쓸 때 저장(dgb-media · 판이 바뀌어도 둠 · 그림을 바꾸면 파일 이름을 바꿈)
 *  ④ 다른 곳(Firebase · 구글) · GET 아닌 것 = 손대지 않음 */
const BUILD = 'b219';
const CORE = ["./","./index.html","./manifest.webmanifest","./icons/icon-192-v2.png","./icons/icon-512-v2.png","./icons/icon-maskable-512-v2.png","./icons/apple-touch-icon-v2.png","./icons/badge-dungeon-v2-192.png","./icons/badge-dungeon-v2-96.png","./fonts/dungeon-icons-v2.woff","./art/brand-bg-v1.webp","./art/brand-school-logo-v1.webp","./assets/classic-YMtNsZsk.css","./assets/TrialApp-DhHH5Kk-.css","./assets/FxBake-DnxWekcF.css","./assets/AtkGallery-BYg7i0P1.css","./assets/Dummy-wMQ8q7Wv.css","./assets/Hall-BBpmmlS9.css","./assets/Castle-I853ko7e.css","./assets/Board-B07llSVv.css","./assets/FunPhone-D5KwE-tH.css","./assets/FunArena-DTckIF38.css","./assets/TSim-Desdzbz6.css","./assets/TV-CFAcUyTm.css","./assets/TeacherApp-Cp7bu4KW.css","./assets/index-MKPNrjTz.css","./assets/trial-DY3yYh7L.js","./assets/browser-DJSxuIRC.js","./assets/openLesson-CgybQJAj.js","./assets/pixi-vbFaO75b.js","./assets/_commonjsHelpers-CqkleIqs.js","./assets/packExport-Cb0mENlH.js","./assets/pdfPages-Cp2R4MMl.js","./assets/pdf-z6sF223D.js","./assets/pdf.worker.min-7WEkucD6.js","./assets/TrialApp-DfHcOBxV.js","./assets/FxBake-BQqA6APP.js","./assets/AtkGallery-8uHH7NW4.js","./assets/Dummy-Bqzkp6za.js","./assets/browserAll-Dko6NvY1.js","./assets/server-Cc0JftGG.js","./assets/Hall-BPsa7L2L.js","./assets/Castle-BStlF7Mr.js","./assets/Board-GvCoBiFb.js","./assets/FunPhone--zEw2Doo.js","./assets/slash-DFNvcvD4.js","./assets/FunArena-CfDmlmml.js","./assets/TSim-D9kdqXWG.js","./assets/TV-rsnVgNaE.js","./assets/TeacherApp-B_S7FdWm.js","./assets/index-9qP8SfwG.js","./assets/lib-63-Rnjzf.js","./assets/index.esm-BvwL5Tfa.js","./assets/webworkerAll-D-8eSNaG.js"];
const CORE_CACHE = `dgb-core-${BUILD}`, MEDIA = 'dgb-media-v1';
const scopeUrl = new URL(self.registration.scope);
const rel = (u) => { const p = new URL(u).pathname; return p.startsWith(scopeUrl.pathname) ? p.slice(scopeUrl.pathname.length) : p; };

self.addEventListener('install', (e) => {
  // 📦 (📜 2026-11-16 로딩 줄이기) assets/ 의 js · css 는 파일 이름에 내용 지문(hash)이 있음 → 옛 판 칸에 같은 이름이 있으면 그대로 옮겨 담고 바뀐 조각만 받음
  e.waitUntil(caches.open(CORE_CACHE).then((c) => Promise.all(CORE.map(async (u) => {
    if (/^\.\/assets\/.+\.(js|css)$/.test(u)) { const old = await caches.match(new URL(u, self.registration.scope).href); if (old) return c.put(u, old); }
    return c.add(new Request(u, { cache: 'reload' }));
  }))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => (k.startsWith('dgb-core-') && k !== CORE_CACHE) || k.startsWith('ds-') /* 🚀 출시: 옛 정식 앱 저장(ds-citadel-* · ds-assets)도 지움 */).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', (e) => { if (e.data === 'build?') e.source?.postMessage({ build: BUILD }); });

const netFirst = async (req, key) => {
  try {
    const r = await fetch(req.url, { cache: 'no-store', credentials: 'same-origin' }); // 길 찾기(navigate) 요청은 옵션을 붙여 다시 만들 수 없어 주소로
    if (r.ok) { const c = await caches.open(CORE_CACHE); await c.put(key, r.clone()); }
    return r;
  } catch (err) {
    const hit = (await caches.match(key, { ignoreSearch: true })) || (await caches.match('./index.html', { ignoreSearch: true }));
    if (hit) return hit;
    throw err;
  }
};
const cacheFirst = async (req, name) => {
  const hit = await caches.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const r = await fetch(req);
  if (r.ok && r.status === 200) { const c = await caches.open(name); c.put(req, r.clone()); }
  return r;
};
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return; // 소리 이어 받기(Range) = 브라우저에 맡김
  const u = new URL(req.url);
  if (u.origin !== self.location.origin || !u.pathname.startsWith(scopeUrl.pathname)) return;
  const p = rel(req.url);
  if (req.mode === 'navigate' || p === '' || p === 'index.html') { e.respondWith(netFirst(req, './index.html')); return; }
  if (p === 'version.json' || p === 'server.json' || p === 'sw.js') { e.respondWith(netFirst(req, `./${p}`)); return; }
  if (p.startsWith('assets/') && /\.(js|css)$/.test(p)) { e.respondWith(cacheFirst(req, CORE_CACHE)); return; }
  e.respondWith(cacheFirst(req, MEDIA));
});

// 🔔 교사 알림 누름 (📜 2026-11-16 · src/school/notify.svelte.ts) = 열린 교사 창이 있으면 그 창을 앞으로 + 그 주소로 · 없으면 새로 염
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || '?role=teacher&tab=news', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    const c = cs.find((x) => x.url.startsWith(self.registration.scope));
    if (c) return c.focus().then((w) => (w && w.navigate ? w.navigate(url) : w)).catch(() => self.clients.openWindow(url));
    return self.clients.openWindow(url);
  }));
});

// 🔔 밀어 온 알림 (📜 2026-11-16 · 앱을 닫아도 오는 교사 알림) = 중계가 보낸 { title, body, url, kind } 를 그대로 띄움
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: '모두의 던전', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || '모두의 던전', { body: d.body || '', tag: `citadel-${d.kind || 'push'}`, icon: './icons/icon-192-v2.png', badge: './icons/badge-dungeon-v2-96.png', data: { url: d.url || '?role=teacher&tab=news' } }));
});
