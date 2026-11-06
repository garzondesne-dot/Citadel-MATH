// 🖥 종합실 설정 · 시연 창 = 가운데 본 화면에 맞춤 · ⚙ 던전 안 설정 (학생 · 종합실) · 집중모드면 학생 잠금 (2026-11-06) — node tools/e2e/e2e65.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.setViewportSize({ width: 1280, height: 900 });
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(800);
  const { code, hallKey: key } = await T.evaluate(() => DS.Act.createRoom('set-05', '1-3'));
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(3000);
  const box = (sel) => H.evaluate((sel) => { const m = document.querySelector(sel); if (!m) return 'none'; const r = m.getBoundingClientRect(); return `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)}`; }, sel);
  const ctr = () => H.evaluate(() => { const r = DS.UI.centerRect(); return r ? `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)}` : 'none'; });
  await H.click('#tc-set', { force: true }); await H.waitForTimeout(700); log.push(`교사 캠프 설정: 창 ${await box('.set-box')} · 가운데 ${await ctr()}`); await H.screenshot({ path: `${OUT}/sf-1-tcamp-set.png` });
  await H.evaluate(() => document.getElementById('set-x').click()); await H.waitForTimeout(300);
  // 학생 입장 · 수업 시작
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000); await S.click('#camp-gate'); await S.waitForTimeout(2500);
  await T.evaluate(async (c) => { for (let k = 0; k < 4; k++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.go(c, R, DS.Lessons.get(R.meta.lesson), 1); } }, code); await T.waitForTimeout(2500);
  // 종합실 던전 안 ⚙ · 시연
  await H.bringToFront(); log.push('종합실 화면: ' + (await H.evaluate(() => document.querySelector('.screen.active').id)) + ' · ⚙ 단추 ' + !!(await H.$('#h-set')));
  await H.click('#h-set'); await H.waitForTimeout(700); log.push(`던전 안 설정: 창 ${await box('.set-box')} · 가운데 ${await ctr()}`); await H.screenshot({ path: `${OUT}/sf-2-hall-set.png` });
  await H.click('.set-grid .hpick[data-h="3"]'); await H.evaluate(() => (document.getElementById('set-ok') || document.querySelector('.set-box .btn.primary')).click()); await H.waitForTimeout(1500);
  log.push('선생님 모습 바뀜(tlook): ' + (await T.evaluate(async (c) => JSON.stringify(await DS.Net.get(`rooms/${c}/state/tlook`)), code)).slice(0, 40));
  await H.click('#h-demo'); await H.waitForTimeout(600); log.push(`시연 창: ${await box('#h-demo-ov .demo-box')} · 가운데 ${await ctr()}`); await H.screenshot({ path: `${OUT}/sf-3-demo.png` }); await H.click('#demo-x');
  // 학생 ⚙ (전투 중) → 저장 → 방 반영
  await S.bringToFront(); log.push('학생 ⚙: ' + !!(await S.$('#st-set')) + ' · 잠김 ' + (await S.$eval('#st-set', (e) => e.disabled).catch(() => 'none')));
  await S.click('#st-set'); await S.waitForTimeout(900); await S.screenshot({ path: `${OUT}/sf-4-student-set.png` });
  await S.click('.set-grid .hpick[data-h="5"]').catch(() => {}); await S.evaluate(() => (document.getElementById('set-ok') || document.querySelector('.set-box .btn.primary')).click()); await S.waitForTimeout(1500);
  log.push('학생 저장 뒤 방 hero: ' + (await T.evaluate(async (c) => { const p = await DS.Net.get(`rooms/${c}/players`); return Object.values(p).filter((x) => !x.teacher).map((x) => x.hero).join(','); }, code)) + ' · 화면 ' + (await S.evaluate(() => document.querySelector('.screen.active').id)));
  // 집중모드 → 잠김
  await T.evaluate(async (c) => { await DS.Net.update(`rooms/${c}/state`, { focus: true, focusAt: Date.now() }); }, code); await S.waitForTimeout(1500);
  log.push('집중모드 학생 ⚙ 잠김: ' + (await S.$eval('#st-set', (e) => e.disabled).catch(() => 'none')));
  console.log(log.join('\n')); console.log('errors', errs.length ? errs : 'none'); await b.close();
})();
