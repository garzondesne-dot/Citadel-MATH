// ⭕ OX 타임 (2026-11-04 · v0.9.8.1): 수업 중 「OX 지난 차시」 → 쉼터처럼 멈춤 · 탈락 없음 · 5문장 · 반 정답률 · 다시 짚을 문장 → 기록 ox → 수업으로 — node tools/e2e/e2e51.js <출력 폴더>
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
    
  }, code);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 });
  await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(3000);
  const vote = (rk, v) => T.evaluate(async ({ code, rk, v }) => { for (const [u, x] of Object.entries(v)) await DS.Net.set(`rooms/${code}/fv/${rk}/${u}`, x); }, { code, rk, v });
  await H.click('[data-rest]'); await H.waitForTimeout(1200); await H.click('[data-oxq="prev"]'); await H.waitForTimeout(1500); // 2026-11-05: OX 는 쉼터 안에서
  const f0 = await T.evaluate((code) => DS.Net.get(`rooms/${code}/fun`), code);
  log.push(`시작: ${f0.kind} · ${f0.which}`);
  const no = await T.evaluate((q) => DS.FunOX.list[q].no, f0.qi); log.push(`첫 문장 ${no}차시 (수업 4차시 → 지난 차시 3)`);
  await H.screenshot({ path: `${OUT}/1-hall-pick.png` }); await S.screenshot({ path: `${OUT}/2-phone-pick.png` });
  for (let k = 1; k <= 5; k++) {
    await S.waitForSelector('.fa-pick .fa-a', { timeout: 15000 });
    const f = await T.evaluate((code) => DS.Net.get(`rooms/${code}/fun`), code), w = f.ans === 'a' ? 'b' : 'a';
    await S.click(`.fa-pick .fa-${k === 3 ? w : f.ans}`);
    await vote(f.rk, { bot1: f.ans, bot2: k % 2 ? w : f.ans, bot3: w, bot4: f.ans, bot5: f.ans });
    if (k === 1) { await H.waitForFunction(() => /반 정답률/.test((document.querySelector('.fa-foot') || {}).textContent || ''), null, { timeout: 12000 }); await H.waitForTimeout(800); await H.screenshot({ path: `${OUT}/3-hall-show.png` }); await S.screenshot({ path: `${OUT}/4-phone-show.png` }); log.push('공개: ' + (await H.textContent('.fa-foot')).trim()); }
    await H.waitForTimeout(k === 1 ? 4500 : 9500);
  }
  await H.waitForSelector('.fa-win.quiz', { timeout: 15000 }); await H.waitForTimeout(600);
  await H.screenshot({ path: `${OUT}/5-hall-end.png` }); await S.waitForTimeout(800); await S.screenshot({ path: `${OUT}/6-phone-end.png` });
  const endTxt = (await H.textContent('.fa-win.quiz')).replace(/\s+/g, ' ').trim(); log.push('끝: ' + endTxt.slice(0, 120));
  const me = (await S.textContent('.fa-me')).trim(); log.push('학생: ' + me);
  await H.waitForTimeout(1500);
  const oxq = await T.evaluate((code) => DS.Net.get(`rooms/${code}/oxq`), code); const marks = Object.values(oxq || {})[0] || {};
  const myUid = await S.evaluate(() => DS.Net.uid()); log.push('저장된 기록: ' + JSON.stringify(marks.marks && marks.marks[myUid]));
  const restLbl = await T.evaluate(async (code) => ((await DS.Net.get(`rooms/${code}/state/rest`)) || {}).quiz, code);
  await T.evaluate((code) => DS.Act.setRest(code, false), code); await S.waitForTimeout(1500);
  const back = !(await S.$('.fa-wrap'));
  await T.evaluate(async (code) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); }, code); await S.waitForTimeout(4500);
  const rec = await T.evaluate(() => DS.Net.get('records/1-3/1/set-04'));
  log.push(`수업으로: ${back ? '돌아감' : '그대로'} · 기록 ox ${JSON.stringify(rec && rec.ox)}`);
  const ok = f0.kind === 'quiz' && no === 3 && restLbl && /반 정답률/.test(endTxt) && /4 \/ 5 정답/.test(me) && marks.marks && marks.marks[myUid] === 'ooxoo' && back && rec && rec.ox && rec.ox[0] === 4 && rec.ox[1] === 5;
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
