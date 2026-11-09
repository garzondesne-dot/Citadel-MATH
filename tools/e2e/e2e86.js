// 🧩 #52 ② · #53 (2026-11-10): 문제 7 근거 줄 2개 — 한 판 더 빈칸 2번 · 🧩 1/2 → 2/2 · 💡 힌트 줄마다 · TV 말풍선 줄마다 — node tools/e2e/e2e86.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.setViewportSize({ width: 1400, height: 900 }); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.evaluate(async () => { await DS.Net.set('gcfg/photo', { on: true, url: 'https://example.invalid/x' }); await DS.Net.set('photo_rubric/set-06/u7', { on: true }); });
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  const { code, hallKey } = await T.evaluate(() => DS.Act.createRoom('set-06', '1-3'));
  await S.evaluate(async (c) => { await DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }); }, code).catch(() => {}); await S.waitForTimeout(1500);
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-06'); for (let i = 0; i < 12; i++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(L, R); if (s && s.id === 'u7') break; await DS.Act.go(c, R, L, 1); } const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.setSolve(c, R, L, { now: true }); }, code);
  await S.waitForTimeout(2500); const clr = () => S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove()));
  await clr(); const dk = () => S.evaluate(() => ({ go: !!document.querySelector('.cr-dock #cr-go'), wr: !!document.querySelector('.cr-dock #cr-write'), prac: (document.querySelector('.cr-dock #cr-prac') || {}).disabled, bind: !!document.querySelector('#st-bind'), heal: !!document.querySelector('#st-heal'), lis: document.querySelectorAll('.cr-story li').length }));
  const put = (s, p, w, g) => S.evaluate(async ([c, s, p, w, g]) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'), me = DS.Net.uid(), it = DS.Raid.chainItems(L, R, 'u7', me, p), k = Object.keys((((R.chain || {}).u7 || {})[me]) || {}).length; await DS.Net.set(`rooms/${c}/chain/u7/${me}/${k}`, { s, p, g: w ? (g == null ? it[s].why.answer : g) : DS.Raid.chainAns(it[s]), ...(w ? { w: 1 } : {}), at: DS.Net.TS }); }, [code, s, p, w ? 1 : 0, g]);
  const rec = () => S.evaluate(async (c) => { const r = DS.Raid.record(DS.Lessons.get('set-06'), DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), 'u7', DS.Net.uid()); return { done: r.done, says: r.says.length, whyN: r.whyN, whyM: r.whyM, pWhy: r.pWhy, pStage: r.pStage }; }, code);
  for (let s = 0; s < 5; s++) await put(s, 0); await S.waitForTimeout(2000); await clr();
  let r = await rec(); ok(r.done && r.says === 7 && r.whyM === 2, `첫 판 = 나의 풀이 7줄 (근거 2줄 완성 문장) ${JSON.stringify(r)}`);
  await S.waitForTimeout(1600); await S.click('#cr-prac'); await S.waitForTimeout(1500); await clr();
  ok(/🧩 근거 줄 0\/2/.test(await S.textContent('.cr-chips')), '한 판 더: 🧩 근거 줄 0/2');
  await put(0, 1); await put(1, 1); await S.waitForTimeout(2500); await clr();
  ok(await S.isVisible('.cr-why') && /드모르간/.test(await S.textContent('.cr-why')), '졸개2 뒤 근거 빈칸 (드모르간)');
  await S.screenshot({ path: `${OUT}/86-why1.png` });
  await S.click('.cr-why [data-why="1"]'); await S.waitForTimeout(1500); r = await rec(); ok(r.pWhy === 1 && r.whyN === 0, '틀리면 다시 고름 (벌 없음)');
  await S.click('.cr-why [data-why="0"]'); await S.waitForTimeout(1800); await clr();
  ok(/🧩 근거 줄 1\/2/.test(await S.textContent('.cr-chips')), '근거 1 맞힘 → 🧩 1/2');
  for (let s = 2; s < 5; s++) await put(s, 1); await S.waitForTimeout(2500); await clr();
  ok(await S.isVisible('.cr-why') && /여집합/.test(await S.textContent('.cr-why')), '대장 뒤 근거 빈칸 (여집합 개수)');
  await S.click('.cr-why [data-why="0"]'); await S.waitForTimeout(2500); await clr(); r = await rec();
  ok(r.whyN === 2 && /🧩 근거 줄 2\/2/.test(await S.textContent('.cr-chips')), `근거 2 맞힘 → 🧩 2/2 (${r.whyN})`);
  // 💡 힌트 줄마다
  let hb = await S.getAttribute('#cr-hint', 'data-s'); ok(hb === '1' && /근거 줄 1/.test(await S.textContent('#cr-hint')), `힌트 주기 = 근거 줄 1 먼저 (단계 ${hb})`);
  await S.evaluate(() => document.querySelector('#cr-hint').scrollIntoView({ block: 'center' })); await S.click('#cr-hint'); await S.waitForTimeout(1800); await clr();
  hb = await S.getAttribute('#cr-hint', 'data-s'); ok(hb === '4' && /근거 줄 2/.test(await S.textContent('#cr-hint')), `다음 = 근거 줄 2 (단계 ${hb})`);
  const hint1 = await S.evaluate(async (c) => DS.Net.get(`rooms/${c}/players/${DS.Net.uid()}/hint`), code); ok(hint1 && hint1.u7 && !hint1['u7@4'], `저장 hint/u7 (첫 줄) ${JSON.stringify(Object.keys(hint1 || {}))}`);
  // TV
  const H = await mk('H'); await H.setViewportSize({ width: 1400, height: 800 }); await H.goto(U + `&role=hall&code=${code}&key=${hallKey}`); await H.waitForTimeout(3500);
  const tv1 = await H.evaluate(() => (document.querySelector('.h-hint') || {}).textContent || ''); ok(/드모르간/.test(tv1), `TV 말풍선 = 근거 줄 1 (${tv1.slice(0, 40)})`);
  await S.evaluate(() => document.querySelector('#cr-hint').scrollIntoView({ block: 'center' })); await S.click('#cr-hint'); await S.waitForTimeout(3000);
  const hint2 = await S.evaluate(async (c) => DS.Net.get(`rooms/${c}/players/${DS.Net.uid()}/hint`), code); ok(hint2 && hint2['u7@4'], `둘째 줄 저장 hint/u7@4 ${JSON.stringify(Object.keys(hint2 || {}))}`);
  const tv2 = await H.evaluate(() => (document.querySelector('.h-hint') || {}).textContent || ''); ok(/여집합/.test(tv2), `TV 말풍선 = 새로 힌트 준 근거 줄 2 (${tv2.slice(0, 40)})`);
  ok(/힌트를 줬어요/.test(await S.textContent('#st-body')), '줄마다 다 줌 → 「힌트를 줬어요」');
  await H.screenshot({ path: `${OUT}/86-tv.png` });
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
