// 수업 중에도 열림 (0.9.6.13 사용자 결정 · 2026-11-04 시험 고침): 차시 던전이 열려 있어도 허수아비 · 모루 · 성채(중단원던전)가 열리고, 허수아비 목록에 수업 중인 차시도 있음 → 수업 끝나도 그대로
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e23.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500);
  if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.click('#s-go'); await S.waitForTimeout(1500);
  await S.evaluate(async () => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); }); await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(800); // 튜토리얼은 이미 본 학생
  // 2차시 수업 열기 (첫 수업과 같은 상황)
  await T.selectOption('#lesson', 'set-02'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(2500);
  await S.bringToFront(); await S.waitForTimeout(1500);
  const off = async () => S.evaluate(() => ['camp-castle', 'camp-dummy', 'camp-anvil'].map((id) => (document.getElementById(id) || {}).className || 'none').join(' | '));
  const scr = () => S.evaluate(() => document.querySelector('.screen.active') && document.querySelector('.screen.active').id);
  const back = async () => { if ((await scr()) !== 'screen-camp') { await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(900); } };
  const list = () => S.$$eval('.bn-card .bn-h b', (bs) => bs.map((x) => x.textContent).join(' / ')).catch(() => 'none');
  console.log('수업 중 캠프:', await off());
  await S.click('#camp-dummy'); await S.waitForTimeout(1800);
  const s1 = await scr(), l1 = await list(); console.log('수업 중 허수아비 → 화면:', s1, '· 목록:', l1);
  await S.screenshot({ path: `${OUT}/1-class-dummy.png` }); await back();
  await S.click('#camp-anvil'); await S.waitForTimeout(1500);
  const f1 = await S.evaluate(() => document.body.classList.contains('forge-open')); console.log('수업 중 모루 → 모루 창 열림:', f1);
  await S.evaluate(() => { const f = document.getElementById('forge'); if (f) f.hidden = true; document.body.classList.remove('forge-open'); }); await back();
  // 수업 끝
  await T.evaluate(async () => { const code = DS.Teacher.code(); await DS.Act.endClass(code, '1-3').catch(async () => { await DS.Net.set('live/1-3/open', false); }); });
  await T.evaluate(async () => { await DS.Net.set('live/1-3/open', false); });
  await S.bringToFront(); await S.waitForTimeout(1500); await back();
  console.log('수업 끝 캠프:', await off());
  await S.click('#camp-dummy'); await S.waitForTimeout(1800);
  const s2 = await scr(), l2 = await list(); console.log('수업 끝 허수아비 → 화면:', s2, '· 목록:', l2);
  await S.screenshot({ path: `${OUT}/2-after-class.png` });
  const ok = s1 === 'screen-bonus' && /2차시/.test(l1) && f1 && s2 === 'screen-bonus';
  console.log(ok ? '✅ 수업 중에도 허수아비 · 모루 열림 (수업 중인 2차시도 목록에)' : '❌ 기대와 다름');
  console.log('errors:', errs.length ? errs : 'none');
  await b.close(); if (!ok || errs.length) process.exit(1);
})();
