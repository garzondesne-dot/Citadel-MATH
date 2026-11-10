// 🏰 #69 던전을 나오면 성채 해금 팝업 + 캠프 알림 차례로 (2026-11-11): ① 성채 새 방 → ② 📢 공지 → ③ 🏅 새 호칭 → ④ 📮 확인도장 띠
//   전리품에서 이미 본 성채 방은 다시 안 띄움 · 수업에서 나온 게 아니면 성채 팝업 없음
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e104.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = []; let ok = 0, fail = 0;
  const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500);
  if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.click('#s-go'); await S.waitForTimeout(2500);
  await S.evaluate(async () => {
    await DS.Net.set('unlock/1-3', 4);
    await DS.Net.set('notice/1-3/n1', { t: '내일은 5차시예요', at: Date.now() + 1000 });
    localStorage.setItem('citadel-stamp', new Date().toISOString().slice(0, 10));
    localStorage.removeItem('citadel-stamp-seen');
  });
  const stampDay = await S.evaluate(() => localStorage.getItem('citadel-stamp'));
  const me = { c: '1-3', n: 1, name: '김민준', hero: 0 };
  // ① 수업에서 막 나옴 (4차시)
  await S.evaluate((me) => { DS.Camp.afterClass('set-04'); DS.Camp.enter(me); }, me); await S.waitForTimeout(3000);
  const pop = await S.$eval('.cq-pop', (e) => e.textContent.replace(/\s+/g, ' ')).catch(() => '');
  check(/성채던전 새 방 \d+개가 열렸어요/.test(pop), `① 성채 해금 팝업 (${pop.slice(0, 80)})`);
  check(!(await S.$('.nt-pop')), '공지는 성채 팝업을 닫은 뒤');
  await S.screenshot({ path: `${OUT}/q1-castle.png` });
  await S.evaluate(() => document.querySelector('#cq-x').click()); await S.waitForTimeout(1500); // 닫기 = 위 ✕ (ui-x-src)
  check(!!(await S.$('.nt-pop')), '② 그다음 📢 공지');
  check(!(await S.$('#camp-stamp')), '확인도장 띠는 아직');
  await S.evaluate(() => { const x = document.querySelector('.nt-pop .ui-x, .nt-pop [data-x], .nt-pop button'); if (x) x.click(); }); await S.waitForTimeout(1200);
  if (await S.$('.nt-pop')) await S.evaluate(() => document.querySelectorAll('.nt-pop').forEach((e) => e.remove()));
  await S.waitForTimeout(5500);
  check(!!(await S.$('#camp-stamp')) || !stampDay, '④ 마지막에 📮 확인도장 띠');
  // ② 수업에서 나온 게 아니면 성채 팝업 없음 · 같은 차시 두 번째도 없음
  await S.evaluate((me) => { DS.Camp.enter(me); }, me); await S.waitForTimeout(2500);
  check(!(await S.$('.cq-pop')), '그냥 캠프 = 성채 팝업 없음');
  await S.evaluate((me) => { DS.Camp.afterClass('set-04'); DS.Camp.enter(me); }, me); await S.waitForTimeout(2500);
  check(!(await S.$('.cq-pop')), '이미 본 차시 = 다시 안 띄움');
  console.log(`e2e104: 확인 ${ok} · 실패 ${fail}`, 'errors:', errs.length ? errs : 'none');
  await b.close(); if (fail || errs.length) process.exit(1);
})();
