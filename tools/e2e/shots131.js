// 📸 허수아비 · 성채 전투 화면 캡처 (360 폭) — PORT=8766 node tools/e2e/shots131.js <출력 폴더> <앞 이름>
//   ① 🎯 허수아비 9차시 문제 1 (한 번 틀린 뒤) ② 🏰 성채 1층 일반 방 ③ 🏰 성채 소레이드 방 q07
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', TAG = process.argv[3] || 'now', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2 }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(async () => { await DS.Account.uploadRoster([{ c: '1-3', n: 1, name: '김민준' }]); });
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); await DS.Net.set('unlock/1-3', 9); await DS.Net.set('held/1-3/set-09', true); await DS.Net.set('records/1-3/1/set-09', { no: 9, conc: {}, boss: 2, bossN: 4, miss: ['m1'] }); });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500);
  const fill = async () => { const n = (await S.$$('.bn-fight .ans-line')).length; for (let i = 0; i < n; i++) { const r = await S.$(`.bn-fight [data-rune="${i}|1"]`); if (r) { await r.click(); await S.waitForTimeout(120); continue; } const bt = await S.$(`.bn-fight [data-pick^="${i}|"]`); if (bt) { await bt.click(); await S.waitForTimeout(200); } } return n; };
  const start = async () => { const g = await S.$('.bn-fight #bf-go'); if (g) { await g.click(); await S.waitForTimeout(1200); } };
  // ① 허수아비
  await S.evaluate(() => DS.Control.run(async () => DS.Bonus.enter(await DS.Account.me(), { train: true, go: ['set-09', 'm1'] }))); await S.waitForTimeout(2000);
  await start(); await S.screenshot({ path: `${OUT}/scare-${TAG}-1-fight.png` });
  const parts = await S.evaluate(() => ({ hp: !!document.querySelector('.bn-fight .scene .sc-hp'), dock: !!document.querySelector('.bn-fight .st-dock.bf-dock .ch-row'), old: !!document.querySelector('.bn-fight .enc-tries, .bn-fight .segs') }));
  if (TAG !== 'now' && (!parts.hp || !parts.dock || parts.old)) errs.push('🪞 수업 레이드 부품 아님 ' + JSON.stringify(parts));
  await S.evaluate(() => { let k = 0; DS.Quiz.grade = () => (++k !== 1); });
  await fill(); await S.evaluate(() => { const g = document.querySelector('#bf-go2'); if (g) g.click(); }); await S.waitForTimeout(6500);
  await S.screenshot({ path: `${OUT}/scare-${TAG}-2-wrong.png` });
  await S.evaluate(() => { const x = document.querySelector('#bf-x'); if (x) x.click(); }); await S.waitForTimeout(800);
  // ② ③ 성채
  for (const [mid, nm] of [['q01', 'castle-room'], ['q07', 'castle-soraid']]) {
    await S.evaluate(() => { const x = document.querySelector('#bf-x'); if (x) x.click(); document.querySelectorAll('.bn-fight').forEach((e) => e.remove()); });
    await S.evaluate((mid) => DS.Control.run(async () => DS.Bonus.enter(await DS.Account.me(), { go: ['eval-1', mid] })), mid); await S.waitForTimeout(2200);
    await S.screenshot({ path: `${OUT}/${nm}-${TAG}-1.png` });
    await start(); await S.waitForTimeout(600); await S.screenshot({ path: `${OUT}/${nm}-${TAG}-2.png` });
    await S.evaluate(() => { DS.Quiz.close && DS.Quiz.close(); });
  }
  console.log('errors', errs.length ? errs : 'none'); await b.close();
})();
