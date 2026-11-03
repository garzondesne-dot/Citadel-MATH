// v2 직업 용사 16명 · 금발 검사(16) → 0번 검사 옮기기 · 🧙 선생님 모습(현자 · 수학자) — node tools/e2e/e2e30.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  log.push('선생님 모습 버튼: ' + (await T.locator('#t-skin .hpick').count()));
  await T.locator('#t-skin .hpick[data-h="17"]').click(); await T.waitForTimeout(600);
  log.push('저장된 모습: ' + (await T.evaluate(() => localStorage.getItem('citadel-thero'))));
  await T.locator('#t-skin').scrollIntoViewIfNeeded(); await T.screenshot({ path: `${OUT}/t-skin.png` });
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-1'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1000);
  // 금발 검사(16)를 고른 학생 → 로그인하면 0번으로
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(400); }
  await S.selectOption('#s-cls', '1-1'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(async () => { await DS.Net.set('accounts/1-1/1/hero', 16); });
  await S.reload(); await S.waitForTimeout(2000); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(400); }
  log.push('16 → ' + (await S.evaluate(async () => DS.Net.get('accounts/1-1/1/hero'))));
  await S.click('#s-go').catch(() => {}); await S.waitForTimeout(1200);
  await S.evaluate(async () => { localStorage.setItem('citadel-tut-1-1-1', JSON.stringify({ a: true, b: true })); await DS.Net.update('xp/1-1/1/tut', { a: true, b: true }); });
  const set = S.locator('.camp-set'); if (await set.count()) { await set.first().click(); await S.waitForTimeout(800); await S.screenshot({ path: `${OUT}/s-settings.png` }); log.push('용사 고르기 칸: ' + (await S.locator('.set-grid .hpick').count()) + ' · v2 그림: ' + (await S.locator('.set-grid .hpick .hv2').count())); }
  // 수업 방 → 선생님 용사 17
  const { code, hallKey } = await T.evaluate(() => DS.Act.createRoom('set-03', '1-1'));
  log.push('방 선생님 용사: ' + (await T.evaluate(async (c) => (await DS.Net.get(`rooms/${c}/players/${DS.Net.uid()}/hero`)), code)));
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${hallKey}`); await H.waitForTimeout(2500);
  log.push('종합상황실 수학자 그림: ' + (await H.evaluate(() => document.body.innerHTML.includes('hero-math-v2'))));
  await H.screenshot({ path: `${OUT}/h-lobby.png` });
  console.log(log.join('\n')); console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
