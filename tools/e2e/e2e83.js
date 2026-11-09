// 🐞 소레이드 「🔥 한 판 더」에서 답을 고르면 스크롤이 맨 위로 튀던 것 (2026-11-09) — node tools/e2e/e2e83.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.setViewportSize({ width: 1400, height: 900 }); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.evaluate(async () => { await DS.Net.set('gcfg/photo', { on: true, url: 'https://example.invalid/x' }); await DS.Net.set('photo_rubric/set-06/u4', { on: true }); });
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  const { code } = await T.evaluate(() => DS.Act.createRoom('set-06', '1-3'));
  await S.evaluate(async (c) => { await DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }); }, code).catch(() => {}); await S.waitForTimeout(1500);
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-06'); for (let i = 0; i < 12; i++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(L, R); if (s && s.id === 'u4') break; await DS.Act.go(c, R, L, 1); } const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.setSolve(c, R, L, { now: true }); }, code);
  await S.waitForTimeout(2500);
  // 학생 본인이 첫 판을 모두 맞힘 (학습지 숫자)
  await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'), me = DS.Net.uid();
    const right = (q) => (q.type === 'multi' ? q.answer : q.type === 'choice' ? q.answerIndex : q.answer); const it = DS.Raid.chainItems(L, R, 'u4', me, 0);
    for (let s = 0; s < it.length; s++) await DS.Net.set(`rooms/${c}/chain/u4/${me}/${s}`, { s, p: 0, g: right(it[s]), at: DS.Net.TS }); }, code);
  await S.waitForTimeout(2500);
  // 🐞 2026-11-09 선생님: 소레이드 4번 한 판 더에서 답을 고르면 스크롤이 맨 위로 → 그대로 있어야 함
  await S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove())); await S.click('#cr-prac'); await S.waitForTimeout(1500);
  await S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove()));
  const opt = S.locator('#st-body [data-pick]').last(); await opt.scrollIntoViewIfNeeded(); await S.waitForTimeout(300);
  const sy = () => S.evaluate(() => (document.querySelector('#st-body .paper') || {}).scrollTop || 0); // 문제 종이(.paper)가 스크롤 칸
  const y0 = await sy(); await opt.click(); await S.waitForTimeout(800);
  const y1 = await sy(), on = await S.evaluate(() => document.querySelectorAll('#st-body [data-pick].on').length);
  ok(y0 > 50 && Math.abs(y1 - y0) < 5 && on > 0, `연습 판 답 고르기 → 스크롤 ${y0} → ${y1} (고른 칸 ${on})`);
  await S.screenshot({ path: `${OUT}/83-prac-scroll.png` });
  // 📐 #51 한 판 더 배치 = 📜 문제 → 📜 나의 풀이 → 고르기 (졸개 ① 맞힌 뒤)
  await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'), me = DS.Net.uid(), it = DS.Raid.chainItems(L, R, 'u4', me, 1), k = Object.keys((((R.chain || {}).u4 || {})[me]) || {}).length; await DS.Net.set(`rooms/${c}/chain/u4/${me}/${k}`, { s: 0, p: 1, g: DS.Raid.chainAns(it[0]), at: DS.Net.TS }); }, code);
  await S.waitForTimeout(2500);
  const ord = await S.evaluate(() => [...document.querySelectorAll('#st-body .cr-prob, #st-body .cr-story, #st-body .paper .items')].map((e) => e.className.split(' ')[0]));
  ok(ord.join(',') === 'cr-prob,cr-story,items', `한 판 더 순서 = 문제 → 나의 풀이 → 고르기 (${ord.join(' → ')})`);
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
