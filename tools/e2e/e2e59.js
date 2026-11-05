// 2026-11-05 · 👑 형성평가 문항마다 4번 (첫 시도 = 학습지 그대로 · 재도전 = 숫자 바뀐 새 문제) — node tools/e2e/e2e59.js <출력 폴더>
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
  const code = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-04', '1-3', { noLimit: true }); await DS.Net.set(`rooms/${c.code}/meta/think`, 0); return c.code; });
  await S.click('#camp-gate', { force: true }); await S.waitForTimeout(2500);
  await T.evaluate(async (code) => { const L = DS.Lessons.get('set-04'); await DS.Net.set(`rooms/${code}/players/bot1`, { num: 11, nick: '봇1', hero: 2, cls: '1-3' });
    for (let k = 0; k < 14; k++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const st = DS.Raid.stepOf(L, R); if (st && st.kind === 'boss') break; await DS.Act.go(code, R, L, 1); } await DS.Act.setFocus(code, false); }, code);
  await S.waitForTimeout(2500);
  const lab = (i) => S.evaluate((i) => (document.querySelector(`.bitem[data-i="${i}"]`) || {}).textContent || '', i);
  const tabs = await S.$('#st-body .tabs .tab');
  // 한 번 풀기: 0 = 틀린 답 · 1 = 맞는 답 (선다형은 보기 버튼 · 숫자는 다이얼 대신 DS.Quiz.last 로 맞는 값을 넣는다)
  async function solve(i, ok) {
    await S.click(`.bitem[data-i="${i}"]`); await S.waitForTimeout(500);
    const info = await S.evaluate(() => ({ f: document.querySelector('#quiz-formula').textContent, q: document.querySelector('#quiz-q').textContent, type: DS.Quiz.last.type, ai: DS.Quiz.last.answerIndex, n: (DS.Quiz.last.choices || []).length }));
    if (info.type === 'choice') await S.click(`#quiz-choices button:nth-child(${(ok ? info.ai : (info.ai + 1) % info.n) + 1})`);
    else throw new Error('선다형만 시험');
    await S.waitForTimeout(1200);
    return info;
  }
  const a0 = await solve(0, false), l0 = await lab(0);
  const a1 = await solve(0, true), l1 = await lab(0);
  log.push(`1번: 첫 시도 「${a0.f}」 → 「${l0.trim()}」 · 재도전 「${a1.f}」 문제 바뀜 ${a0.q !== a1.q} → 「${l1.trim()}」`);
  await S.screenshot({ path: `${OUT}/1-boss-items.png` });
  const qs = [];
  for (let k = 0; k < 4; k++) qs.push((await solve(1, false)).q);
  const l2 = await lab(1);
  await S.click('.bitem[data-i="1"]'); await S.waitForTimeout(400);
  const toast = await S.evaluate(() => (document.querySelector('#toast') || {}).textContent || '');
  const tries = await T.evaluate(async (code) => { const t = await DS.Net.get(`rooms/${code}/bossTry`); return Object.values(t || {})[0]; }, code);
  log.push(`2번: 4번 틀림 → 「${l2.trim()}」 · 서로 다른 문제 ${new Set(qs).size} · 5번째 누르면 「${toast.slice(0, 40)}」 · 저장 ${JSON.stringify(Object.fromEntries(Object.entries(tries || {}).map(([i, v]) => [i, Object.keys(v)])))}`);
  await S.screenshot({ path: `${OUT}/2-boss-spent.png` });
  const C = { 탭없음: !tabs, 첫시도: /첫 시도/.test(a0.f) && /다시 · 기회 3/.test(l0), 재도전: /재도전 1/.test(a1.f) && a0.q !== a1.q && /도달/.test(l1), 기회끝: /해설 보기/.test(l2) && new Set(qs).size >= 3 && /기회를 모두/.test(toast), 저장: tries && Object.keys(tries[0]).join() === '0,1' && Object.keys(tries[1]).join() === '0,1,2,3' };
  const bad = Object.keys(C).filter((k) => !C[k]); if (bad.length) log.push('틀린 항목: ' + bad.join(', '));
  console.log(log.join('\n')); console.log(!bad.length ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad.length || errs.length) process.exit(1);
})();
