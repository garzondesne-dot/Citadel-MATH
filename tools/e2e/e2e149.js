// 🎯 2026-11-13 밤 선생님 「허수아비는 풀이기록없는 문항만 학습지 문제그대로. 맞춘기록있으면 바뀐숫자」: 문제마다 수업 기록 — 맞힘(o · f) = 🔁 바뀐 숫자 · 기록 없음 · 못 맞힘 = 📄 학습지 숫자
//   · 형성평가 재대결 = 문항마다 (bossM) — PORT=8766 node tools/e2e/e2e149.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(async () => { await DS.Account.uploadRoster([{ c: '1-3', n: 1, name: '김민준' }]); await DS.Net.set('gcfg/photo', { on: true, url: 'https://example.invalid/x' }); await DS.Net.set('photo_rubric/set-09/m5', { on: true }); });
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); await DS.Net.set('unlock/1-3', 3); await DS.Net.set('held/1-3/set-03', true); await DS.Net.set('records/1-3/1/set-03', { no: 3, conc: {}, mons: { m1: 'o', m2: 'x', m3: 'f' }, bossM: 'oxoooxx', boss: 4, bossN: 6 }); });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500);
  await S.evaluate(() => DS.Control.run(async () => DS.Bonus.enter(await DS.Account.me(), { train: true }))); await S.waitForTimeout(1800);
  const look = async (mid) => { await S.evaluate((m) => document.querySelector(`[data-fight="set-03|${m}"]`).click(), mid); await S.waitForTimeout(1800); await S.evaluate(() => { const g = document.querySelector('#bf-go'); if (g) g.click(); }); await S.waitForTimeout(1500); const r = await S.evaluate(() => ({ tags: [...document.querySelectorAll('.bn-fight .num-tag')].map((t) => t.textContent.trim()), q: (document.querySelector('.bn-fight .items') || {}).innerText || '' })); await S.screenshot({ path: `${OUT}/149-${mid}.png` }); await S.evaluate(() => { const x = document.querySelector('#bf-x'); if (x) x.click(); }); await S.waitForTimeout(900); return r; };
  const ws = await S.evaluate(() => { const L = DS.Lessons.get('set-03'); return { m2: L.items('m2', 'x|1', 0).map((q) => DS.UI.plain(q.question || '')).join(' / ').slice(0, 60), b1: DS.UI.plain(L.boss.sets[1][1].question || '').slice(0, 30) }; });
  let r = await look('m1'); ok(r.tags.length === 1 && /바뀐 숫자/.test(r.tags[0]), `문제 1 (수업에서 한 번에 맞힘) = 🔁 바뀐 숫자 (${r.tags})`);
  r = await look('m2'); ok(r.tags.length === 1 && /학습지 숫자/.test(r.tags[0]), `문제 2 (수업에서 못 맞힘) = 📄 학습지 숫자 (${r.tags})`);
  ok(r.q.replace(/\s+/g, ' ').includes(ws.m2.split(' / ')[0].replace(/\s+/g, ' ').slice(0, 15)), `문제 2 = 학습지 숫자 그대로 (${ws.m2.slice(0, 30)})`);
  r = await look('m3'); ok(r.tags.length === 1 && /바뀐 숫자/.test(r.tags[0]), `문제 3 (고쳐서 맞힘 f) = 🔁 바뀐 숫자 (${r.tags})`);
  r = await look('boss'); ok(r.tags.length >= 6 && /바뀐/.test(r.tags[0]) && /학습지/.test(r.tags[1]) && /바뀐/.test(r.tags[2]), `형성평가 재대결 = 문항마다 (${r.tags.map((t) => (/학습지/.test(t) ? '📄' : '🔁')).join('')})`);
  ok(r.q.includes(ws.b1.slice(2, 14)), `2번(수업에서 틀림) = 학습지 숫자 (${ws.b1})`);
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
