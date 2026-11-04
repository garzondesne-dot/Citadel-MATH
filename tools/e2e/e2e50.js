// 🔄 반대로 밸런스 · ⭕ 수학 OX (2026-11-04 · v0.9.8.0): 종합상황실 버튼 3개 → 반대로 = 많은 쪽 탈락(침대 숙소 · 스프링 띠용) → 수학 OX = 틀리면 탈락(얼음 시험장 · 문장 · 해설) — node tools/e2e/e2e50.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); await p.addInitScript(() => { window.DS_FUN = { pick: 5000, show: 4000 }; }); return p; };
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
  const { code, key } = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-04', '1-3'); const code = c.code || c; return { code, key: (await DS.Net.get(`secrets/${code}`)).hallKey }; });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500); await S.click('#camp-gate'); await S.waitForTimeout(2500);
  // 가짜 용사 5명 + 수업 시작 + 쉼터
  await T.evaluate(async (code) => {
    for (let i = 1; i <= 5; i++) { await DS.Net.set(`rooms/${code}/players/bot${i}`, { num: 10 + i, nick: `봇${i}`, hero: i % 6, cls: '1-3' }); await DS.Net.set(`rooms/${code}/active/bot${i}`, true); }
    const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1);
    await DS.Act.setRest(code, true, 5);
  }, code);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 });
  await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(3000);
  const btns = await H.$$eval('[data-fun^="start:"]', (x) => x.map((e) => e.dataset.fun)); log.push('종합상황실 버튼: ' + btns.join(' '));
  const vote = (rk, v) => T.evaluate(async ({ code, rk, v }) => { for (const [u, x] of Object.entries(v)) await DS.Net.set(`rooms/${code}/fv/${rk}/${u}`, x); }, { code, rk, v });
  // 🔄 반대로: 나 a + 봇 1 a  vs  봇 2~5 b → 많은 쪽(b) 4명 탈락 · 나 생존
  await H.click('[data-fun="start:rev"]'); await H.waitForTimeout(1500);
  log.push('반대로 머리말: ' + (await H.textContent('.fa-head')).replace(/\s+/g, ' ').trim());
  await H.screenshot({ path: `${OUT}/1-rev-pick.png` });
  await S.click('.fa-pick .fa-a'); await vote('r1', { bot1: 'a', bot2: 'b', bot3: 'b', bot4: 'b', bot5: 'b' });
  await H.waitForFunction(() => document.querySelector('.k-rev .fa-plat.fall'), null, { timeout: 12000 }); await H.waitForTimeout(700);
  await H.screenshot({ path: `${OUT}/2-rev-boing.png` });
  log.push('반대로 공개: ' + (await H.textContent('.fa-foot')).trim());
  await S.screenshot({ path: `${OUT}/3-rev-phone.png` }); log.push('학생: ' + (await S.textContent('.fa-me')).trim());
  // ⭕ 수학 OX: 새 게임
  await T.evaluate((code) => DS.Fun.stop(code), code); await H.waitForTimeout(1500);
  await H.click('[data-fun="start:ox"]'); await H.waitForTimeout(1500);
  const f = await T.evaluate((code) => DS.Net.get(`rooms/${code}/fun`), code);
  log.push(`OX 문장: ${f.s} (정답 ${f.ans === 'a' ? 'O' : 'X'} · ${f.kind})`);
  await H.screenshot({ path: `${OUT}/4-ox-pick.png` });
  await S.waitForSelector('.fa-st'); await S.screenshot({ path: `${OUT}/5-ox-phone.png` });
  const right = f.ans, wrong = f.ans === 'a' ? 'b' : 'a';
  await S.click(`.fa-pick .fa-${right}`); await vote('r1', { bot1: right, bot2: wrong, bot3: wrong, bot4: right, bot5: right });
  await H.waitForFunction(() => /정답/.test((document.querySelector('.fa-foot') || {}).textContent || ''), null, { timeout: 12000 }); await H.waitForTimeout(2600);
  await H.screenshot({ path: `${OUT}/6-ox-show.png` });
  const oxv = (await H.textContent('.fa-foot')).trim(); log.push('OX 공개: ' + oxv);
  const ok = btns.length === 3 && /많은 쪽/.test(log.join()) && /4명 탈락/.test(log.join()) && /살아남았다/.test(log.join()) && f.kind === 'ox' && f.no !== 0 && /정답/.test(oxv) && /2명 탈락/.test(oxv);
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
