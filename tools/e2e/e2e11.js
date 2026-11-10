const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(t + ' c: ' + m.text()); }); p.on('dialog', (d) => d.accept()); return p; };
  const act = (p) => p.evaluate(() => document.querySelector('.screen.active').id);
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', process.env.E2E_ID || 'e2e-teacher'); await T.fill('#f-teacher .t-pw', process.env.E2E_PW || '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500);
  await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  const S1 = await mk('S1'); await S1.goto(U + '&role=student'); await S1.waitForTimeout(1500);
  if (await S1.isVisible('#splash')) { await S1.click('#splash'); await S1.waitForTimeout(500); }
  await S1.selectOption('#s-cls', '1-3'); await S1.waitForTimeout(200); await S1.selectOption('#s-num', '1'); await S1.waitForTimeout(300);
  await S1.click('#s-new'); await S1.fill('#s-p1', '1234'); await S1.fill('#s-p2', '1234'); await S1.click('#s-make'); await S1.waitForTimeout(1200);
  await S1.click('#s-go'); await S1.waitForTimeout(1500);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  await T.selectOption('#lesson', 'set-04'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(1500);
  console.log('1 teacher after create:', await act(T));
  await T.screenshot({ path: `${OUT}/01-teacher.png` });
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 });
  await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  console.log('2 hall start:', await act(H), 'hallmode:', await H.evaluate(() => document.getElementById('screen-tcamp').classList.contains('tc-hallmode')));
  await H.screenshot({ path: `${OUT}/02-hall-tcamp.png` });
  await S1.waitForTimeout(500); await S1.click('#camp-gate'); await S1.waitForTimeout(2500);
  // 모루 미리 보기 열고 닫기 (종합상황실)
  await H.click('#tc-anvil'); await H.waitForTimeout(1200); console.log('3 forge open:', await H.isVisible('#forge')); await H.click('#fg-x'); await H.waitForTimeout(400);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  await go(); await T.waitForTimeout(1500);
  console.log('4 hall after start:', await act(H));
  const ans = (p, mode) => p.evaluate(async (mode) => {
    const code = JSON.parse(localStorage.getItem('citadel-student')).code;
    const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R), me = DS.Net.uid();
    const right = (q) => (q.type === 'choice' ? q.answerIndex : q.answer);
    if (!st) return 'none';
    if (st.kind === 'boss') { await DS.Act.bossAnswer(code, 1, L.boss.sets[1].map(right)); return 'boss'; }
    if (st.kind !== 'monster') return st.kind;
    const its = DS.Raid.itemsFor(L, R, st.id, me, 0); await DS.Act.submit(code, R, st.id, 0, its.map((q, i) => (mode === 'part' && i > 0 ? (q.type === 'multi' ? [] : -1) : right(q)))); return st.id;
  }, mode);
  for (let k = 0; k < 14; k++) {
    await go(); await T.waitForTimeout(900);
    const r = await ans(S1, k === 2 ? 'part' : 'all');
    if (k === 2) {
      await S1.waitForTimeout(2000);
      console.log('5 step', r, 'pips:', await S1.evaluate(() => document.querySelectorAll('.enc-tries i').length), 'name has title:', !!(await S1.$('#st-head .ttl')));
      await S1.screenshot({ path: `${OUT}/03-student-partial.png` });
      // 재도전 3번 모두 쓰기
      for (let a = 1; a <= 3; a++) await S1.evaluate(async (a) => { const code = JSON.parse(localStorage.getItem('citadel-student')).code; const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R), me = DS.Net.uid(); const its = DS.Raid.itemsFor(L, R, st.id, me, a); await DS.Act.submit(code, R, st.id, a, its.map((q) => (q.type === 'multi' ? [] : -1))); }, a);
      await S1.waitForTimeout(1200);
      console.log('6 tries saved:', await T.evaluate(async () => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${DS.Teacher.code()}`)); const L = DS.Lessons.get(R.meta.lesson); const st = DS.Raid.stepOf(L, R); const u = Object.keys(R.active)[0]; const rec = DS.Raid.record(L, R, st.id, u); return `${rec.tries.length} canRetry=${rec.canRetry}`; }));
    }
    if (r === 'boss') break;
  }
  await H.waitForTimeout(2500); await H.screenshot({ path: `${OUT}/04-hall-boss.png` });
  for (const P of [S1, typeof S2 !== 'undefined' ? S2 : null].filter(Boolean)) await P.evaluate(() => document.querySelectorAll('.th-chest-ov, #th-bat').forEach((e) => e.remove())); // 🎁 상자 · 🦇 박쥐 창 닫기 (0.9.11~)
  await S1.waitForTimeout(1500); await S1.click('#st-lobby'); await S1.waitForTimeout(2500);
  const ok = await S1.$('#rs-ok'); if (ok) await ok.click(); await S1.waitForTimeout(1500);
  console.log('7 student klass btn:', !!(await S1.$('#st-klass')), '| #68 B 한 줄:', await S1.$eval('.lb-mine', (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => 'none'), '| 더 보기 접힘:', await S1.$eval('.lb-more', (e) => !e.open).catch(() => 'none'), '| 한마디 접힘:', await S1.$eval('.lb-words', (e) => !e.open && !!e.querySelector('#st-word')).catch(() => 'none'));
  await S1.screenshot({ path: `${OUT}/05-student-lobby.png`, fullPage: true });
  await go(); await T.waitForTimeout(1500); // → 마무리
  console.log('8 hall finale klass btn:', !!(await H.$('#h-klass')), 'teacher news:', !!(await T.$('#t-news')));
  await H.screenshot({ path: `${OUT}/06-hall-finale.png` });
  if (await H.$('#h-klass')) { await H.click('#h-klass'); await H.waitForTimeout(2500); await H.screenshot({ path: `${OUT}/07-hall-klass.png` }); await H.click('.sc-modal .ui-x'); /* 0.9.6.27: 원래 닫기 버튼은 숨기고 ✕ 가 대신 */ }
  await T.evaluate(async () => DS.Act.endClass(DS.Teacher.code())); await T.waitForTimeout(2000);
  console.log('9 teacher after end:', await act(T), 'tcamp btn:', !!(await T.$('#t-tcamp')), '| hall:', await act(H), 'h-tcamp:', !!(await H.$('#h-tcamp')));
  await T.screenshot({ path: `${OUT}/08-teacher-end.png`, fullPage: true }); await H.screenshot({ path: `${OUT}/09-hall-end.png` });
  await H.waitForTimeout(2500); console.log('9b #68 B 종합실 끝: 학급 결과 저절로', !!(await H.$('.sc-modal')), '| 반대항 저절로 안 열림', !(await H.$('.pm-x')), '| 학생 결과 다시 안 뜸', !(await S1.$('.rs-modal')));
  if (await H.$('.pm-x')) await H.click('.pm-x'); if (await H.$('.sc-modal .ui-x')) await H.click('.sc-modal .ui-x'); // 🏁 반대항 · 🏫 학급 결과 창 닫기
  await H.click('#h-tcamp'); await H.waitForTimeout(1500);
  console.log('10 hall camp again:', await act(H), 'news:', !!(await H.$('#tc-news')));
  await H.screenshot({ path: `${OUT}/10-hall-tcamp-closed.png` });
  await H.click('#tc-menu'); await H.waitForTimeout(800); console.log('11 back to hall:', await act(H));
  await T.click('#t-tcamp'); await T.waitForTimeout(1500); console.log('12 teacher camp (2026-11-05 학생 캠프 그대로):', await act(T), 'gate:', await T.evaluate(() => (document.querySelector('#camp-gate .camp-label') || {}).textContent || ''));
  await T.screenshot({ path: `${OUT}/11-teacher-tcamp.png`, fullPage: true });
  console.log('ERRORS', errs.length, errs.slice(0, 8)); await b.close();
})();
