// 버전 꼬리표: 시작 화면 · 첫 화면 · 교사 · 학생 캠프 · 학생 폰 수업 · 종합상황실 · 테스트 모드(아래 막대 위)에서 모두 보이는지
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e29.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], rows = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const chk = async (p, name) => {
    await p.bringToFront(); await p.waitForTimeout(500);
    const r = await p.evaluate(() => { const e = document.getElementById('ver-tag'); if (!e) return null; const b = e.getBoundingClientRect(), s = getComputedStyle(e);
      const top = document.elementFromPoint(b.left + 2, b.top + b.height / 2); return { text: e.textContent, x: Math.round(b.left), y: Math.round(b.top), vis: s.display !== 'none' && +s.opacity > 0.3 && b.width > 0 && b.bottom <= innerHeight, z: s.zIndex }; });
    rows.push(`${name}: ${r ? `${r.text} (${r.x},${r.y}) ${r.vis ? '보임' : '안 보임'}` : '없음'}`);
    await p.screenshot({ path: `${OUT}/${name}.png` });
  };
  const S0 = await mk('S0'); await S0.goto(U); await S0.waitForTimeout(1500); await chk(S0, '1-splash');
  if (await S0.isVisible('#splash')) { await S0.click('#splash'); await S0.waitForTimeout(400); } await chk(S0, '2-home');
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await chk(T, '3-teacher-menu');
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1200);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(400); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.click('#s-go'); await S.waitForTimeout(1000);
  await S.evaluate(async () => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); });
  await chk(S, '4-student-camp');
  const { code, hallKey } = await T.evaluate(() => DS.Act.createRoom('set-03', '1-3'));
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1200); await S.click('#camp-gate'); await S.waitForTimeout(2500);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${hallKey}`); await H.waitForTimeout(1500);
  const go = () => T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.go(c, R, DS.Lessons.get(R.meta.lesson), 1); }, code);
  await go(); await go(); await go(); await T.waitForTimeout(800);
  await chk(S, '5-phone-m1'); await chk(H, '6-hall-m1'); await chk(T, '7-teacher-remote');
  const X = await mk('X'); await X.goto(U + '&role=teacher&test=set-03'); await X.waitForTimeout(2500); await chk(X, '8-test-mode');
  console.log(rows.join('\n')); console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
