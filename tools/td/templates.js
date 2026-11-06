// 🏰 타워 디펜스 지도 배경 템플릿 (2026-11-06) — node tools/td/templates.js [출력 폴더]
//   지도 5종 × 1920×1080 · 원본 480×270 (×4) · 1칸 = 120px (원본 30px) · 좌표는 js/raid/td-maps.js 그대로
//   살구색 띠 = 몬스터 길 (폭 0.7칸 + 테두리) · 하늘색 점선 원 = 타워 자리(★ 금색 = 명당) · 보라 원 = 입구 · 빨간 네모 = 성
//   가운데 위 상자 = 게임 글자(HUD) 자리 · 그림 AI 에는 「칸 · 글자 · 표시는 그리지 말 것」 프롬프트와 함께 첨부 (docs/ASSET-SPEC.md 6-11)
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'assets', 'templates', 'td'));
const ctx = {}; ctx.window = ctx; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'raid', 'td-maps.js'), 'utf8'), ctx);
const M = ctx.window.DS.TDMaps;
const data = M.MAPS.map((m) => ({ id: m.id, name: m.name, paths: m.paths, starts: M.starts(m), end: M.end(m), slots: M.slots(m).map((p) => ({ x: p.x, y: p.y, star: p.star, no: p.no })) }));

function page(d, W, H) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#000}canvas{display:block}</style></head><body><canvas id="c" width="${W}" height="${H}"></canvas><script>(() => {
  const d = ${JSON.stringify(d)}, U = 120, W = ${W}, H = ${H}, g = document.getElementById('c').getContext('2d');
  const F = (s, w = 700) => \`\${w} \${s}px 'Noto Sans CJK KR','Noto Sans KR',sans-serif\`;
  g.fillStyle = '#2b2d36'; g.fillRect(0, 0, W, H);
  // 격자: 칸(120px) 실선 · 반 칸 점선
  for (let x = 0; x <= 16; x += 0.5) { g.strokeStyle = x % 1 ? '#ffffff10' : '#ffffff26'; g.lineWidth = 2; g.beginPath(); g.moveTo(x * U, 0); g.lineTo(x * U, H); g.stroke(); }
  for (let y = 0; y <= 9; y += 0.5) { g.strokeStyle = y % 1 ? '#ffffff10' : '#ffffff26'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y * U); g.lineTo(W, y * U); g.stroke(); }
  // 길
  g.lineJoin = 'round'; g.lineCap = 'round';
  d.paths.forEach((p) => { const run = () => { g.beginPath(); p.forEach(([x, y], i) => (i ? g.lineTo(x * U, y * U) : g.moveTo(x * U, y * U))); };
    run(); g.strokeStyle = '#b8935a'; g.lineWidth = U * 0.86; g.stroke(); run(); g.strokeStyle = '#ecd9ac'; g.lineWidth = U * 0.7; g.stroke(); });
  d.paths.forEach((p) => p.slice(1).forEach((b, i) => { const a = p[i], mx = (a[0] + b[0]) / 2 * U, my = (a[1] + b[1]) / 2 * U, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    g.save(); g.translate(mx, my); g.rotate(ang); g.fillStyle = '#8a6a3a'; g.beginPath(); g.moveTo(26, 0); g.lineTo(-14, -18); g.lineTo(-14, 18); g.fill(); g.restore(); }));
  // 자리
  g.textAlign = 'center'; g.textBaseline = 'middle';
  d.slots.forEach((p) => { g.setLineDash([12, 9]); g.lineWidth = p.star ? 6 : 4; g.strokeStyle = p.star ? '#ffd25a' : '#59d4ff'; g.fillStyle = p.star ? '#ffd25a22' : '#59d4ff18';
    g.beginPath(); g.arc(p.x * U, p.y * U, U * 0.4, 0, 7); g.fill(); g.stroke(); g.setLineDash([]); g.fillStyle = p.star ? '#ffd25a' : '#9fe6ff'; g.font = F(28, 900); g.fillText(p.star ? '★' + p.no : p.no, p.x * U, p.y * U + 1); });
  // 입구
  d.starts.forEach(([x, y]) => { const cx = Math.max(0.55, Math.min(15.45, x)) * U, cy = Math.max(0.55, Math.min(8.45, y)) * U;
    g.lineWidth = 7; g.strokeStyle = '#c070ff'; g.fillStyle = '#7a20c055'; g.beginPath(); g.arc(cx, cy, U * 0.5, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#e8c8ff'; g.font = F(26, 900); g.fillText('입구', cx, cy); });
  // 성 (가로 1.3칸 × 세로 1.15칸 · 길 끝이 성문 · 게임 그림 🏰 자리)
  { const [ex, ey] = d.end, w = 1.3 * U, h = 1.15 * U, x0 = Math.max(0, Math.min(W - w, ex * U - w / 2)), y0 = Math.max(0, Math.min(H - h, ey * U - 0.7 * U));
    g.lineWidth = 7; g.strokeStyle = '#ff4d5e'; g.fillStyle = '#ff4d5e33'; g.fillRect(x0, y0, w, h); g.strokeRect(x0, y0, w, h);
    g.font = F(36, 900); g.lineWidth = 6; g.strokeStyle = '#000'; g.strokeText('성', x0 + w / 2, y0 + h / 2); g.fillStyle = '#ffb3ba'; g.fillText('성', x0 + w / 2, y0 + h / 2); }
  // 글자 상자 (게임 HUD · 가운데 위 가로 4~12칸 × 세로 0~0.75칸) = 덮이는 곳 → 중요한 것 두지 않기
  { const x0 = 4 * U, w = 8 * U, h = 0.75 * U; g.fillStyle = '#000000c8'; g.fillRect(x0, 0, w, h); g.setLineDash([10, 8]); g.lineWidth = 3; g.strokeStyle = '#ffffff88'; g.strokeRect(x0, 1, w, h); g.setLineDash([]);
    g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = F(30, 900); g.fillText(d.name + '  ·  1920×1080 (원본 480×270 × 4)  ·  1칸 = 120px', W / 2, h * 0.36);
    g.fillStyle = '#ddd'; g.font = F(19, 700); g.fillText('이 상자 = 게임 글자 자리  ·  살구색 = 길  ·  점선 원 = 타워 자리(맨바닥)  ·  보라 = 입구  ·  빨강 = 성', W / 2, h * 0.76); }
  })();</script></body></html>`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  for (const d of data) {
    pg.removeAllListeners('pageerror'); pg.on('pageerror', (e) => console.error('✖', d.id, e.message));
    await pg.setContent(page(d, 1920, 1080)); await pg.waitForTimeout(150);
    const f = path.join(OUT, `tpl-td-${d.id}.png`); await pg.locator('#c').screenshot({ path: f }); console.log('✔', path.relative(ROOT, f));
  }
  await b.close();
})();
