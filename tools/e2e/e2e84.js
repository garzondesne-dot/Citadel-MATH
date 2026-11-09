// ⚔ #50 소레이드 아래 칸 (2026-11-10): ✍ 서술형 언제나 · 도중 통과 = 남은 단계 처치 · 대장 뒤 🔥 한 판 더(1.5초 잠금) · ⛓ 묶기 — node tools/e2e/e2e84.js <출력 폴더>
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
  await S.waitForTimeout(2500); const clr = () => S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove()));
  await clr(); const dk = () => S.evaluate(() => ({ go: !!document.querySelector('.cr-dock #cr-go'), wr: !!document.querySelector('.cr-dock #cr-write'), prac: (document.querySelector('.cr-dock #cr-prac') || {}).disabled, bind: !!document.querySelector('#st-bind'), heal: !!document.querySelector('#st-heal'), lis: document.querySelectorAll('.cr-story li').length }));
  let d = await dk(); ok(d.go && d.wr, `시작 전 아래 칸 = ⚔ 공격 + ✍ 서술형 (${JSON.stringify(d)})`);
  await S.screenshot({ path: `${OUT}/84-start.png` });
  await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'), me = DS.Net.uid(), it = DS.Raid.chainItems(L, R, 'u4', me, 0); await DS.Net.set(`rooms/${c}/chain/u4/${me}/0`, { s: 0, p: 0, g: DS.Raid.chainAns(it[0]), at: DS.Net.TS }); }, code);
  await S.waitForTimeout(2000); await clr(); d = await dk(); ok(d.go && d.wr, `졸개 ① 뒤에도 ✍ 서술형 그대로 (${JSON.stringify(d)})`);
  await S.evaluate(() => { DS.Photo.grade = async () => ({ status: 'pass', id: 'x1', score: 3, total: 3, scores: [3], steps: {} }); });
  await S.click("#cr-write"); await S.waitForTimeout(800); await S.click("#wr-snap"); await S.waitForTimeout(3500); await clr();
  const rec = await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), r = DS.Raid.record(DS.Lessons.get('set-06'), R, 'u4', DS.Net.uid()); return { done: r.done, byPh: r.byPh, perfect: r.perfect, tok: r.tokLeft, n: r.n }; }, code);
  ok(rec.done && rec.byPh && !rec.perfect && rec.tok === 4, `도중 서술형 통과 → 남은 단계 처치 · 퍼펙트 아님 · 묶기/힐 ${rec.tok}번 (${JSON.stringify(rec)})`);
  d = await dk(); ok(d.prac !== undefined && d.bind && d.heal, `대장 뒤: 🔥 한 판 더 · ⛓ 💚 단추 (✍ = 🌟 통과 표시) (${JSON.stringify(d)})`);
  await S.waitForTimeout(1800); d = await dk(); ok(d.prac === false, '1.5초 뒤 🔥 한 판 더 누를 수 있음');
  const pr0 = await S.evaluate(async (c) => DS.Net.get(`rooms/${c}/players/${DS.Net.uid()}/pr/u4`), code); ok(!pr0, `저절로 한 판 더 시작 안 함 (pr = ${pr0})`);
  await S.screenshot({ path: `${OUT}/84-after.png` });
  await S.evaluate(() => document.querySelector('#st-bind').scrollIntoView({ block: 'center' })); await S.click('#st-bind'); await S.waitForTimeout(1500); await clr();
  const t2 = await S.evaluate(async (c) => DS.Raid.record(DS.Lessons.get('set-06'), DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), 'u4', DS.Net.uid()).tokLeft, code); ok(t2 === 3, `⛓ 묶기 1번 → 남은 ${t2}`);
  await S.click('#cr-prac'); await S.waitForTimeout(1500); await clr(); d = await dk(); ok(d.go && !d.bind, `🔥 한 판 더 → 연습 공격 (${JSON.stringify(d)})`);
  await S.screenshot({ path: `${OUT}/84-prac.png` });
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
