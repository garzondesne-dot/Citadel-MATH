// 3차시 v5: 수업 처음부터 끝까지 넘기며 학생 폰 · 종합상황실이 단계마다 오류 없이 그려지는지 (개념 4 · 문제 4 포함)
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e28.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1200);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(400); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.click('#s-go'); await S.waitForTimeout(1000);
  await S.evaluate(async () => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); });
  const { code, hallKey } = await T.evaluate(() => DS.Act.createRoom('set-03', '1-3'));
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1200); await S.click('#camp-gate'); await S.waitForTimeout(2500);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${hallKey}`); await H.waitForTimeout(1500);
  const go = () => T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.go(c, R, DS.Lessons.get(R.meta.lesson), 1); }, code);
  const seen = [];
  for (let k = 0; k < 12; k++) {
    await go(); await T.waitForTimeout(700);
    const st = await T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const L = DS.Lessons.get(R.meta.lesson), s = DS.Raid.stepOf(L, R); return s ? `${s.id}` : (DS.Raid.isEnd(L, R) ? 'END' : '?'); }, code);
    await S.bringToFront(); await S.waitForTimeout(700);
    const phone = await S.evaluate(() => { const b = document.querySelector('#st-body'); return b ? (b.querySelector('.items') ? `문항${b.querySelectorAll('.item').length}` : b.querySelector('.boss-items') ? `보스${b.querySelectorAll('.bitem').length}` : '화면') : '-'; });
    if (st === 'm4') { await S.screenshot({ path: `${OUT}/phone-m4.png` }); await H.bringToFront(); await H.waitForTimeout(800); await H.screenshot({ path: `${OUT}/hall-m4.png` }); }
    if (st === 'c4') { await H.bringToFront(); await H.waitForTimeout(800); await H.screenshot({ path: `${OUT}/hall-c4.png` }); }
    seen.push(`${st}:${phone}`);
    if (st === 'END') break;
  }
  console.log(seen.join(' → '));
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
