const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const T = await ctx.newPage(); T.on('dialog', (d) => d.accept());
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연\n3 박도윤'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.screenshot({ path: `${OUT}/students.png` });
  const S = await ctx.newPage(); await S.goto(U + '&role=student'); await S.waitForTimeout(1500);
  if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '2'); await S.waitForTimeout(400);
  await S.screenshot({ path: `${OUT}/login.png` });
  await S.click('#s-new'); await S.waitForTimeout(300); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234');
  await S.screenshot({ path: `${OUT}/signup.png` });
  await b.close(); })();
