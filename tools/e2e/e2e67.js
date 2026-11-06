// 💬 의견 보내기 (2026-11-06): 학생 캠프 · 던전 💬 → 종류 + 글 → 교사 메뉴 「💬 학생 의견」 (새 의견 수 · 종류 걸러 보기 · 지우기) — node tools/e2e/e2e67.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(800);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  log.push('캠프 단추: ' + !!(await S.$('#camp-fb'))); await S.click('#camp-fb'); await S.waitForTimeout(500);
  await S.click('.fb-kinds [data-k="bug"]'); await S.fill('#fb-t', '허수아비에서 문제 풀고 X 누르면 문제가 남아 있어요'); await S.screenshot({ path: `${OUT}/67-1-send.png` });
  await S.click('#fb-send'); await S.waitForTimeout(800);
  // 던전 안 💬
  const { code } = await T.evaluate(() => DS.Act.createRoom('set-05', '1-3'));
  await S.evaluate(async (c) => { await DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }); }, code).catch(() => {});
  await S.waitForTimeout(1500); log.push('던전 💬: ' + !!(await S.$('#st-fb')));
  await S.click('#st-fb').catch(() => {}); await S.waitForTimeout(400); await S.click('.fb-kinds [data-k="love"]').catch(() => {}); await S.fill('#fb-t', '선생님 게임 재밌어요!').catch(() => {}); await S.click('#fb-send').catch(() => {}); await S.waitForTimeout(800);
  // 교사
  await T.evaluate(() => { try { DS.Scene.clear(); localStorage.removeItem('citadel-teacher'); } catch (e) { /* */ } }); await T.goto(U + '&role=teacher'); await T.waitForTimeout(2200);
  if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#fb-go'))) { await T.click('.role[data-role=teacher]').catch(() => {}); await T.waitForTimeout(800); }
  log.push('교사 단추: ' + ((await T.textContent('#fb-go').catch(() => '없음')) || '').trim());
  await T.click('#fb-go'); await T.waitForTimeout(800); await T.screenshot({ path: `${OUT}/67-2-teacher.png` });
  log.push('목록: ' + (await T.$$eval('.fb-item', (x) => x.map((e) => e.textContent.replace(/\s+/g, ' ').slice(0, 70)).join(' || '))));
  await T.click('.fb-kinds [data-f="bug"]'); await T.waitForTimeout(300); log.push('버그만: ' + (await T.$$eval('.fb-item', (x) => x.length)));
  await T.click('.fb-del'); await T.waitForTimeout(600); log.push('지운 뒤 버그: ' + (await T.$$eval('.fb-item', (x) => x.length)));
  console.log(log.join('\n')); console.log('errors', errs.length ? errs : 'none'); await b.close();
})();
