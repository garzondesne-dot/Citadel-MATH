// 🐞 핫픽스 (2026-11-10 「종합실에서 공격 모션이 아예 안 나감」): 소레이드 단계 답 → 종합실 DS.Attack.play (맞힘 · 틀림 · 한 판 더) — node tools/e2e/e2e88.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.setViewportSize({ width: 1400, height: 900 }); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.evaluate(async () => { await DS.Net.set('gcfg/photo', { on: true, url: 'https://example.invalid/x' }); await DS.Net.set('photo_rubric/set-06/u7', { on: true }); });
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  const { code, hallKey } = await T.evaluate(() => DS.Act.createRoom('set-06', '1-3'));
  await S.evaluate(async (c) => { await DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }); }, code).catch(() => {}); await S.waitForTimeout(1500);
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-06'); for (let i = 0; i < 12; i++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(L, R); if (s && s.id === 'u7') break; await DS.Act.go(c, R, L, 1); } const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.setSolve(c, R, L, { now: true }); }, code);
  await S.waitForTimeout(2500); const clr = () => S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove()));
  await clr(); const dk = () => S.evaluate(() => ({ go: !!document.querySelector('.cr-dock #cr-go'), wr: !!document.querySelector('.cr-dock #cr-write'), prac: (document.querySelector('.cr-dock #cr-prac') || {}).disabled, bind: !!document.querySelector('#st-bind'), heal: !!document.querySelector('#st-heal'), lis: document.querySelectorAll('.cr-story li').length }));
  const H = await mk('H'); await H.setViewportSize({ width: 1400, height: 800 }); await H.goto(U + `&role=hall&code=${code}&key=${hallKey}`); await H.waitForTimeout(3500);
  await H.evaluate(() => { window.__atk = []; const o = DS.Attack.play; DS.Attack.play = (a, opt) => { window.__atk.push(opt.miss ? 'miss' : 'hit'); return o(a, opt); }; });
  const put = (s, p, good) => S.evaluate(async ([c, s, p, good]) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'), me = DS.Net.uid(), it = DS.Raid.chainItems(L, R, 'u7', me, p), k = Object.keys((((R.chain || {}).u7 || {})[me]) || {}).length; await DS.Net.set(`rooms/${c}/chain/u7/${me}/${k}`, { s, p, g: good ? DS.Raid.chainAns(it[s]) : -999, at: DS.Net.TS }); }, [code, s, p, good]);
  await put(0, 0, true); await H.waitForTimeout(2500); let a = await H.evaluate(() => window.__atk.slice()); ok(a.join() === 'hit', `졸개 ① 맞힘 → 종합실 공격 모션 (${a})`);
  await put(1, 0, false); await H.waitForTimeout(2500); a = await H.evaluate(() => window.__atk.slice()); ok(a.join() === 'hit,miss', `졸개 ② 틀림 → 빗나감 모션 (${a})`);
  for (let s = 1; s < 5; s++) await put(s, 0, true); await H.waitForTimeout(5000); a = await H.evaluate(() => window.__atk.slice()); ok(a.length === 6 && a.slice(2).every((x) => x === 'hit'), `대장까지 → 모두 모션 (${a})`);
  await S.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/${DS.Net.uid()}/pr/u7`, 1); }, code); await put(0, 1, true); await H.waitForTimeout(2500); a = await H.evaluate(() => window.__atk.slice()); ok(a.length === 7 && a[6] === 'hit', `한 판 더 맞힘 → 모션 (${a.length})`);
  const dm = await H.evaluate(() => [...document.querySelectorAll('#rm-fx .dmg')].length); void dm;
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
