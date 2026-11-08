// 8차시 「명제와 조건」 (2026-11-08 · 요청 #5): 교사 폰 · 학생 폰 · 종합실 — 생각 열기부터 형성평가(부정의 수정 여왕)까지 모든 단계 · 몬스터마다 정답 제출 · 오류 0
//   node tools/e2e/e2e77.js <출력 폴더>  (로컬 서버 http://localhost:8765)
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
  await T.selectOption('#t-cls', '1-3'); await T.waitForTimeout(800); await T.selectOption('#lesson', 'set-08'); await T.waitForTimeout(300); await T.click('#t-new'); await T.waitForTimeout(1500);
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
  const seen = [];
  for (let k = 0; k < 16; k++) {
    const st = await H.evaluate(async () => { const c = DS.Hall && DS.Hall.code ? DS.Hall.code() : null; return document.querySelector('#h-top, .h-top') ? (document.querySelector('#h-top, .h-top').textContent || '').slice(0, 40) : ''; }).catch(() => '');
    const r = await ans(S1, 'all'); seen.push(r);
    await S1.waitForTimeout(1500);
    if (r === 'm1' || r === 'm5' || r === 'boss') { await S1.screenshot({ path: `${OUT}/77-phone-${r}.png` }); await H.screenshot({ path: `${OUT}/77-hall-${r}.png` }); }
    if (r === 'boss') break;
    await go(); await T.waitForTimeout(1200);
  }
  const info = await T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson); return { lesson: L.id, boss: L.boss.title, sprite: L.boss.sprite }; });
  const bossArt = await H.evaluate(() => { const a = document.querySelector('#rm .art.monster'); return a ? a.dataset.sh : null; });
  console.log('단계', seen.join(' → '), '·', JSON.stringify(info), '· 종합실 보스 그림', bossArt);
  const ok = seen.filter((x) => /^m\d/.test(x)).join(',') === 'm1,m2,m3,m4,m5' && seen.includes('boss') && info.lesson === 'set-08' && bossArt === 'monstersMirrorBoss8';
  console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs.slice(0, 5) : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
