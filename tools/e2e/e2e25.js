// 2026-11-03 수업 뒤 수정 확인: ① 공격 속도(체력 가득 20초 → 닳으면 느려짐) ② ⚔ 마무리 일격(종합상황실 배너 · 폰 표시)
// ③ 마무리 단계가 되면 캠프 잠금 풀림(선생님이 목록에서 끝내기 전에도) ④ 수업 끝 = 개인 결과 ⑤ 용사 겹침 = 아래쪽이 앞
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e25.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(400); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.click('#s-go'); await S.waitForTimeout(1200);
  await S.evaluate(async () => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); });
  await T.selectOption('#lesson', 'set-04'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(2000);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  await S.bringToFront(); await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1200); await S.click('#camp-gate'); await S.waitForTimeout(2500);
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/v16`, { num: 2, nick: '금발', hero: 16, at: Date.now() }); }, code);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  await go(); await T.waitForTimeout(600); await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/active/v16`, true); await DS.Net.set(`rooms/${c}/state/headcount`, 1); }, code);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(1500);
  let kind = ''; for (let k = 0; k < 8; k++) { kind = await T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const st = DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), R); return st ? st.kind : ''; }); if (kind === 'monster') break; await go(); await T.waitForTimeout(600); }
  await H.bringToFront(); await H.waitForTimeout(1500);
  console.log('① 체력 가득 게이지:', await H.$eval('#rh-atk span', (e) => e.textContent));
  const clk = await H.evaluate(async () => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${DS.Hall ? '' : ''}${location.search.match(/code=(\d+)/)[1]}`)); const L = DS.Lessons.get(R.meta.lesson); return DS.Raid.atkClock(L, R, DS.Net.now()).per; });
  console.log('   주기(초):', clk);
  await H.screenshot({ path: `${OUT}/1-hall-fast.png` });
  // 나(S)가 다 맞혀 체력 0 → 마무리 일격
  await S.bringToFront();
  await S.evaluate(async () => { const code = JSON.parse(localStorage.getItem('citadel-student')).code; const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R); const right = (q) => (q.type === 'choice' ? q.answerIndex : q.answer); await DS.Act.submit(code, R, st.id, 0, DS.Raid.itemsFor(L, R, st.id, DS.Net.uid(), 0).map(right)); });
  await S.waitForTimeout(1500);
  console.log('② 폰 마무리 일격:', !!(await S.$('.fin-me')));
  await S.screenshot({ path: `${OUT}/2-phone-finish.png` });
  await H.bringToFront(); await H.waitForSelector('.fin-banner', { timeout: 6000 }).catch(() => null);
  console.log('   종합상황실 배너:', await H.$eval('.fin-banner', (e) => e.textContent).catch(() => 'none'));
  await H.screenshot({ path: `${OUT}/3-hall-finish.png` });
  // 마무리 단계로 → 캠프 잠금 풀림 확인 (차원문은 아직 열림)
  await T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson); await DS.Net.update(`rooms/${code}/state`, { step: L.steps.length }); });
  const C2 = await mk('C2'); await C2.goto(U + '&role=student'); await C2.waitForTimeout(1500);
  await C2.evaluate(() => DS.Camp.enter({ c: '1-3', n: 1, name: '김민준', hero: 0, fx: 'flame' })); await C2.waitForTimeout(1800);
  console.log('③ 마무리 단계 캠프:', await C2.evaluate(() => ['camp-bonus', 'camp-dummy', 'camp-anvil'].map((id) => (document.getElementById(id) || {}).className).join(' | ')), '· live.open:', await C2.evaluate(() => DS.Net.get('live/1-3/open')));
  // 수업 끝 → 개인 결과
  await S.bringToFront(); await T.evaluate(async () => { await DS.Act.endClass(DS.Teacher.code()); }); await S.waitForTimeout(2500);
  console.log('④ 수업 끝 폰:', await S.evaluate(() => { const m = document.querySelector('.rs-modal h2'); return m ? m.textContent : 'none'; }));
  await S.screenshot({ path: `${OUT}/4-phone-result.png` });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
