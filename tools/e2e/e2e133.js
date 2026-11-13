// 🎯🏰 2026-11-13: 🏰 성채 = 한 판에 모두 맞혀야 처치(B · 소레이드 = 한 단계 틀리면 숫자 바뀐 사슬로 처음부터) · 🎯 허수아비 = 같은 날 되돌림(틀린 것만 새 숫자로 다시) — PORT=8766 node tools/e2e/shots131.js <출력 폴더> <앞 이름>
//   ① 🎯 허수아비 9차시 문제 1 (한 번 틀린 뒤) ② 🏰 성채 1층 일반 방 ③ 🏰 성채 소레이드 방 q07
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2 }); const errs = [], log = []; let bad = 0; const ok = (c, m) => { log.push((c ? '✔ ' : '✘ ') + m); if (!c) bad++; };
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
  // ① 허수아비 9차시 문제 1: 첫 판 1개 틀림
  await S.evaluate(() => DS.Control.run(async () => DS.Bonus.enter(await DS.Account.me(), { train: true, go: ['set-09', 'm1'] }))); await S.waitForTimeout(2000);
  await start();
  await S.evaluate(() => { let k = 0; DS.Quiz.grade = () => (++k !== 1); });
  const n1 = await fill(); await S.evaluate(() => document.querySelector('#bf-go2').click()); await S.waitForTimeout(6500);
  const t1 = await S.evaluate(() => document.querySelector('.bn-fight').innerText);
  const r1 = await S.evaluate(() => DS.Net.get('bonus/1-3/1/set-09/m1'));
  ok(/틀린 것만 새 숫자로 다시/.test(t1) && !/한 판에 모두/.test(t1) && !(r1 || {}).clear, `🎯 허수아비 1개 틀림 → 처치 안 됨 · 「틀린 것만 새 숫자로 다시」 (소문제 ${n1} · 같은 날 되돌림)`);
  await S.click('#bf-again'); await S.waitForTimeout(1500);
  const n2 = (await S.$$('.bn-fight .ans-line')).length;
  ok(n2 === 1, `다시 도전 = 틀린 소문제 ${n2}개만 (맞힌 ${n1 - 1}개는 그대로)`);
  await S.evaluate(() => { DS.Quiz.grade = () => true; });
  await fill(); await S.evaluate(() => document.querySelector('#bf-go2').click()); await S.waitForTimeout(6500);
  const r2 = await S.evaluate(() => DS.Net.get('bonus/1-3/1/set-09/m1'));
  ok(r2 && r2.clear && r2.tries === 2, `둘째 판 모두 맞힘 → 처치 (tries ${r2 && r2.tries})`);
  await S.screenshot({ path: `${OUT}/133-scare.png` });
  // ② 성채 소레이드 q07: 둘째 단계 틀림 → 사슬 처음부터 (숫자 바뀜)
  await S.evaluate(() => { document.querySelectorAll('.bn-fight').forEach((e) => e.parentNode.removeChild(e)); window.__asks = []; let k = 0; DS.Quiz.ask = async (card, q) => { window.__asks.push(card.formula + '|' + JSON.stringify(q)); k++; return k !== 2; }; });
  await S.evaluate(() => DS.Control.run(async () => DS.Bonus.enter(await DS.Account.me(), { go: ['eval-1', 'q07'] }))); await S.waitForTimeout(2200);
  const intro = await S.evaluate(() => document.querySelector('.bn-fight').innerText);
  ok(/한 판에 모두 맞혀야 처치/.test(intro), '소레이드 안내 = 한 판에 모두 맞혀야 처치');
  await start(); await S.waitForTimeout(16000);
  const asks = await S.evaluate(() => window.__asks), r3 = await S.evaluate(() => DS.Net.get('bonus/1-3/1/eval-1/q07'));
  ok(asks.length > 2 && asks[2].startsWith('졸개 ①') && asks[2] !== asks[0], `둘째 단계 틀림 → 졸개 ① 부터 숫자 바뀐 사슬 (${asks.slice(0, 3).map((a) => a.slice(0, 70)).join(' / ')})`);
  ok(r3 && r3.clear, `새 사슬 모두 맞힘 → 처치 (${asks.length}번 물음)`);
  await S.screenshot({ path: `${OUT}/133-castle.png` });
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
