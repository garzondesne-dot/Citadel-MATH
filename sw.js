/* 📲 모두의 던전 베타 · 서비스 워커 (#38 · vite.config.ts 가 빌드 때 판 번호 · 파일 목록을 넣음 · 직접 고치지 말 것)
 *  ① 미리 저장 = 첫 화면 · 엔진(CORE) · 판마다 새 칸(dgb-core-판) · 옛 판 칸은 지움
 *  ② index.html · version.json · server.json = 늘 네트워크 먼저(안 되면 저장본) → 옛 판에 갇히지 않음
 *  ③ 그림 · 소리 · 배경음 · 글꼴 = 쓸 때 저장(dgb-media · 판이 바뀌어도 둠 · 그림을 바꾸면 파일 이름을 바꿈)
 *  ④ 다른 곳(Firebase · 구글) · GET 아닌 것 = 손대지 않음 */
const BUILD = 'b206';
const CORE = ["./","./index.html","./manifest.webmanifest","./icons/icon-192-v2.png","./icons/icon-512-v2.png","./icons/icon-maskable-512-v2.png","./icons/apple-touch-icon-v2.png","./art/brand-bg-v1.webp","./art/brand-school-logo-v1.webp","./assets/classic-5VUnfA4C.css","./assets/FxBake-DnxWekcF.css","./assets/index-DAKluiNe.css","./assets/packExport-wR6MYdkF.js","./assets/pixi-DEzo_97Y.js","./assets/pdfPages-BTLm3pfv.js","./assets/pdf-z6sF223D.js","./assets/pdf.worker.min-7WEkucD6.js","./assets/FxBake-C3ZGWxSh.js","./assets/browserAll-DGR2PVBE.js","./assets/server-CJ_TU8_U.js","./assets/slash-dyTH2lPu.js","./assets/index-DaMDrhck.js","./assets/lib-DQ3wN4Tf.js","./assets/index.esm-BvwL5Tfa.js","./assets/webworkerAll-KapbnjhM.js"];
const CORE_CACHE = `dgb-core-${BUILD}`, MEDIA = 'dgb-media-v1';
const scopeUrl = new URL(self.registration.scope);
const rel = (u) => { const p = new URL(u).pathname; return p.startsWith(scopeUrl.pathname) ? p.slice(scopeUrl.pathname.length) : p; };

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CORE_CACHE).then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
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
