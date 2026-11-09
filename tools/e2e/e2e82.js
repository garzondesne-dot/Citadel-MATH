// 📸 #38 수업 소레이드: 「🔥 한 판 더」 중 · 뒤에도 ✍ 📸 단추가 보이는지 (2026-11-09) — node tools/e2e/e2e82.js <출력 폴더>
//   + 🔥 #39 한 판 더 3판 (남은 횟수 · 3판 뒤 막힘)
//   사진 채점 켬(gcfg/photo · 기준표 u4) → 학생 1명 대장까지 처치 → 📸 단추 → 한 판 더 → 연습 중 📸 단추 → 누르면 ✍ 쓰기 화면 → ✕ → 연습 판
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.setViewportSize({ width: 1400, height: 900 }); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.evaluate(async () => { await DS.Net.set('gcfg/photo', { on: true, url: 'https://example.invalid/x' }); await DS.Net.set('photo_rubric/set-06/u4', { on: true }); });
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  const { code } = await T.evaluate(() => DS.Act.createRoom('set-06', '1-3'));
  await S.evaluate(async (c) => { await DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }); }, code).catch(() => {}); await S.waitForTimeout(1500);
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-06'); for (let i = 0; i < 12; i++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(L, R); if (s && s.id === 'u4') break; await DS.Act.go(c, R, L, 1); } const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.setSolve(c, R, L, { now: true }); }, code);
  await S.waitForTimeout(2500);
  // 학생 본인이 첫 판을 모두 맞힘 (학습지 숫자)
  await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'), me = DS.Net.uid();
    const right = (q) => (q.type === 'multi' ? q.answer : q.type === 'choice' ? q.answerIndex : q.answer); const it = DS.Raid.chainItems(L, R, 'u4', me, 0);
    for (let s = 0; s < it.length; s++) await DS.Net.set(`rooms/${c}/chain/u4/${me}/${s}`, { s, p: 0, g: right(it[s]), at: DS.Net.TS }); }, code);
  await S.waitForTimeout(2500);
  const has = () => S.evaluate(() => ({ w: !!document.querySelector('#cr-write'), msg: (document.querySelector('#st-body .ch-wrap') || {}).innerText.slice(0, 80).split(String.fromCharCode(10)).join(' ') }));
  await S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove()));
  let h = await has(); ok(h.w, `대장 처치 뒤 📸 단추 (${h.msg})`);
  await S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove())); await S.click('#cr-prac'); await S.waitForTimeout(1500); h = await has(); ok(h.w, `🔥 한 판 더 진행 중에도 📸 단추`);
  await S.screenshot({ path: `${OUT}/82-prac-photo.png` });
  await S.click('#cr-write'); await S.waitForTimeout(1200); ok(await S.evaluate(() => !!document.querySelector('#wr-snap')), '연습 중에 눌러도 ✍ 쓰기 화면(📸 찍어서 채점)');
  await S.click('#wr-x'); await S.waitForTimeout(1200); ok(await S.evaluate(() => /연습/.test((document.querySelector('#st-body') || {}).innerText || '')), '✕ 닫으면 보던 연습 판');
  // 🔥 #39 한 판 더 3판: 연습 판을 끝낼 때마다 「🔥 한 판 더 (n/3 남음)」 → 3판 시작 뒤 「연습 3번 끝!」
  const pr = () => S.evaluate(() => ({ btn: (document.querySelector('#cr-prac') || {}).textContent || '', end: (document.querySelector('.cr-pend') || {}).textContent || '' }));
  const finishPass = (p) => S.evaluate(async ([c, p]) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'), me = DS.Net.uid();
    const right = (q) => (q.type === 'multi' ? q.answer : q.type === 'choice' ? q.answerIndex : q.answer), it = DS.Raid.chainItems(L, R, 'u4', me, p);
    let k = Object.keys((((R.chain || {}).u4 || {})[me]) || {}).length;
    for (let s2 = 0; s2 < it.length; s2++) { await DS.Net.set(`rooms/${c}/chain/u4/${me}/${k++}`, { s: s2, p, g: right(it[s2]), at: DS.Net.TS }); if (it[s2].why) await DS.Net.set(`rooms/${c}/chain/u4/${me}/${k++}`, { s: s2, p, g: it[s2].why.answer, w: 1, at: DS.Net.TS }); } }, [code, p]);
  // 🔥 #40 연습 판 오답 → 연습 기회 3.5/4 (첫 판 기회와 따로)
  await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), me = DS.Net.uid(), k = Object.keys((((R.chain || {}).u4 || {})[me]) || {}).length; await DS.Net.set(`rooms/${c}/chain/u4/${me}/${k}`, { s: 0, p: 1, g: -999, at: DS.Net.TS }); }, code);
  await S.waitForTimeout(1500); ok(await S.evaluate(() => /3\.5/.test((document.querySelector('.dt-n') || {}).textContent || '')), `연습 오답 → 아래 기회 「${await S.evaluate(() => (document.querySelector('.dt-n') || {}).textContent)}」`);
  await finishPass(1); await S.waitForTimeout(1500);
  let P = await pr(); ok(/2\/3 남음/.test(P.btn), `연습 1판 끝 → 단추 「${P.btn}」`);
  const shut = () => S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove()));
  await shut(); await S.click('#cr-prac'); await S.waitForTimeout(900); await finishPass(2); await S.waitForTimeout(1500);
  P = await pr(); ok(/1\/3 남음/.test(P.btn), `연습 2판 끝 → 「${P.btn}」`);
  await shut(); await S.click('#cr-prac'); await S.waitForTimeout(900); await finishPass(3); await S.waitForTimeout(1500);
  P = await pr(); ok(!P.btn && /연습 3번 끝/.test(P.end), `3판 끝 → 「${P.end}」 · 단추 없음`);
  const used = await S.evaluate(async (c) => DS.Net.get(`rooms/${c}/players/${DS.Net.uid()}/pr/u4`), code);
  ok(Number(used) === 3, `기록 players/나/pr/u4 = ${used}`);
  await S.screenshot({ path: `${OUT}/82-prac3.png` });
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
