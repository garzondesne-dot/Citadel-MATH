// ✍ 2026-11-13 허수아비 「서술형만」 바로 가기: 차시 카드 맨 위 칩 → 서술형 문제로 바로 (앞 문제 안 풀어도) · 여럿이면 목록 · 서술형 없는 차시엔 없음 — node tools/e2e/e2e131.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 360, height: 780 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(async () => { await DS.Account.uploadRoster([{ c: '1-3', n: 1, name: '김민준' }]); });
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); await DS.Net.set('unlock/1-3', 9); await DS.Net.set('held/1-3', { 'set-06': true, 'set-08': true, 'set-09': true }); });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500);
  await S.evaluate(() => DS.Control.run(async () => DS.Bonus.enter(await DS.Account.me(), { train: true }))); await S.waitForTimeout(1800);
  const chips = await S.evaluate(() => [...document.querySelectorAll('.bn-card')].map((c) => ({ h: (c.querySelector('.bn-h b') || {}).textContent || '', wr: [...c.querySelectorAll('.bn-wr [data-fight]')].map((x) => x.dataset.fight) })));
  const of = (n) => chips.find((c) => new RegExp(`! ${n}[·차]`).test(c.h)) || { wr: [] };
  ok(of(9).wr.join() === 'set-09|m5', `9차시 = 「✍ 서술형만」 → 문제 5 (${of(9).wr})`);
  ok(of(6).wr.length >= 2 && !!(await S.$('details.bn-wr')), `6차시 = 서술형 ${of(6).wr.length}문제 목록 (${of(6).wr})`);
  ok(!of(8).wr.length, '서술형 없는 8차시 = 칩 없음');
  ok(chips[0] && chips[0].h && (await S.evaluate(() => { const c = [...document.querySelectorAll('.bn-card')].find((x) => /9차시/.test(x.textContent)); const w = c.querySelector('.bn-wr'), l = c.querySelector('.bn-list'); return !!(w && l && (w.compareDocumentPosition(l) & 4)); })), '칩 = 카드 위쪽(문제 목록보다 위)');
  await S.screenshot({ path: `${OUT}/131-chip.png` });
  await S.evaluate(() => { const c = [...document.querySelectorAll('.bn-card')].find((x) => /9차시/.test(x.textContent)); c.querySelector('.bn-wr [data-fight]').click(); }); await S.waitForTimeout(1800);
  const t = await S.evaluate(() => (document.querySelector('.bn-fight') || {}).innerText || '');
  ok(/문제 5/.test(t), '누르면 문제 5 전투로 바로 (앞 문제 안 풀어도)');
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
