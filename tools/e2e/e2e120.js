// 🔁 #112 재도전 v4 (2026-11-12 선생님 「진행 B」): 2개 틀린 뒤 「다시」 = ✘ 둘 다 빈칸(빨간 테) · ✔ 지난 답 그대로 잠김 · 하나만 고치면 공격 흐림 + 「틀린 문제 n개를 모두 고쳐요」 · 둘 다 고치면 공격 · 360px
//   node tools/e2e/e2e120.js <출력 폴더> (PORT)
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

  const press = async (i, ks) => { for (const k of ks) { await S.evaluate(([i, k]) => document.querySelector(`#st-body [data-rune="${i}|${k}"]`).click(), [i, k]); await S.waitForTimeout(60); } };
  await goStep('m2'); await S.waitForTimeout(2500); await clr();
  const ans = await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'); return DS.Raid.itemsFor(L, R, 'm2', DS.Net.uid(), 0).map((q) => q.answer); }, code);
  // 첫 판: (1) 맞힘 · (2) (3) 틀림
  await press(0, String(ans[0]).split('')); await press(1, String(ans[1] + 1).split('')); await press(2, String(ans[2] + 1).split(''));
  await S.evaluate(() => document.querySelector('#st-go').click()); await S.waitForTimeout(3000); await clr();
  await S.evaluate(() => { const r = document.querySelector('#st-retry'); if (r) r.click(); }); await S.waitForTimeout(6500); await clr(); // 생각 시간 5초
  await S.evaluate(() => { const r = document.querySelector('#st-retry'); if (r && !r.disabled) r.click(); }); await S.waitForTimeout(1500); await clr();
  const st = () => S.evaluate(() => ({ items: [...document.querySelectorAll('#st-body .items .item')].map((x) => (x.classList.contains('ok-lock') ? 'lock' : x.classList.contains('redo') ? 'redo' : '-') + ':' + ((x.querySelector('.rune-slot') || {}).textContent || '').trim()), go: (document.querySelector('#st-go') || {}).disabled, note: (() => { const n = document.querySelector('.redo-note'); return n && !n.hidden ? n.textContent : ''; })(), lockBtn: [...document.querySelectorAll('#st-body .item.ok-lock [data-rune]')].every((b) => b.disabled), sw: document.documentElement.scrollWidth, iw: innerWidth }));
  let s = await st();
  ok(s.items[0].startsWith('lock:' + ans[0]) && /^redo:숫자를/.test(s.items[1]) && /^redo:숫자를/.test(s.items[2]), `✔ 잠김(지난 답) · ✘ 둘 다 빈칸 (${s.items.join(' | ')})`);
  ok(s.go === true && /틀린 문제 2개를 모두 고쳐요/.test(s.note) && s.lockBtn, `공격 흐림 · 「${s.note}」 · ✔ 칸 단추 잠김`);
  ok(s.sw <= s.iw + 1, '360px 가로 넘침 없음');
  await S.evaluate(() => document.querySelectorAll('.rv96').forEach((e) => e.remove())); await S.screenshot({ path: `${OUT}/120-${tag}-redo.png` });
  await press(1, String(ans[1]).split('')); s = await st();
  ok(s.go === true, '하나만 고치면 공격 여전히 흐림');
  await press(2, String(ans[2]).split('')); s = await st();
  ok(s.go === false && !s.note, '둘 다 고치면 공격 켜짐 · 안내 줄 숨김');
  await S.evaluate(() => document.querySelector('#st-go').click()); await S.waitForTimeout(3000);
  const rec = await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'); const r = DS.Raid.record(L, R, 'm2', DS.Net.uid()); return { best: r.best, total: r.total }; }, code);
  ok(rec.best === 3, `고쳐서 낸 답 = 3/3 (${rec.best}/${rec.total})`);
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();