const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', process.env.E2E_ID || 'e2e-teacher'); await T.fill('#f-teacher .t-pw', process.env.E2E_PW || '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  // 테스트 모드 → 학생 캠프 (용사 겹 · 보강던전 반짝이 · 설정)
  await T.selectOption('#x-lesson', 'set-05'); await T.click('#x-go'); await T.waitForTimeout(2500);
  console.log('camp hero z:', await T.evaluate(() => getComputedStyle(document.querySelector('#screen-camp .camp-hero')).zIndex), 'anvil z:', await T.evaluate(() => getComputedStyle(document.querySelector('#screen-camp .camp-anvil')).zIndex),
    'bonus sparkle:', await T.evaluate(() => getComputedStyle(document.querySelector('.camp-bonus'), '::before').animationName));
  await T.click('#camp-anvil'); await T.waitForTimeout(350); await T.screenshot({ path: `${OUT}/1-hero-to-anvil.png` });
  await T.waitForTimeout(1500); const fx = await T.$('#fg-x'); if (fx) await fx.click(); await T.waitForTimeout(600);
  await T.screenshot({ path: `${OUT}/2-camp.png` });
  await T.click('#camp-set'); await T.waitForTimeout(1200); await T.screenshot({ path: `${OUT}/3-settings.png` });
  console.log('settings head buttons:', await T.evaluate(() => [...document.querySelectorAll('.set-head .btn')].map((x) => x.textContent).join(',')));
  await T.click('.modal .ui-x'); await T.waitForTimeout(400);
  // 교사 캠프 (차원문 애니메이션 이름)
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  await T.selectOption('#lesson', 'set-05'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(1500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  console.log('tcamp portal anim:', await H.evaluate(() => { const p = document.querySelector('#screen-tcamp .camp-portal'); return p ? getComputedStyle(p).animationName : 'none'; }));
  await H.screenshot({ path: `${OUT}/4-hall-tcamp.png` });
  await H.click('#tc-menu'); await H.waitForTimeout(1500); await H.screenshot({ path: `${OUT}/5-hall-lobby.png` });
  console.log('teacher speech font:', await H.evaluate(() => { const s = document.querySelector('.lb2-say.teacher'); return s ? getComputedStyle(s).fontSize : 'none'; }));
  console.log('ERRORS', errs.length, errs.slice(0, 5)); await b.close();
})();
