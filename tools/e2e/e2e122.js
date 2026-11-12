// ⏸ #117 집중 모드 = 모든 시간 멈춤 (2026-11-12): 🧪 테스트 모드 360px · 몬스터 단계에서 👀 집중 12초 → 가상 친구 공격 0 · 남은 정찰 · 수업 시간 그대로 · 끄면 이어감 — node tools/e2e/e2e122.js <출력 폴더>
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
  const a = await room(); ok(a.focus && a.fzAt, '집중 켜짐 · 수업 시계 멈춤 표시(fzAt)');
  await p.screenshot({ path: `${OUT}/122-focus.png` });
  await p.waitForTimeout(12000);
  const c = await room();
  ok(c.subs === a.subs && c.hp === a.hp, `집중 12초 동안 가상 친구 공격 0 (낸 답 ${a.subs} → ${c.subs} · 체력 ${a.hp} → ${c.hp})`);
  ok(Math.abs(c.tl - a.tl) < 1500, `수업 남은 시간 그대로 ${Math.round(a.tl / 1000)} → ${Math.round(c.tl / 1000)}초`);
  ok(Math.abs(c.sl - a.sl) < 1500, `정찰 남은 시간 그대로 ${Math.round(a.sl / 1000)} → ${Math.round(c.sl / 1000)}초`);
  const tbTxt = await p.evaluate(() => [...document.querySelectorAll('.tb-left, .sl-left')].map((e) => e.textContent).join(',')); log.push('  (dbg .tb ' + await p.evaluate(() => document.querySelectorAll('.tb').length + ' ' + document.querySelectorAll('[data-dl]').length) + ')');
  await p.waitForTimeout(2500); const tbTxt2 = await p.evaluate(() => [...document.querySelectorAll('.tb-left, .sl-left')].map((e) => e.textContent).join(','));
  ok(tbTxt && tbTxt === tbTxt2, `화면 남은 시간 글자도 멈춤 (${tbTxt} / ${tbTxt2})`);
  { // ⏳ 시간 막대(리모컨 · 종합실 · 학생 10분 전) 초 세기도 멈춤: 같은 방으로 막대를 그려 2.5초 둠
    await p.evaluate(async () => { const db = JSON.parse(localStorage.getItem('citadel-test-db')); const code = Object.keys(db.rooms).pop(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)), L = DS.Lessons.get(R.meta.lesson); const d = document.createElement('div'); d.id = 'tb-probe'; d.innerHTML = DS.Control.tbarHtml(L, R, {}); document.body.appendChild(d); });
    await p.waitForTimeout(1200); const x1 = await p.textContent('#tb-probe .tb-left'); await p.waitForTimeout(2500); const x2 = await p.textContent('#tb-probe .tb-left');
    ok(x1 && x1 === x2, `⏳ 시간 막대 남은 시간 멈춤 (${x1} / ${x2})`); await p.evaluate(() => document.getElementById('tb-probe').remove()); }
  await p.click('#tb-focus'); await p.waitForTimeout(25000);
  const d = await room();
  ok(!d.focus && !d.fzAt, '집중 꺼짐');
  ok(d.subs > c.subs, `끄면 가상 친구가 이어서 공격 (${c.subs} → ${d.subs})`);
  ok(c.tl - d.tl > 20000 && c.tl - d.tl < 30000, `수업 시간 다시 흐름 (${Math.round((c.tl - d.tl) / 1000)}초)`);
  await p.screenshot({ path: `${OUT}/122-after.png` });
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
