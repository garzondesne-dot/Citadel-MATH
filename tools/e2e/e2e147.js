// ⚡ 2026-11-13 밤 (메타인지 6 · 묶음 B · ❓#1~#3 = A): 다 맞히면 ⚡ 3 · 💚 힐 · ⛓ 묶기 · 🌟 진필살기 카드 → 노란 단추 「고른 기술 + 🔥 재도전」 → 재도전 판(무료 · 틀린 것만) → 다 맞혀야 다음 ⚡ · 그만하기 / 이어서 · 소레이드도 같게
//   PORT=8766 node tools/e2e/e2e147.js <출력 폴더>
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
  const st = () => S.evaluate(() => ({ cards: [...document.querySelectorAll('#st-body [data-sk]')].map((b) => b.dataset.sk + (b.disabled ? '-' : '+')), go: !!document.querySelector('#sk-go'), goDis: (document.querySelector('#sk-go') || {}).disabled, goTxt: (document.querySelector('#sk-go') || {}).textContent || '', desc: (document.querySelector('#st-body .sk-desc') || {}).textContent || '', form: !!document.querySelector('#st-go'), retry: (document.querySelector('#st-retry') || {}).textContent || '', stop: !!document.querySelector('.sk-stopped'), back: (document.querySelector('#sk-back') || {}).textContent || '', note: (document.querySelector('#st-body .paper-note') || {}).textContent || '' }));
  const clickSel = (sel) => S.evaluate((sel) => document.querySelector(sel).click(), sel);
  await goStep('m2'); await S.waitForTimeout(2500); await clr(); let r;
  await sub('m2', true); await S.waitForTimeout(3500); await clr();
  let v = await st(); r = await rec('m2');
  ok(v.cards.join() === 'heal+,bind+,true-' && v.go && v.goDis && /세 번째 ⚡|Ⅳ/.test(v.desc), `다 맞힘 → ⚡ 카드 3장 · 🌟 흐림 + 이유 (${v.cards} · ${v.desc.slice(0, 40)})`);
  await S.screenshot({ path: `${OUT}/147-pick.png` });
  await clickSel('#st-body [data-sk="heal"]'); await S.waitForTimeout(400); v = await st();
  ok(!v.goDis && /힐 주고\s*\S*\s*재도전/.test(v.goTxt), `💚 고르면 노란 단추 = 「${v.goTxt.trim()}」`);
  await clickSel('#sk-go'); await S.waitForTimeout(2500); await clr(); v = await st(); r = await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const x = DS.Raid.record(DS.Lessons.get('set-06'), R, 'm2', DS.Net.uid()); return { energy: x.energy, inPanel: x.inPanel, panel: x.panel }; }, code);
  const dk = () => S.evaluate(() => ({ main: (document.querySelector('#st-body .dk4 .dk-l') || {}).textContent || '', slot: (document.querySelector('#st-body .dk4 .dk-slot') || {}).innerHTML || '', tag: !!document.querySelector('#st-body .num-tag.ch'), notes: [...document.querySelectorAll('#st-body .paper-note')].map((n) => n.textContent).join('|'), last: (document.querySelector('#st-body .last-ans') || {}).textContent || '' }));
  let d = await dk();
  ok(v.form && r.energy === 2 && r.inPanel && d.tag && !d.notes && /재도전/.test(d.main) && (d.slot.match(/data-ic|⚡/g) || []).length >= 3, `힐 → ⚡ 2 · 재도전 판 = 「🔁 숫자 바뀜」 꼬리표만 (안내 줄 없음) · 노란 단추 「${d.main}」 · 칸 「${d.slot}」`);
  await S.screenshot({ path: `${OUT}/147-panel.png` });
  await sub('m2', false); await S.waitForTimeout(4500); await clr(); v = await st(); r = await rec('m2'); d = await dk();
  ok(r.left === 4 && v.form && /지난 답/.test(d.last) && !/고쳐|그대로예요|다시 생각/.test(d.notes), `재도전 판에서 틀림 = ❤ 그대로 (${r.left}) · 글자 안내 없이 같은 문제로 · 지난 답 줄 긋기 (${d.last.slice(0, 20)} · notes: ${d.notes.slice(0, 40)})`);
  await S.screenshot({ path: `${OUT}/147-panel-wrong.png` });
  await sub('m2', true); await S.waitForTimeout(3500); await clr(); v = await st();
  ok(v.cards.length === 3 && v.go, '판 1 완성 → 다음 ⚡ 카드');
  // 소레이드
  const cid = await T.evaluate(() => (DS.Lessons.get('set-06').chain || [])[0]);
  await goStep(cid); await S.waitForTimeout(2500); await clr();
  await S.evaluate(async ([c, mid]) => { const L = DS.Lessons.get('set-06'); for (let s = 0; s < 8; s++) { const R0 = await DS.Net.get(`rooms/${c}`), R = DS.Act.unpackRoom(R0), x = DS.Raid.record(L, R, mid, DS.Net.uid()); if (x.done) break; await DS.Act.chainSubmit(c, R0, mid, x.stage, 0, DS.Raid.chainAns(x.items[x.stage])); } }, [code, cid]);
  await S.waitForTimeout(3000); await clr(); v = await st();
  ok(v.cards.join() === 'heal+,bind+,true-', `소레이드 대장 처치 → ⚡ 카드 (${v.cards})`);
  await S.screenshot({ path: `${OUT}/147-chain-pick.png` });
  await clickSel('#st-body [data-sk="bind"]'); await S.waitForTimeout(300); await clickSel('#sk-go'); await S.waitForTimeout(2500); await clr();
  const cv = await S.evaluate(() => ({ h: document.querySelector('#st-body .num-tag.ch') ? '🔁 숫자 바뀜' : '', go: (document.querySelector('#cr-go .dk-l') || {}).textContent || '', wr: !!document.querySelector('#st-body .dk-wr') }));
  ok(/숫자 바뀜/.test(cv.h) && /재도전/.test(cv.go), `⛓ 묶고 → 소레이드 재도전 판 (꼬리표 ${cv.h} · 노란 단추 ${cv.go} · ✍ ${cv.wr})`);
  await S.screenshot({ path: `${OUT}/147-chain-panel.png` });
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
