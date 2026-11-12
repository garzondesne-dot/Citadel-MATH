// ⏸ #117 집중 모드 = 모든 시간 멈춤 (2026-11-12): 🧪 테스트 모드 360px · 몬스터 단계에서 👀 집중 12초 → 가상 친구 공격 0 · 남은 정찰 그대로 · 수업 남은 시간은 흐름(선생님 바로잡음) · 끄면 이어감 — node tools/e2e/e2e122.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 360, height: 780 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  await p.selectOption('#p-lesson', 'set-10'); await p.click('#x-go'); await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelectorAll('.nt-pop').forEach((e) => e.remove()));
  await p.click('#camp-gate'); await p.waitForTimeout(3500);
  const room = () => p.evaluate(async () => { const db = JSON.parse(localStorage.getItem('citadel-test-db')); const code = Object.keys(db.rooms).pop(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R), now = DS.Net.now();
    const subs = Object.values((R.subs || {}).m1 || {}).reduce((a, x) => a + Object.keys(x || {}).length, 0), lk = DS.Raid.solveLock(L, R, now);
    return { id: st && st.id, subs, hp: st && st.kind === 'monster' ? DS.Raid.monsterHp(L, R, st.id).left : null, tl: DS.Raid.timeLeft(R, now), sl: lk && lk.on ? lk.left : 0, focus: !!R.state.focus, fzAt: R.state.fzAt }; });
  for (let i = 0; i < 6; i++) { if ((await room()).id === 'm1') break; await p.click('#tb-next'); await p.waitForTimeout(900); }
  ok((await room()).id === 'm1', '문제 1 단계');
  await p.evaluate(async () => { const db = JSON.parse(localStorage.getItem('citadel-test-db')); const code = Object.keys(db.rooms).pop(); await DS.Net.set(`rooms/${code}/state/deadline`, DS.Net.now() + 50 * 60e3); }); await p.waitForTimeout(600); // 테스트 모드는 시간 제한이 없어 시험용으로 50분 마감을 넣음
  // 정찰(5초) 중에 바로 집중 → 정찰 남은 시간 멈춤
  await p.click('#tb-focus'); await p.waitForTimeout(1500);
  const a = await room(); ok(a.focus && a.fzAt, '집중 켜짐 · 멈춤 기준(fzAt) 적힘');
  await p.screenshot({ path: `${OUT}/122-focus.png` });
  await p.waitForTimeout(12000);
  const c = await room();
  ok(c.subs === a.subs && c.hp === a.hp, `집중 12초 동안 가상 친구 공격 0 (낸 답 ${a.subs} → ${c.subs} · 체력 ${a.hp} → ${c.hp})`);
  ok(a.tl - c.tl > 10000, `수업 남은 시간은 그대로 흐름 ${Math.round(a.tl / 1000)} → ${Math.round(c.tl / 1000)}초`);
  ok(Math.abs(c.sl - a.sl) < 1500, `정찰 남은 시간 그대로 ${Math.round(a.sl / 1000)} → ${Math.round(c.sl / 1000)}초`);
  const tbTxt = await p.evaluate(() => [...document.querySelectorAll('.tb-left, .sl-left')].map((e) => e.textContent).join(','));
  await p.waitForTimeout(2500); const tbTxt2 = await p.evaluate(() => [...document.querySelectorAll('.tb-left, .sl-left')].map((e) => e.textContent).join(','));
  ok(tbTxt && tbTxt === tbTxt2, `화면 남은 시간 글자도 멈춤 (${tbTxt} / ${tbTxt2})`);
  await p.click('#tb-focus'); await p.waitForTimeout(25000);
  const d = await room();
  ok(!d.focus && !d.fzAt, '집중 꺼짐');
  ok(d.subs > c.subs, `끄면 가상 친구가 이어서 공격 (${c.subs} → ${d.subs})`);
  ok(c.tl - d.tl > 20000 && c.tl - d.tl < 30000, `수업 시간 계속 흐름 (${Math.round((c.tl - d.tl) / 1000)}초)`);
  await p.screenshot({ path: `${OUT}/122-after.png` });
  { // 🏕 쉼터 놀이 시계: 집중 동안 to 를 멈췄다가 끄면 멈춘 만큼 뒤로 (DS.Fun.hold)
    const r = await p.evaluate(async () => { const db = JSON.parse(localStorage.getItem('citadel-test-db')); const code = Object.keys(db.rooms).pop(), P = (x) => `rooms/${code}/${x}`, N = DS.Net, t0 = N.now();
      await N.set(P('fun_probe'), null); const f0 = { kind: 'bal', phase: 'pick', to: t0 + 10000, g: 1 };
      await N.set(P('state/fzAt'), t0); const h1 = await DS.Fun.hold(code, f0, t0); const frz = await N.get(P('fun/frz'));
      await new Promise((ok) => setTimeout(ok, 3000)); await N.set(P('state/fzAt'), null);
      const f1 = { ...f0, frz }; const h2 = await DS.Fun.hold(code, f1, N.now()); const to = await N.get(P('fun/to')), frz2 = await N.get(P('fun/frz'));
      await N.set(P('fun'), null); return { h1, h2, frz, shift: to - f0.to, frz2 }; });
    ok(r.h1 && r.frz != null && r.h2 && r.shift >= 2900 && r.shift < 4000 && r.frz2 == null, `🏕 놀이 시계 = 집중 3초 동안 멈춤 → 끄면 마감이 ${r.shift}ms 뒤로`); }
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
