// 수업 중 잠금: 차시 던전이 열려 있으면 캠프의 보강던전 · 허수아비 = 회색 · 못 들어감, 허수아비 목록에 수업 중인 차시 없음 → 수업 끝나면 열림
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
  // 2차시 수업 열기 (첫 수업과 같은 상황)
  await T.selectOption('#lesson', 'set-02'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(2500);
  await S.bringToFront(); await S.waitForTimeout(1500);
  const off = async () => S.evaluate(() => ['camp-bonus', 'camp-dummy'].map((id) => (document.getElementById(id) || {}).className || 'none').join(' | '));
  console.log('수업 중 캠프:', await off());
  await S.click('#camp-dummy'); await S.waitForTimeout(500);
  console.log('허수아비 누름 → 안내:', (await S.textContent('#toast').catch(() => '')).trim().slice(0, 50), '· 화면:', await S.evaluate(() => document.querySelector('.screen.active') && document.querySelector('.screen.active').id));
  await S.screenshot({ path: `${OUT}/1-class-locked.png` });
  // 다른 길로 들어가 보기 (예전 화면이 남아 있는 경우)
  const sneak = await S.evaluate(async () => { const m = JSON.parse(localStorage.getItem('citadel-me') || 'null'); return !!m; });
  await S.evaluate(() => DS.Bonus.enter(DS.Camp._me || window.__me || { c: '1-3', n: 1, name: '김민준', hero: 0 }, { train: true })); await S.waitForTimeout(800);
  console.log('직접 들어가기 시도 → 화면:', await S.evaluate(() => document.querySelector('.screen.active').id), '(sneak me', sneak, ')');
  // 수업 끝
  await T.evaluate(async () => { const code = DS.Teacher.code(); await DS.Act.endClass(code, '1-3').catch(async () => { await DS.Net.set('live/1-3/open', false); }); });
  await T.evaluate(async () => { await DS.Net.set('live/1-3/open', false); });
  await S.bringToFront(); await S.waitForTimeout(1500);
  if (!(await S.$('#camp-dummy'))) { await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(800); }
  console.log('수업 끝 캠프:', await off());
  await S.click('#camp-dummy'); await S.waitForTimeout(1600);
  console.log('허수아비 목록:', await S.$$eval('.bn-card .bn-h b', (bs) => bs.map((x) => x.textContent).join(' / ')).catch(() => 'none'));
  await S.screenshot({ path: `${OUT}/2-after-class.png` });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
