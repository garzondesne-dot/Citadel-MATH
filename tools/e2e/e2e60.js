// 2026-11-05 · 6차시 v3 (드모르간 + 집합 중단원 마무리): 레이드 순서 · 👑 형성평가 고르기(multi) 문항 4번 풀기 — node tools/e2e/e2e60.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500);
  if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); });
  await S.click('#s-go'); await S.waitForTimeout(2000);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500);
  const code = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-06', '1-3', { noLimit: true }); await DS.Net.set(`rooms/${c.code}/meta/think`, 0); return c.code; });
  await S.click('#camp-gate', { force: true }); await S.waitForTimeout(2500);
  await T.evaluate(async (code) => { const L = DS.Lessons.get('set-06'); await DS.Net.set(`rooms/${code}/players/bot1`, { num: 11, nick: '봇1', hero: 2, cls: '1-3' });
    for (let k = 0; k < 14; k++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const st = DS.Raid.stepOf(L, R); if (st && st.kind === 'boss') break; await DS.Act.go(code, R, L, 1); } await DS.Act.setFocus(code, false); }, code);
  await S.waitForTimeout(2500);
  const lab = (i) => S.evaluate((i) => (document.querySelector(`.bitem[data-i="${i}"]`) || {}).textContent || '', i);
  const order = await S.evaluate(() => DS.Lessons.get('set-06').steps.map((s) => s.id).join(' '));
  log.push('순서: ' + order);
  async function solve(i, ok) { // 고르기: 맞는 번호 모두 / 틀림 = 첫 보기 하나만 (정답이 아닌 것)
    await S.click(`.bitem[data-i="${i}"]`); await S.waitForTimeout(500);
    const info = await S.evaluate(() => ({ f: document.querySelector('#quiz-formula').textContent, q: document.querySelector('#quiz-q').textContent, type: DS.Quiz.last.type, ans: DS.Quiz.last.answer, n: (DS.Quiz.last.options || []).length, opts: (DS.Quiz.last.options || []).join('|') }));
    if (info.type !== 'multi') throw new Error('고르기 문항이 아님 ' + info.type);
    const pick = ok ? info.ans : [[...Array(info.n).keys()].find((k) => !info.ans.includes(k))];
    for (const k of pick) await S.click(`#quiz-choices button.choice.multi:nth-child(${k + 1})`);
    await S.screenshot({ path: `${OUT}/q${i}-${ok ? 'ok' : 'x'}.png` });
    await S.click('#quiz-choices .btn, #quiz-choices button:not(.choice)'); await S.waitForTimeout(1200);
    return info;
  }
  const a3 = await solve(3, true), l3 = await lab(3);
  const a4 = await solve(4, false), l4 = await lab(4);
  const a4b = await solve(4, true), l4b = await lab(4);
  log.push(`4번: 「${a3.q.slice(0, 50)}」 보기 ${a3.opts} → 「${l3.trim()}」`);
  log.push(`5번: 첫 시도 틀림 「${l4.trim()}」 · 재도전 「${a4b.q.slice(0, 60)}」 보기 ${a4b.opts} → 「${l4b.trim()}」`);
  const nums = await S.evaluate(() => [...document.querySelectorAll('#quiz-choices .no')].length);
  await S.screenshot({ path: `${OUT}/boss.png` });
  const tries = await T.evaluate(async (code) => { const t = await DS.Net.get(`rooms/${code}/bossTry`); return Object.values(t || {})[0]; }, code);
  const C = { 순서: order === 'c1 m1 c2 m2 c3 m3 c4 u4 u5 u6 u7 boss', 교과서4번: /\{1, 5, 9, 10\}/.test(a3.q) && /도달/.test(l3), 틀림: /다시 · 기회 3/.test(l4), 재도전: a4.q !== a4b.q && /도달/.test(l4b) && /서로소/.test(a4b.q), 저장: tries && Object.keys(tries[3]).join() === '0' && Object.keys(tries[4]).join() === '0,1' };
  const bad = Object.keys(C).filter((k) => !C[k]); if (bad.length) log.push('틀린 항목: ' + bad.join(', '));
  console.log(log.join('\n')); console.log(!bad.length ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad.length || errs.length) process.exit(1);
})();
