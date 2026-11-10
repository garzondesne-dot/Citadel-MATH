// 🐞 2026-11-10 「수업 내내 선택하면 스크롤이 말려 올라감」: 폰 흉내(아이폰 · 터치 tap)로 소레이드 첫 판 · 일반 몬스터 · 친구가 동시에 낼 때 — node tools/e2e/e2e90.js <출력 폴더>
const { chromium, devices } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 13'] }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.tap('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.tap('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.tap('#r-up'); await T.waitForTimeout(800);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.tap('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.tap('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.tap('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.tap('#s-go'); await S.waitForTimeout(2000);
  const { code } = await T.evaluate(() => DS.Act.createRoom('set-06', '1-3'));
  await S.evaluate(async (c) => { await DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }); }, code).catch(() => {}); await S.waitForTimeout(1500);
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/active/friend2`, true); await DS.Net.set(`rooms/${c}/players/friend2`, { num: 2, nick: '이서연', hero: 1 }); }, code);
  const goStep = (id) => T.evaluate(async ([c, id]) => { const L = DS.Lessons.get('set-06'); for (let i = 0; i < 14; i++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(L, R); if (s && s.id === id) break; await DS.Act.go(c, R, L, 1); } const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.setSolve(c, R, L, { now: true }); }, [code, id]);
  const clr = () => S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove()));
  const pos = () => S.evaluate(() => ({ p: Math.round((document.querySelector('#st-body .paper') || {}).scrollTop || 0), w: Math.round(scrollY) }));
  async function trial(name, other) {
    await clr();
    const n = await S.evaluate(() => { const bs = [...document.querySelectorAll('#st-body [data-pick]:not(.on)')]; const t = bs[bs.length - 1]; if (!t) return 0; t.id = 'pk-last'; t.scrollIntoView({ block: 'center' }); return bs.length; });
    if (!n) { log.push(`· ${name}: 고르기 칸 없는 단계(숫자 돌리기) — 건너뜀`); return; }
    await S.waitForTimeout(400); const a = await pos();
    await S.tap('#pk-last'); await S.waitForTimeout(600);
    if (other) { await other(); await S.waitForTimeout(1500); }
    const z = await pos(), on = await S.evaluate(() => document.querySelectorAll('#st-body [data-pick].on').length);
    ok(Math.abs(z.p - a.p) < 6 && Math.abs(z.w - a.w) < 6 && on > 0, `${name}: ${JSON.stringify(a)} → ${JSON.stringify(z)} (고름 ${on})`);
  }
  for (const id of ['m1', 'u4', 'u5', 'u6', 'u7']) {
    await goStep(id); await S.waitForTimeout(3000);
    await trial(`${id} 고르기`);
    await trial(`${id} 고르기 + 친구가 동시에 냄`, () => T.evaluate(async ([c, id]) => { const L = DS.Lessons.get('set-06'), R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); if (DS.Raid.isChain(L, R, id)) await DS.Net.set(`rooms/${c}/chain/${id}/friend2/0`, { s: 0, p: 0, g: -1, at: DS.Net.TS }); else { const it = DS.Raid.itemsFor(L, R, id, 'friend2', 0), g = it.map((q) => (q.type === 'multi' ? q.answer : q.type === 'choice' || !q.type ? q.answerIndex : q.type === 'blanks' ? q.items.map((x) => x.answer) : q.type === 'text' ? q.answers[0] : q.answer)); await DS.Net.set(`rooms/${c}/subs/${id}/friend2/0`, DS.Net.pack(g)); } await DS.Net.set(`rooms/${c}/players/friend2/x`, Date.now()); }, [code, id]));
    await S.screenshot({ path: `${OUT}/90-${id}.png` });
  }
  // 👑 형성평가 = 문제 창(#quiz) · 친구가 동시에 내면 화면을 다시 그림
  await goStep('boss'); await S.waitForTimeout(3000); await clr();
  await S.evaluate(() => document.querySelector('.bitem').click()); await S.waitForTimeout(800);
  const bq = () => S.evaluate(() => { const q = document.querySelector('#quiz'), bx = document.querySelector('#quiz .quiz-box'); return { w: Math.round(scrollY), q: Math.round(q.scrollTop), b: Math.round(bx ? bx.scrollTop : 0), t: Math.round(document.querySelector('#quiz-choices').getBoundingClientRect().top) }; });
  const ch = await S.evaluate(() => { const bs = [...document.querySelectorAll('#quiz-choices .choice')]; const t = bs[bs.length - 1]; if (!t) return 0; t.id = 'bq-last'; t.scrollIntoView({ block: 'center' }); return bs.length; });
  await S.waitForTimeout(400); const b0 = await bq();
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/bossTry/friend2/0/0`, DS.Net.pack([0])); await DS.Net.set(`rooms/${c}/players/friend2/x`, Date.now()); }, code); await S.waitForTimeout(1500);
  const b1 = await bq(); ok(ch > 0 && JSON.stringify(b0) === JSON.stringify(b1), `👑 형성평가 문제 창: 친구가 내도 그대로 ${JSON.stringify(b0)} → ${JSON.stringify(b1)}`);
  if (ch) { const multi = await S.evaluate(() => !!document.querySelector('#quiz-choices .q-submit')); if (multi) { await S.tap('#bq-last'); await S.waitForTimeout(600); const b2 = await bq(); ok(JSON.stringify(b1) === JSON.stringify(b2), `👑 고르기 (여러 개 고르는 문제) ${JSON.stringify(b2)}`); } }
  await S.screenshot({ path: `${OUT}/90-boss.png` });
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
