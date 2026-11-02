const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', process.env.E2E_ID || 'e2e-teacher'); await T.fill('#f-teacher .t-pw', process.env.E2E_PW || '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(async () => {
    const mkImg = (txt, col) => { const c = document.createElement('canvas'); c.width = 800; c.height = 1000; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 800, 1000); g.fillStyle = col; g.font = 'bold 60px sans-serif'; g.fillText(txt, 60, 140); g.strokeStyle = col; g.lineWidth = 6; g.strokeRect(30, 30, 740, 940); return c.toDataURL('image/webp', 0.8); };
    await DS.Net.set('prep/set-04/img/c1', mkImg('개념 1 · 교집합 합집합', '#1e3a8a')); await DS.Net.set('prep/set-04/img/m1', mkImg('문제 1 (1) (2)', '#b91c1c'));
  });
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  await T.selectOption('#lesson', 'set-04'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(1500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 });
  await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  const S1 = await mk('S1'); await S1.goto(U + '&role=student'); await S1.waitForTimeout(1500);
  if (await S1.isVisible('#splash')) { await S1.click('#splash'); await S1.waitForTimeout(500); }
  await S1.selectOption('#s-cls', '1-3'); await S1.waitForTimeout(200); await S1.selectOption('#s-num', '1'); await S1.waitForTimeout(300);
  await S1.click('#s-new'); await S1.fill('#s-p1', '1234'); await S1.fill('#s-p2', '1234'); await S1.click('#s-make'); await S1.waitForTimeout(1200);
  await S1.click('#s-go'); await S1.waitForTimeout(2000); await S1.click('#camp-gate'); await S1.waitForTimeout(2500);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  for (let k = 0; k < 4; k++) { await go(); await T.waitForTimeout(700); } // 대기 → 도입 → 복습 → 개념1 → 문제1
  const sub = (a, allRight) => S1.evaluate(async ([a, allRight]) => { const code = JSON.parse(localStorage.getItem('citadel-student')).code; const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R), me = DS.Net.uid(); const right = (q) => (q.type === 'choice' ? q.answerIndex : q.answer); const its = DS.Raid.itemsFor(L, R, st.id, me, a); await DS.Act.submit(code, R, st.id, a, its.map((q, i) => (allRight || i === 0 ? right(q) : (q.type === 'multi' ? [] : -1)))); return st.id; }, [a, allRight]);
  console.log('step', await sub(0, true)); await S1.waitForTimeout(2500);
  console.log('practice btn:', await S1.evaluate(() => { const b = document.querySelector('#st-retry'); return b && b.textContent; }));
  await S1.screenshot({ path: `${OUT}/1-student-perfect.png`, fullPage: true });
  await S1.waitForTimeout(5500); await S1.click('#st-retry'); await S1.waitForTimeout(800);
  await S1.screenshot({ path: `${OUT}/2-student-practice-form.png` });
  await sub(1, false); const got = await H.waitForSelector('.prac-tag', { timeout: 4000 }).then(() => true).catch(() => false); console.log('tag appeared:', got); await H.screenshot({ path: `${OUT}/3-hall-practice.png` });
  console.log('hall tag:', !!(await H.$('.prac-tag')));
  await S1.waitForTimeout(1800); await S1.screenshot({ path: `${OUT}/4-student-practice-result.png`, fullPage: true });
  console.log('student head:', await S1.textContent('#st-body h2'));
  console.log('dmg:', await T.evaluate(async () => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${DS.Teacher.code()}`)); const L = DS.Lessons.get(R.meta.lesson); return JSON.stringify(DS.Raid.monsterHp(L, R, 'm1')); }));
  console.log('ERRORS', errs.length, errs.slice(0, 5)); await b.close();
})();
