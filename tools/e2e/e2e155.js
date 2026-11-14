// 📚 12차시 소레이드 한 판 (2026-11-14): 학생 폰에서 m3(교과서 92쪽 문제 2 · 5단계) 를 끝까지 · 나의 풀이 · 💡 근거 · 대장 처치
//   PORT=8766 node tools/e2e/e2e155.js <출력 폴더>
const { chromium, devices } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone SE'], viewport: { width: 375, height: 667 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.tap('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.tap('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.tap('#r-up'); await T.waitForTimeout(800);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.tap('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.tap('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.tap('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.tap('#s-go'); await S.waitForTimeout(2000);
  const { code } = await T.evaluate(() => DS.Act.createRoom('set-12', '1-3'));
  await S.evaluate(async (c) => { await DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }); }, code).catch(() => {}); await S.waitForTimeout(1500);
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/active/friend2`, true); await DS.Net.set(`rooms/${c}/players/friend2`, { num: 2, nick: '이서연', hero: 1 }); }, code);
  const goStep = (id) => T.evaluate(async ([c, id]) => { const L = DS.Lessons.get('set-12'); for (let i = 0; i < 14; i++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(L, R); if (s && s.id === id) break; await DS.Act.go(c, R, L, 1); } const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.setSolve(c, R, L, { now: true }); }, [code, id]);
  const clr = () => S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat, .rv96, .nt-pop').forEach((e) => e.remove()));
  const rec = (mid) => S.evaluate(async ([c, mid]) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const r = DS.Raid.record(DS.Lessons.get('set-12'), R, mid, DS.Net.uid()); return { stage: r.stage, done: r.done, n: (r.items || []).length, says: r.says || [], q: r.items && r.items[r.stage] ? { type: r.items[r.stage].type, a: r.items[r.stage].type === 'multi' ? r.items[r.stage].answer : r.items[r.stage].answerIndex, opts: r.items[r.stage].options || r.items[r.stage].choices } : null }; }, [code, mid]);
  // 화면에서 정답 칸을 눌러 공격 (칩 = 여러 개)
  const play = async (mid, shotAt) => { for (let k = 0; k < 8; k++) { const r = await rec(mid); if (r.done) return r; await clr();
      if (k === shotAt) await S.screenshot({ path: `${OUT}/155-${mid}-${k}.png` });
      const want = Array.isArray(r.q.a) ? r.q.a : [r.q.a];
      const n = await S.evaluate((want) => { const bs = [...document.querySelectorAll('#st-body [data-pick]')]; let c = 0; bs.forEach((b) => { const kk = Number(b.dataset.pick.split('|')[1]); if (want.includes(kk)) { b.click(); c++; } }); return c; }, want);
      await S.waitForTimeout(300); const go = await S.$('#cr-go'); if (!go || n !== want.length) { ok(false, `${mid} 단계 ${k}: 칸 ${n}/${want.length} · 공격 단추 ${!!go}`); return r; }
      await S.evaluate(() => document.querySelector('#cr-go').click()); await S.waitForTimeout(3200); }
    return rec(mid); };
  await goStep('m3'); await S.waitForTimeout(3000); await clr();
  let r = await play('m3', 2);
  ok(r.done && r.n === 5, `m3 소레이드 5단계 끝까지 · 대장 처치 (${r.stage}/${r.n})`);
  ok(r.says.some((s) => /√2 = a − 1/.test(s)) && r.says.some((s) => /그러므로 1 \+ √2 는 유리수가 아니다\./.test(s)) && r.says.some((s) => /^∵ 유리수끼리의 합 · 차는 유리수이다\./.test(s)), '나의 풀이 = √2 = a − 1 · 💡 근거 · 결론 문장');
  await S.screenshot({ path: `${OUT}/155-m3-done.png` });
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
