// v0.9.6 6차시 테스트 모드 처음부터 끝까지 · 보강던전 ④ (e2e14 를 6차시로) — node tools/e2e/e2e20.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('c: ' + m.text()); }); p.on('dialog', (d) => d.accept());
  const shot = (n, full) => p.screenshot({ path: `${OUT}/${n}.png`, fullPage: !!full });
  await p.goto('http://localhost:8765/index.html?local&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', process.env.E2E_ID || 'e2e-teacher'); await p.fill('#f-teacher .t-pw', process.env.E2E_PW || '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  console.log('lesson options:', await p.evaluate(() => [...document.querySelectorAll('#p-lesson option')].map((o) => o.value).join(',')));
  await p.selectOption('#p-lesson', 'set-06'); await p.click('#x-go'); await p.waitForTimeout(2500);
  await p.click('#camp-gate'); await p.waitForTimeout(3500);
  const next = async () => { await p.click('#tb-next'); await p.waitForTimeout(900); };
  const answer = (mode) => p.evaluate(async (mode) => {
    const db = JSON.parse(localStorage.getItem('citadel-test-db')); const code = Object.keys(db.rooms).pop();
    const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R), me = DS.Net.uid();
    const right = (q) => (q.type === 'choice' ? q.answerIndex : q.answer);
    const wrong = (q) => (q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : q.type === 'multi' ? q.answer.slice(1) : null);
    if (st.kind === 'boss') { await DS.Act.bossAnswer(code, 1, L.boss.sets[1].map(right)); return 'boss'; }
    if (st.kind !== 'monster') return st.kind;
    const items = DS.Raid.itemsFor(L, R, st.id, me, 0);
    await DS.Act.submit(code, R, st.id, 0, items.map((q, i) => (mode === 'all' || i === 0 ? right(q) : wrong(q))));
    return st.id;
  }, mode);
  for (let k = 0; k < 16; k++) {
    const t = await p.textContent('.tb-step');
    if (/형성평가/.test(t)) { await answer('boss'); await p.waitForTimeout(4000); await shot('04-boss'); await next(); break; }
    if (/문제/.test(t)) {
      if (/문제 3/.test(t)) { await p.waitForTimeout(800); await shot('01-m3-form', true); }
      const id = await answer(k % 2 ? 'all' : 'some'); await p.waitForTimeout(2200);
      if (id === 'm2') await shot('02-m2-result', true);
      if (id === 'm5') await shot('03-m5-result', true);
    } else if (/개념/.test(t) && /개념 2/.test(t)) await shot('00-concept2');
    await next();
  }
  await p.waitForTimeout(2500); { const rk = await p.$('#rs-ok'); if (rk) { await shot('05-result'); await rk.click(); await p.waitForTimeout(800); } }
  await next(); await next(); await p.waitForTimeout(2500);
  const ok = await p.$('#rs-ok'); if (ok) await ok.click(); await p.waitForTimeout(1200);
  console.log('screen:', await p.evaluate(() => document.querySelector('.screen.active').id));
  await p.click('#camp-castle'); await p.waitForTimeout(1500); await shot('06-bonus', true);
  const has = await p.$('[data-fight="set-06|b4"]'); console.log('bonus b3 button:', !!has);
  if (has) { await p.click('[data-fight="set-06|b4"]'); await p.waitForTimeout(600); await p.click('#bf-go'); await p.waitForTimeout(800); await shot('07-b3-q1', true);
    console.log('vshade choices:', await p.evaluate(() => document.querySelectorAll('#quiz-choices .vshade').length)); }
  console.log('ERRORS', errs.length, errs.slice(0, 6)); await b.close();
})();
