// 🎮 체험판 만들기 (2026-11-03): 게임(index.html)을 학생 폰 화면 하나짜리 「한 파일 HTML」로 묶는다 — 인터넷 · 서버 · 로그인 없음
//   더블클릭하면 브라우저에서 바로 열리고, 가상 친구들과 한 차시를 처음부터 끝까지 해 본다 (기록 없음, 새로고침 = 처음부터)
//   차시 파일(lessons 형식 DS.Lessons.register) + 개념 카드 그림(단계 id 이름의 .webp/.png) 을 받아
//   CSS · 스크립트 · 쓰는 그림만 파일 안에 넣는다. 그림은 처음 열 때 blob 주소로 바꿔 쓴다 (art.js · 배치표 그대로)
//
// 사용:
//   1) 쓰는 그림 기록: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤
//      node tools/demo/pack.js record <차시.js> <카드 폴더> <그림목록.json>
//   2) 묶기:          node tools/demo/pack.js build  <차시.js> <카드 폴더> <그림목록.json> <출력.html> [제목]
//   체험판 차시 내용(다른 과목 · 교과서 기반)은 저장소에 넣지 않는다 — 이 도구만 저장소에 둔다
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.woff2': 'font/woff2' };
const safe = (js) => js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

function lessonId(src) { const m = src.match(/register\(\{\s*id:\s*'([^']+)'/); if (!m) throw new Error('차시 파일에서 id 를 못 찾았어요'); return m[1]; }
function cards(dir) {
  const img = {};
  for (const f of fs.readdirSync(dir)) {
    const ext = path.extname(f).toLowerCase(); if (!['.webp', '.png', '.jpg'].includes(ext)) continue;
    const id = path.basename(f, ext); if (img[id] && ext !== '.webp') continue; // 같은 이름이면 webp 우선
    img[id] = `data:${MIME[ext]};base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}`;
  }
  return img;
}

// 그림 → blob 주소 (배치표 DS.ASSETS 의 파일 이름을 바꿔 끼움: base 는 비우고, 파일 안에 없는 그림은 원래 상대 주소 그대로)
const SHIM = `(function () {
  var el = document.getElementById('demo-assets'); if (!el) return;
  var E = JSON.parse(el.textContent), U = {};
  Object.keys(E).forEach(function (k) { var b = atob(E[k][1]), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); U[k] = URL.createObjectURL(new Blob([u], { type: E[k][0] })); });
  el.remove();
  var A = DS.ASSETS, base = A.base; A.base = '';
  var file = /\\.(webp|png|jpe?g|gif|woff2)$/i;
  function map(s) { if (typeof s !== 'string' || !file.test(s) || /^(blob:|data:|https?:)/.test(s)) return s; return U[base + s] || U[s] || (s.indexOf('assets/') === 0 ? s : base + s); }
  (function walk(o) { Object.keys(o).forEach(function (k) { var v = o[k];
    if (typeof v === 'string') o[k] = map(v);
    else if (typeof v === 'function') o[k] = function () { return map(v.apply(this, arguments)); };
    else if (v && typeof v === 'object') walk(v); }); })(A);
  A.base = '';
})();`;

// 체험판 화면: 큰 화면에서는 폰 크기로 가운데
const CSS = `@media (min-width: 560px) { html { background: #05080f; } body { max-width: 430px; margin: 0 auto; min-height: 100vh; box-shadow: 0 0 0 1px #2c4370, 0 0 60px #000; }
  .test-bar { max-width: 430px; margin: 0 auto; } .toast { max-width: 400px; } }
#screen-student .nav-back { visibility: hidden; } /* 체험판: 메뉴화면(로그인 · 교사 메뉴)으로 가지 않음 */`;

function html({ lesson, prep, assets, title, record }) {
  const idx = read('index.html');
  const body = idx.slice(idx.indexOf('<body'), idx.indexOf('<script src="js/config.js"'));
  const srcs = [...idx.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]).filter((s) => !/^lessons\/(set|eval)-/.test(s));
  const id = lessonId(lesson);
  const demo = { lesson: id, prep: { img: prep }, hero: 0, nick: '나', friends: 6 };
  const out = [`<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#0a1424">\n<title>${title}</title>`,
    record ? '<link rel="stylesheet" href="css/style.css">' : `<style>\n${read('css/style.css')}\n</style>`, `<style>${CSS}</style>\n</head>`, body];
  for (const s of srcs) {
    if (s === 'js/raid/app.js') { out.push(`<script>\n${safe(lesson)}\n</script>`, `<script>DS.DEMO = ${safe(JSON.stringify(demo))};</script>`); }
    out.push(record ? `<script src="${s}"></script>` : `<script>\n${safe(read(s))}\n</script>`);
    if (s === 'js/config.js') out.push('<script>DS.FIREBASE = null; // 체험판: 서버 없음</script>');
    if (s === 'assets/manifest.js' && !record) out.push(`<script type="application/json" id="demo-assets">${JSON.stringify(assets)}</script>`, `<script>\n${SHIM}\n</script>`);
  }
  out.push('</body>\n</html>\n');
  return out.join('\n');
}

async function record(lessonFile, cardDir, listOut) {
  const lesson = fs.readFileSync(lessonFile, 'utf8');
  const tmp = path.join(ROOT, '_demo-record.html');
  fs.writeFileSync(tmp, html({ lesson, prep: cards(cardDir), assets: {}, title: 'record', record: true }));
  const { chromium } = require('playwright');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const seen = new Set(), errs = [];
  p.on('request', (r) => { const u = new URL(r.url()); if (u.pathname.includes('/assets/')) seen.add(decodeURIComponent(u.pathname.replace(/^\//, ''))); });
  p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  try {
    await p.goto('http://localhost:8765/_demo-record.html'); await p.waitForTimeout(4000);
    for (let k = 0; k < 30; k++) {
      const close = p.locator('.modal:not([hidden]) button, #rs-close, .rs-close').first();
      if (await close.isVisible().catch(() => false)) { await close.click().catch(() => {}); await p.waitForTimeout(800); }
      const nx = p.locator('#tb-next'); if (!(await nx.isVisible().catch(() => false))) { if (await p.locator('#demo-again').isVisible().catch(() => false)) break; await p.waitForTimeout(1500); continue; }
      await nx.click().catch(() => {}); await p.waitForTimeout(3500);
    }
  } finally { await b.close(); fs.unlinkSync(tmp); }
  const list = [...seen].filter((f) => fs.existsSync(path.join(ROOT, f))).sort();
  fs.writeFileSync(listOut, JSON.stringify(list, null, 1));
  console.log(`그림 ${list.length}개 기록 → ${listOut}${errs.length ? `\n⚠ 오류: ${errs.slice(0, 5).join(' / ')}` : ''}`);
}

function build(lessonFile, cardDir, listFile, outFile, title) {
  const lesson = fs.readFileSync(lessonFile, 'utf8');
  const extra = ['assets/fonts/Galmuri11.woff2', 'assets/fonts/Galmuri11-Bold.woff2'];
  const list = [...new Set([...JSON.parse(fs.readFileSync(listFile, 'utf8')), ...extra])].filter((f) => MIME[path.extname(f).toLowerCase()]);
  const assets = {};
  for (const f of list) assets[f] = [MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', fs.readFileSync(path.join(ROOT, f)).toString('base64')];
  const t = title || `모두의 던전 체험판`;
  fs.writeFileSync(outFile, html({ lesson, prep: cards(cardDir), assets, title: t }));
  console.log(`✅ ${outFile} · ${(fs.statSync(outFile).size / 1048576).toFixed(2)} MB · 그림 ${list.length}개`);
}

module.exports = { html, cards, record, build };
if (require.main === module) {
  const [cmd, ...a] = process.argv.slice(2);
  if (cmd === 'record') record(a[0], a[1], a[2]).catch((e) => { console.error('❌', e.message); process.exit(1); });
  else if (cmd === 'build') build(a[0], a[1], a[2], a[3], a[4]);
  else console.log('사용: record <차시.js> <카드 폴더> <그림목록.json> · build <차시.js> <카드 폴더> <그림목록.json> <출력.html> [제목]');
}
