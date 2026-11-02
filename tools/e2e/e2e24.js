// 🧭 첫 수업 튜토리얼: ① 새 학생 캠프 = 차시 던전만 + 기다리기 안내 ② 수업 열림 = 문 반짝 + 입장 안내 → 입장 ③ 수업 끝 뒤 캠프 = 하나씩 소개(5단계)
// ④ 다시 오면 튜토리얼 없음 ⑤ 이미 수업을 해 본(기록 있는) 학생 = 입장 안내 건너뛰고 캠프 안내부터
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e24.js <출력 폴더>
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
  const join = async (p, num) => {
    await p.goto(U + '&role=student'); await p.waitForTimeout(1500); if (await p.isVisible('#splash')) { await p.click('#splash'); await p.waitForTimeout(500); }
    await p.selectOption('#s-cls', '1-3'); await p.waitForTimeout(200); await p.selectOption('#s-num', String(num)); await p.waitForTimeout(300);
    await p.click('#s-new'); await p.fill('#s-p1', '1234'); await p.fill('#s-p2', '1234'); await p.click('#s-make'); await p.waitForTimeout(1200);
    await p.click('#s-go'); await p.waitForTimeout(2000);
  };
  const state = (p) => p.evaluate(() => { const st = document.querySelector('#camp .camp-stage'); const vis = (s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden' : false; };
    return { a: st.classList.contains('tut-a'), b: st.classList.contains('tut-b'), coach: ((document.querySelector('.tut-box p') || {}).textContent || '').slice(0, 40), anvil: vis('#camp-anvil'), bonus: vis('#camp-bonus'), dummy: vis('#camp-dummy'), gateSpot: (document.getElementById('camp-gate') || {}).className }; });
  const S = await mk('S'); await join(S, 1);
  console.log('① 새 학생 캠프:', JSON.stringify(await state(S)));
  await S.screenshot({ path: `${OUT}/1-wait.png` });
  await T.selectOption('#lesson', 'set-02'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(2500);
  await S.bringToFront(); await S.waitForTimeout(1500);
  console.log('② 수업 열림:', JSON.stringify(await state(S)));
  await S.screenshot({ path: `${OUT}/2-open.png` });
  await S.click('#camp-gate'); await S.waitForTimeout(2500);
  console.log('   입장 뒤 화면:', await S.evaluate(() => document.querySelector('.screen.active').id), '· tut:', await S.evaluate(() => localStorage.getItem('citadel-tut-1-3-1')));
  // 수업 끝 → 캠프
  await T.evaluate(async () => { await DS.Net.set('live/1-3/open', false); });
  await S.evaluate(() => DS.Camp.enter({ c: '1-3', n: 1, name: '김민준', hero: 0, fx: 'flame' })); await S.waitForTimeout(2000);
  const steps = [];
  for (let k = 0; k < 6; k++) { const st = await state(S); steps.push(`${st.coach.slice(0, 12)}|보강${st.bonus ? 'O' : 'X'} 허수${st.dummy ? 'O' : 'X'} 모루${st.anvil ? 'O' : 'X'}`); if (k === 0) await S.screenshot({ path: `${OUT}/3-intro-1.png` }); if (k === 2) await S.screenshot({ path: `${OUT}/3-intro-3.png` }); const nx = await S.$('#tut-next'); if (!nx) break; await nx.click(); await S.waitForTimeout(400); }
  console.log('③ 캠프 안내:', steps.join('  →  '));
  console.log('   끝난 뒤:', JSON.stringify(await state(S)), '· 서버 tut:', JSON.stringify(await S.evaluate(() => DS.Net.get('xp/1-3/1/tut'))));
  await S.evaluate(() => DS.Camp.enter({ c: '1-3', n: 1, name: '김민준', hero: 0, fx: 'flame' })); await S.waitForTimeout(1500);
  console.log('④ 다시 옴:', JSON.stringify(await state(S)));
  // ⑤ 기록은 있는데 튜토리얼을 못 본 학생 (어제 수업한 학생)
  const S2 = await mk('S2'); await join(S2, 2);
  await S2.evaluate(async () => { localStorage.removeItem('citadel-tut-1-3-2'); await DS.Net.set('xp/1-3/2/tut', null); await DS.Net.set('records/1-3/2/x', { at: 1 }); });
  await S2.evaluate(() => DS.Camp.enter({ c: '1-3', n: 2, name: '이서연', hero: 1, fx: 'flame' })); await S2.waitForTimeout(2000);
  console.log('⑤ 기록 있는 학생:', JSON.stringify(await state(S2)));
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
