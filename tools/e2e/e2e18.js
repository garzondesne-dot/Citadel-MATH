// v0.9.6 💚 힐: ① 기회를 다 쓴 학생(S1)이 친구 힐을 받음 → 알림(준 사람 이름) · 재도전 버튼 · 초록 칸
//             ② 다 맞힌 학생(S1)이 「친구 힐」 → 막힌 친구(가상 f3)에게 감 · 힐러 알림 · 종합상황실엔 힐러만 「응원!」
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e18.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연\n3 박지호'); await T.click('#r-up'); await T.waitForTimeout(800);
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
  // 가상 친구 f2 · f3 (참여 명단에 넣음)
  await T.evaluate(async (c) => { for (const [u, n, nick] of [['f2', 2, '이서연'], ['f3', 3, '박지호']]) { await DS.Net.set(`rooms/${c}/players/${u}`, { num: n, nick, hero: n, at: Date.now() }); } }, code);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  await go(); await T.waitForTimeout(600);
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/active/f2`, true); await DS.Net.set(`rooms/${c}/active/f3`, true); }, code);
  for (let k = 0; k < 3; k++) { await go(); await T.waitForTimeout(700); } // 도입 → 복습 → 개념1 → 문제1
  // 답 쓰기: who = 'me'(S1) 또는 가상 uid, k = 맞힐 소문제 수 (-1 = 전부)
  const subAs = (page, who, a, k) => page.evaluate(async ([who, a, k]) => {
    const code = (DS.Teacher && DS.Teacher.code()) || JSON.parse(localStorage.getItem('citadel-student')).code;
    const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R);
    const u = who === 'me' ? DS.Net.uid() : who; const right = (q) => (q.type === 'choice' ? q.answerIndex : q.answer);
    const ans = DS.Raid.itemsFor(L, R, st.id, u, a).map((q, i) => (k < 0 || i < k ? right(q) : (q.type === 'multi' ? [] : -1)));
    if (who === 'me') await DS.Act.submit(code, R, st.id, a, ans); else await DS.Net.set(`rooms/${code}/subs/${st.id}/${u}/${a}`, DS.Net.pack(ans));
    return st.id;
  }, [who, a, k]);
  // ① S1 이 4번 모두 틀림 → f2 가 다 맞히고 S1 에게 힐
  for (let a = 0; a < 4; a++) { console.log('S1 try', a, await subAs(S1, 'me', a, 0)); await S1.waitForTimeout(400); }
  await S1.waitForTimeout(1500);
  console.log('S1 retry before heal:', !!(await S1.$('#st-retry')));
  const s1uid = await S1.evaluate(() => DS.Net.uid());
  await subAs(T, 'f2', 0, -1);
  await T.evaluate(async ([c, to]) => { await DS.Net.set(`rooms/${c}/heals/m1/f2/0`, to); }, [code, s1uid]);
  const toast1 = await S1.waitForFunction(() => (document.querySelector('.heal-pop') || {}).textContent || '', null, { timeout: 5000 }).then((h) => h.jsonValue()).catch(() => '');
  console.log('S1 toast:', toast1);
  console.log('S1 retry after heal:', !!(await S1.waitForSelector('#st-retry', { timeout: 4000 }).catch(() => null)), 'green pip:', !!(await S1.$('.enc-tries i.heal.on')));
  await S1.screenshot({ path: `${OUT}/1-student-healed.png`, fullPage: true });
  console.log('hall heal tag (f2):', await H.waitForSelector('.heal-tag', { timeout: 4000 }).then((e) => e.textContent()).catch(() => 'none'));
  await H.screenshot({ path: `${OUT}/2-hall-heal.png` });
  // ② 다음 몬스터: S1 다 맞힘 · f3 는 4번 다 틀림 → S1 이 「친구 힐」
  for (let k = 0; k < 6; k++) { const kind = await T.evaluate(async () => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${DS.Teacher.code()}`)); const L = DS.Lessons.get(R.meta.lesson); const st = DS.Raid.stepOf(L, R); return st && st.kind + ':' + st.id; }); if (kind && kind.startsWith('monster') && !kind.endsWith(':m1')) break; await go(); await T.waitForTimeout(700); }
  const mid = await subAs(S1, 'me', 0, -1); console.log('monster 2:', mid);
  for (let a = 0; a < 4; a++) await subAs(T, 'f3', a, 0);
  await S1.waitForTimeout(6500);
  await S1.screenshot({ path: `${OUT}/3-student-heal-pick.png`, fullPage: true });
  console.log('buttons:', await S1.evaluate(() => [...document.querySelectorAll('.heal-pick button')].map((x) => x.textContent)));
  await S1.click('#st-heal'); await S1.waitForTimeout(400);
  console.log('healer pop:', await S1.evaluate(() => (document.querySelector('.heal-pop') || {}).textContent || 'none'));
  console.log('heals data:', await T.evaluate(async ([c, m]) => JSON.stringify(await DS.Net.get(`rooms/${c}/heals/${m}`)), [code, mid]));
  console.log('hall heal tag (S1):', await H.waitForSelector('.heal-tag', { timeout: 4000 }).then((e) => e.textContent()).catch(() => 'none'));
  await H.screenshot({ path: `${OUT}/4-hall-heal2.png` });
  console.log('ERRORS', errs.length, errs.slice(0, 5)); await b.close();
})();
