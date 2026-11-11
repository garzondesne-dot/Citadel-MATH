// ⌨ #92 룬 키패드 (2026-11-11): 숫자 답 = 룬 0~9 + ⌫ · 빈 칸이면 공격 잠김 · 세 자리 ✕ · 일반 몬스터(6차시 m2 숫자 3칸) · 소레이드(문제 7 졸개① 숫자) · 선생님 시연 칸도 같은 룬 · node tools/e2e/e2e114.js <출력 폴더>
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
  const clr = () => S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove()));
  const tag = `${VW[0]}x${VW[1]}`;
  const tap = (sel) => S.evaluate((s) => document.querySelector(s).click(), sel);
  const press = async (i, keys) => { for (const k of keys) { await S.evaluate(([i, k]) => document.querySelector(`#st-body [data-rune="${i}|${k}"]`).click(), [i, k]); await S.waitForTimeout(60); } };
  const slot = (i) => S.evaluate((i) => { const s = document.querySelector(`#st-body [data-rv="${i}"]`); return s ? { t: s.textContent.trim(), empty: s.classList.contains('empty') } : null; }, i);
  const goOff = (id) => S.evaluate((id) => { const g = document.querySelector(id); return g ? g.disabled : null; }, id);
  // ① 일반 몬스터 m2 (숫자 3칸)
  await goStep('m2'); await S.waitForTimeout(2500); await clr();
  const ans = await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'); return DS.Raid.itemsFor(L, R, 'm2', DS.Net.uid(), 0).map((q) => q.answer); }, code);
  const pads = await S.evaluate(() => ({ n: document.querySelectorAll('#st-body .runepad').length, keys: document.querySelectorAll('#st-body .runepad:first-child [data-rune], #st-body .item:first-of-type [data-rune]').length, dial: document.querySelectorAll('#st-body .dial, #st-body [data-dial]').length }));
  ok(pads.n === 3 && pads.dial === 0, `${tag} m2: 룬 키패드 ${pads.n}개 · 다이얼 없음`);
  const s0 = await slot(0); ok(s0 && s0.empty && /숫자를 넣어 주세요/.test(s0.t) && !/_/.test(s0.t), `${tag} 빈 칸 = 「${s0 && s0.t}」 (자리 수 안 보임)`);
  ok(await goOff('#st-go') === true, `${tag} 비어 있으면 ⚔ 공격 잠김`);
  await press(0, [1, 2, 3]); let v = await slot(0); ok(v.t === '12', `${tag} 1 · 2 · 3 → ${v.t} (세 자리 ✕)`);
  await press(0, ['x', 'x']); v = await slot(0); ok(v.empty, `${tag} ⌫ ⌫ → 빈 칸`);
  await press(0, ['x']); v = await slot(0); ok(v.empty, `${tag} 빈 칸에서 ⌫ = 그대로`);
  for (let i = 0; i < ans.length; i++) await press(i, String(ans[i]).split('').map(Number));
  await S.screenshot({ path: `${OUT}/114-${tag}-m2.png` });
  const al = await S.evaluate(() => [...document.querySelectorAll('#st-body .ans-line')].map((x) => x.classList.contains('pen')));
  ok(await goOff('#st-go') === false && al.every(Boolean), `${tag} 다 넣으면 ⚔ 공격 켜짐 · 「✍ 나의 답」 줄 ${al.filter(Boolean).length}/${al.length}`);
  await tap('#st-go'); await S.waitForTimeout(2600);
  const rec = await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'); const r = DS.Raid.record(L, R, 'm2', DS.Net.uid()); return { best: r.best, total: r.total }; }, code);
  ok(rec.best === rec.total && rec.total === 3, `${tag} 룬으로 낸 답 = 모두 맞음 (${rec.best}/${rec.total})`);
  { await S.waitForTimeout(1500); await S.screenshot({ path: `${OUT}/114-${tag}-m2-result.png` }); const pb = await S.evaluate(() => [...document.querySelectorAll('#st-body .pen-box')].map((x) => ({ fold: x.classList.contains('cr-fold'), btn: !!x.querySelector('.pen-sf'), all: x.querySelectorAll('li').length, shown: [...x.querySelectorAll('li')].filter((l) => l.offsetHeight > 0).length })));
    ok(pb.length > 0 && pb.every((x) => !x.fold && !x.btn && x.shown === x.all), `${tag} ✍ #94 일반 몬스터 결과 「📜 나의 답안」 늘 모두 펼침 ${JSON.stringify(pb)}`); }
  // ② 소레이드 문제 7 졸개① (숫자)
  await goStep('u7'); await S.waitForTimeout(2600); await clr();
  const a7 = await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'); return DS.Raid.chainItems(L, R, 'u7', DS.Net.uid(), 0)[0].answer; }, code);
  ok(await goOff('#cr-go') === true && (await slot(0) || {}).empty, `${tag} 소레이드 졸개①: 빈 칸 · 공격 잠김`);
  await press(0, String(a7).split('').map(Number)); await S.screenshot({ path: `${OUT}/114-${tag}-u7.png` });
  ok(await goOff('#cr-go') === false && (await slot(0)).t === String(a7), `${tag} 소레이드: 룬 ${a7} → 공격 켜짐`);
  const vis = await S.evaluate(() => { const k = [...document.querySelectorAll('#st-body [data-rune]')], dock = document.querySelector('.st-dock'), dt = dock ? dock.getBoundingClientRect().top : innerHeight; return { n: k.length, h: Math.round(Math.min(...k.map((x) => x.getBoundingClientRect().height))), w: Math.round(Math.min(...k.map((x) => x.getBoundingClientRect().width))), sw: document.documentElement.scrollWidth, iw: innerWidth }; });
  ok(vis.n === 11 && vis.h >= 44 && vis.sw <= vis.iw + 1, `${tag} 룬 11개(0~9 · ⌫) · 단추 ${vis.w}×${vis.h}px · 가로 넘침 없음`);
  await tap('#cr-go'); await S.waitForTimeout(3000);
  const st7 = await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'); return DS.Raid.record(L, R, 'u7', DS.Net.uid()).stage; }, code);
  ok(st7 === 1, `${tag} 소레이드: 졸개① 처치 → 단계 ${st7}`);
  // ③ 선생님 쪽 (🪞 같은 함수)
  const th = await T.evaluate(() => { const q = { type: 'number', question: '(1) n(A) = ?', answer: 3 }; const h = DS.Student.itemHtml(q, 0, [null]); return /runepad/.test(h) && !/data-dial/.test(h); });
  ok(th, `${tag} 선생님 시연 칸 = 같은 룬 키패드`);
  // ④ 🎯 허수아비 6차시 문제 2 (성채 · 허수아비 = 같은 부품 · bonus.js)
  await S.evaluate(async () => { await DS.Net.set('unlock/1-3', 6); await DS.Net.set('held/1-3', { 'set-06': true }); await DS.Net.set('records/1-3/1/set-06', { at: 1, no: 6, mons: { m2: 'x' }, bossM: '', boss: 0, bossN: 0, conc: {}, names: {} }); });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(2500);
  await S.click('#camp-dummy', { force: true }).catch(() => {}); await S.waitForTimeout(1500);
  await S.click('[data-fight="set-06|m2"]'); await S.waitForTimeout(800); await S.click('#bf-go'); await S.waitForTimeout(900);
  const bf = await S.evaluate(() => { const f = DS.Bonus._form; return f ? { ans: f.todo.map((i) => f.items[i].answer), todo: f.todo, pads: document.querySelectorAll('.bn-fight .runepad').length, dis: document.querySelector('#bf-go2').disabled } : null; });
  ok(bf && bf.pads === bf.todo.length && bf.dis, `${tag} 허수아비: 룬 키패드 ${bf && bf.pads}개 · 빈 칸이면 공격 잠김`);
  if (bf) { for (let k = 0; k < bf.todo.length; k++) for (const d of String(bf.ans[k]).split('')) { await S.evaluate(([i, d]) => document.querySelector(`.bn-fight [data-rune="${i}|${d}"]`).click(), [bf.todo[k], d]); await S.waitForTimeout(60); }
    const af = await S.evaluate(() => ({ dis: document.querySelector('#bf-go2').disabled, pen: document.querySelectorAll('.bn-fight .ans-line.pen').length, v: [...document.querySelectorAll('.bn-fight [data-rv]')].map((x) => x.textContent.trim()) }));
    ok(!af.dis && af.pen === bf.todo.length && af.v.join() === bf.ans.join(), `${tag} 허수아비: 룬 ${af.v.join(' · ')} → 공격 켜짐 · 나의 답 줄 ${af.pen}`); await S.screenshot({ path: `${OUT}/114-${tag}-dummy.png` }); }
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
