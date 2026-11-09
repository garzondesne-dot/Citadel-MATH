// 🩸 #37 종합실 소레이드 졸개 이름표 · 체력 막대 (2026-11-09) — node tools/e2e/e2e81.js <출력 폴더>
//   20명 · 6차시 문제 4(졸개 3 + 대장) · 정찰 끝 → 졸개1 13명 넘음(5/18) · 졸개2 4명(14/18) · 졸개3 = 완료 2명(16/18) · 1명 🙋 · 캡처
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1600, height: 900 } }); const errs = []; let bad = 0; const log = [];
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const T = await ctx.newPage(); T.on('dialog', (d) => d.accept());
  const U = 'http://localhost:8765/index.html?local';
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  const { code, hallKey: key } = await T.evaluate(() => DS.Act.createRoom('set-06', '1-3'));
  await T.evaluate(async (c) => { const N = DS.Net.now(); for (let n = 1; n <= 20; n++) { await DS.Net.set(`rooms/${c}/players/u${n}`, { num: n, nick: '학생' + n, hero: n % 16, fx: 'flame', at: N }); await DS.Net.set(`rooms/${c}/active/u${n}`, true); await DS.Net.set(`rooms/${c}/online/u${n}`, true); } }, code);
  const H = await ctx.newPage(); H.on('pageerror', (e) => errs.push(e.message)); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(3000);
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-06'); for (let i = 0; i < 12; i++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(L, R); if (s && s.id === 'u4') break; await DS.Act.go(c, R, L, 1); } const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.setSolve(c, R, L, { now: true }); }, code);
  await H.waitForTimeout(2500);
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-06'); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`));
    const right = (q) => (q.type === 'multi' ? q.answer : q.type === 'choice' ? q.answerIndex : q.answer), wrong = (q) => (q.type === 'multi' ? [] : q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : -999);
    const put = async (u, k, s, good) => { const q = DS.Raid.chainItems(L, R, 'u4', u, 0)[s]; await DS.Net.set(`rooms/${c}/chain/u4/${u}/${k}`, { s, p: 0, g: good ? right(q) : wrong(q), at: DS.Net.TS }); };
    for (let n = 1; n <= 13; n++) await put('u' + n, 0, 0, true);
    for (let n = 1; n <= 4; n++) await put('u' + n, 1, 1, true);
    for (let n = 1; n <= 2; n++) { await put('u' + n, 2, 2, true); await put('u' + n, 3, 3, true); }
    for (let k = 0; k < 7; k++) await put('u20', k, 0, false); }, code);
  await H.waitForTimeout(3000);
  const info = await H.evaluate(() => ({ tags: [...document.querySelectorAll('.sc-tag')].map((t) => t.innerText.replace(/\n/g, ' ')), board: (document.querySelector('.h-chain') || {}).innerText, hp: (document.getElementById('rh-txt') || {}).textContent }));
  ok(info.tags.length === 3 && /졸개1 5\/18/.test(info.tags[0]) && /졸개2 14\/18/.test(info.tags[1]) && /졸개3 16\/18/.test(info.tags[2]), `이름표 · 막대 ${JSON.stringify(info.tags)}`);
  ok(/완료/.test(info.board || '') && !/졸개/.test(info.board || ''), `진행판 = 🙋 · 🏁 만 「${(info.board || '').replace(/\n/g, ' ')}」`);
  ok(/대장/.test(info.hp || ''), `대장 체력 막대 글자 「${info.hp}」`);
  await H.screenshot({ path: `${OUT}/81-minion-hp.png` });
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
