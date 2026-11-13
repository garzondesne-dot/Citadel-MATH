// ❤ 2026-11-13 밤 (메타인지 6 · 묶음 A): 일반 몬스터 = 한 번 공격에 틀리면 ❤ −1 · ❤ 0 = 🙋 잠김 → 리모컨 「✔ 풀어주기」 = ❤ +1 → 다 맞히면 ❤ +1 · 소레이드 ❤ 0 도 같은 단추
//   PORT=8766 node tools/e2e/e2e146.js <출력 폴더>
const { chromium, devices } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const VW = (process.env.VW || '375x667').split('x').map(Number); const ctx = await b.newContext({ ...devices['iPhone SE'], viewport: { width: VW[0], height: VW[1] } }); const errs = [], log = []; let bad = 0;
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
  const clr = () => S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat, .rv96').forEach((e) => e.remove()));
  const rec = (mid) => S.evaluate(async ([c, mid]) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const r = DS.Raid.record(DS.Lessons.get('set-06'), R, mid, DS.Net.uid()); return { left: r.left, locked: r.locked, perfect: r.perfect, n: r.tries ? r.tries.length : 0, done: r.done }; }, [code, mid]);
  const sub = (mid, good) => S.evaluate(async ([c, mid, good]) => { const R0 = await DS.Net.get(`rooms/${c}`), R = DS.Act.unpackRoom(R0), L = DS.Lessons.get('set-06'), me = DS.Net.uid(), a = DS.Raid.record(L, R, mid, me).nextAttempt; const items = DS.Raid.itemsFor(L, R, mid, me, a); const g = items.map((q, i) => (good || i > 0 ? DS.Raid.chainAns(q) : (q.type === 'number' ? Number(q.answer) + 1 : q.type === 'choice' || !q.type ? (q.answerIndex + 1) % (q.choices || [0, 0]).length : 'x'))); await DS.Act.submit(c, R0, mid, a, g); }, [code, mid, good]);
  await goStep('m2'); await S.waitForTimeout(2500); await clr();
  await T.evaluate((c) => DS.Teacher.open(c, ''), code); await T.waitForTimeout(1200);
  await sub('m2', false); let brk = false; for (let k = 0; k < 30 && !brk; k++) { await S.waitForTimeout(120); brk = await S.evaluate(() => !!document.querySelector('#st-body .dk-slot.hp .ch.brk')); }
  ok(brk, '💔 틀리면 노란 단추 안 하트 하나가 쪼개짐 (글자 안내 없음)'); await S.screenshot({ path: `${OUT}/146-break.png` });
  await S.waitForTimeout(1500); { const f = await S.evaluate(() => ({ form: !!document.querySelector('#st-go'), redo: document.querySelectorAll('#st-body .item.redo').length, last: !!document.querySelector('#st-body .last-ans'), notes: document.querySelectorAll('#st-body .paper-note, #st-body .st-res').length })); ok(f.form && f.redo >= 1 && f.last && f.notes === 0, `그다음 같은 문제 = ✘ 칸 빨간 테두리 · 지난 답 줄 긋기 · 안내 줄 · 배너 없음 (${JSON.stringify(f)})`); await S.screenshot({ path: `${OUT}/146-redo.png` }); }
  for (let i = 0; i < 3; i++) { await sub('m2', false); await S.waitForTimeout(400); }
  let r = await rec('m2'); ok(r.left === 0 && r.locked && r.n === 4, `틀린 공격 4번 = ❤ 0 · 잠김 (${JSON.stringify(r)})`);
  const blocked = await S.evaluate(async (c) => { try { const R0 = await DS.Net.get(`rooms/${c}`); await DS.Act.submit(c, R0, 'm2', 4, [0, 0, 0]); return false; } catch (e) { return /선생님/.test(e.message); } }, code);
  ok(blocked, '잠김 = 다시 못 냄 (「선생님 확인을 기다려요」)');
  await S.waitForTimeout(1500); await clr();
  const sv = await S.evaluate(() => ({ lock: !!document.querySelector('#st-body .cr-lock'), txt: (document.querySelector('#st-body .cr-lock') || {}).textContent || '', dock: (document.querySelector('#st-body .dock-wait, #st-body .dk-wait') || {}).textContent || '' }));
  ok(sv.lock && /❤ 0/.test(sv.txt) && /확인 기다림/.test(sv.dock), `학생 폰 = 🙋 선생님 확인 · ❤ 0 (${sv.txt.slice(0, 40)})`);
  await S.screenshot({ path: `${OUT}/146-lock.png` });
  await T.waitForTimeout(1500);
  const tb = await T.evaluate(() => ({ row: !!document.querySelector('[data-crok]'), txt: (document.querySelector('.cr-ctl') || {}).textContent || '' }));
  ok(tb.row && /❤ 0/.test(tb.txt), `리모컨 = 🙋 ❤ 0 확인 필요 · ✔ 풀어주기 (${tb.txt.slice(0, 40)})`);
  await T.screenshot({ path: `${OUT}/146-remote.png` });
  await T.evaluate(() => document.querySelector('[data-crok]').click()); await T.waitForTimeout(1500);
  r = await rec('m2'); ok(r.left === 1 && !r.locked, `풀어주기 → ❤ 1 (${r.left})`);
  await sub('m2', true); await S.waitForTimeout(800); r = await rec('m2'); ok(r.perfect && r.left === 2, `그렇게 다 맞힘 = ❤ +1 → 2 (${r.left})`);
  // 소레이드 (m4 = u4?) — set-06 소레이드 몬스터
  const cid = await T.evaluate(() => { const L = DS.Lessons.get('set-06'); return (L.chain || [])[0]; });
  if (cid) {
    await goStep(cid); await S.waitForTimeout(2500); await clr();
    await S.evaluate(async ([c, mid]) => { const R0 = await DS.Net.get(`rooms/${c}`); await DS.Act.chainSubmit(c, R0, mid, 0, 0, -999).catch(() => {}); }, [code, cid]);
    let cb = null; for (let k = 0; k < 25; k++) { await S.waitForTimeout(150); cb = await S.evaluate(() => ({ line: !!document.querySelector('#st-body .cr-story li.cr-wrong s'), chip: !!document.querySelector('#st-body .cr-chip.ng'), card: !!document.querySelector('#st-body .paper.cr-bad'), brk: !!document.querySelector('#st-body .dk-slot.hp .ch.brk'), note: [...document.querySelectorAll('#st-body .paper-note')].map((n) => n.textContent).join('|') })); if (cb.brk) break; }
    ok(cb.line && cb.chip && cb.card && cb.brk && !/다시 생각/.test(cb.note), `소레이드 틀림 = 📜 이번 줄 빨강 + 줄 긋기 · 단계 칩 빨강 · 카드 빨간 테두리 · 반 하트 쪼개짐 · 안내 줄 없음 (${JSON.stringify(cb)})`);
    await S.screenshot({ path: `${OUT}/146-chain-wrong.png` });
    for (let i = 0; i < 7; i++) { await S.evaluate(async ([c, mid]) => { const R0 = await DS.Net.get(`rooms/${c}`); await DS.Act.chainSubmit(c, R0, mid, 0, 0, -999).catch(() => {}); }, [code, cid]); await S.waitForTimeout(250); }
    r = await rec(cid); ok(r.left === 0 && r.locked, `소레이드 졸개 오답 8번 = ❤ 0 · 잠김 (${JSON.stringify(r)})`);
    await T.waitForTimeout(1500); ok(await T.evaluate(() => !!document.querySelector('[data-crok]')), '리모컨 소레이드 ✔ 풀어주기');
    await T.evaluate(() => document.querySelector('[data-crok]').click()); await T.waitForTimeout(1200);
    r = await rec(cid); ok(r.left === 1 && !r.locked, `소레이드 풀어주기 → ❤ 1 (${r.left})`);
  } else ok(false, '소레이드 몬스터 없음');
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
