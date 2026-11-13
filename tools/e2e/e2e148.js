// 👑 2026-11-13 밤 (메타인지 6 · 묶음 D · ❓#3 · #4 = B): 형성평가 = 일반 몬스터 꼴 · 못 맞힌 문항을 모아 한 번에 공격 · 체력 문항 하나라도 틀리면 ❤ −1 · 틀린 문항만 새 숫자
//   · ⭐ 틀려도 ❤ 그대로 · 다 맞히면 ⚡ 카드(💚 · ⛓ · 🌟 흐림) → 🔥 재도전 판 · ❤ 0 = 해설 — PORT=8766 node tools/e2e/e2e148.js <출력 폴더>
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
  const S2 = S; let r;
  await goStep('boss'); await S.waitForTimeout(2500); await clr();
  // 퀴즈 창 대신: 문항마다 정답(ok) / 오답을 바로 돌려줌
  await S.evaluate(() => { window.__plan = {}; const right = (q) => (q.type === 'blanks' ? q.items.map((i) => i.answer) : q.type === 'subsets' ? DS.SetGen.allSubsets(q.base) : q.type === 'choice' ? q.answerIndex : q.answer); DS.Quiz.ask = async (c, q) => ({ given: window.__plan.bad && window.__plan.bad.includes(Number(String(c.name).match(/(\d+)번/)[1]) - 1) ? (q.type === 'number' ? q.answer + 1 : q.type === 'choice' ? (q.answerIndex + 1) % q.choices.length : q.type === 'subsets' ? [[1]] : q.type === 'blanks' ? q.items.map(() => '?') : 'zz') : right(q) }); });
  const brec = () => S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const x = DS.Raid.bossRec(DS.Lessons.get('set-06'), R, DS.Net.uid()); return { left: x.left, done: x.done, out: x.out, next: Object.keys(x.next).join(), energy: x.energy, inPanel: x.inPanel, round: x.round, okN: x.okI.filter(Boolean).length }; }, code);
  const fillAll = async () => { const n = await S.evaluate(() => document.querySelectorAll('#st-body .boss-items .bitem').length); for (let k = 0; k < n; k++) { await S.evaluate((k) => document.querySelectorAll('#st-body .boss-items .bitem')[k].click(), k); await S.waitForTimeout(250); } };
  const hpN = await S.evaluate(() => DS.Lessons.get('set-06').boss.hpItems), N = await S.evaluate(() => DS.Lessons.get('set-06').boss.items);
  let v = await S.evaluate(() => ({ items: document.querySelectorAll('#st-body .boss-items .bitem').length, go: (document.querySelector('#bs-go') || {}).disabled }));
  ok(v.items === N && v.go === true, `형성평가 = ${N}문항 한 장 · 다 풀기 전엔 공격 흐림`);
  await S.evaluate(() => { window.__plan.bad = [0, 1]; }); await fillAll();
  ok(await S.evaluate(() => !document.querySelector('#bs-go').disabled), '모두 답하면 ⚔ 공격! 켜짐');
  await S.screenshot({ path: `${OUT}/148-form.png` });
  await S.evaluate(() => document.querySelector('#bs-go').click()); await S.waitForTimeout(2500); await clr();
  r = await brec(); v = await S.evaluate(() => ({ t: (document.querySelector('#st-body .st-res') || {}).textContent || '', next: !!document.querySelector('#bs-next') }));
  ok(r.left === 3 && r.next === '0,1' && v.next, `두 문항 틀림 = ❤ −1 (${r.left}) · 다음 = 틀린 문항만 (${r.next}) · 「${v.t.slice(0, 30)}」`);
  await S.screenshot({ path: `${OUT}/148-res.png` });
  await S.evaluate(() => document.querySelector('#bs-next').click()); await S.waitForTimeout(800);
  v = await S.evaluate(() => document.querySelectorAll('#st-body .boss-items .bitem').length); ok(v === 2, `다시 = 틀린 2문항만 (${v})`);
  await S.evaluate(() => { window.__plan.bad = []; }); await fillAll(); await S.evaluate(() => document.querySelector('#bs-go').click()); await S.waitForTimeout(2500); await clr();
  r = await brec(); v = await S.evaluate(() => ({ cards: [...document.querySelectorAll('#st-body [data-sk]')].map((b) => b.dataset.sk + (b.disabled ? '-' : '+')).join() }));
  ok(r.done && r.left === 3 && r.energy === 3 && v.cards === 'heal+,bind+,true-', `다 맞힘 → ⚡ 3 · 카드 💚 ⛓ (🌟 흐림) (${v.cards})`);
  await S.screenshot({ path: `${OUT}/148-done.png` });
  await S.evaluate(() => document.querySelector('#st-body [data-sk="bind"]').click()); await S.waitForTimeout(300); await S.evaluate(() => document.querySelector('#sk-go').click()); await S.waitForTimeout(2000); await clr();
  r = await brec(); v = await S.evaluate(() => ({ n: document.querySelectorAll('#st-body .boss-items .bitem').length, note: document.querySelector('#st-body .num-tag.ch') ? '🔁 숫자 바뀜' : '' }));
  ok(r.inPanel && v.n === hpN && /숫자 바뀜/.test(v.note), `⛓ 묶고 → 🔥 재도전 판 1 = 체력 문항 ${v.n}개 (${v.note.slice(0, 20)})`);
  await S.evaluate(() => { window.__plan.bad = [2]; }); await fillAll(); await S.evaluate(() => document.querySelector('#bs-go').click()); await S.waitForTimeout(2000); await clr();
  r = await brec(); ok(r.inPanel && r.left === 3, `재도전 판 틀림 = ❤ 그대로 (${r.left})`);
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
