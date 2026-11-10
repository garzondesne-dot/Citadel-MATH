// 🔄 #55 옛 판 → 새 판 (2026-11-10): version.json 흉내 — ① 켤 때 자동 새로 고침 · 성공이면 그대로 ④ 두 번 실패 = 큰 안내(무한 새로 고침 없음)
//   ② 입장 잠금 ③ 수업 중 = 띠만 → 다음 몬스터로 넘어갈 때 새로 고침 · 다시 그 수업으로 ④ 리모컨 「🔄 옛 판 n명」 — node tools/e2e/e2e89.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; if (process.env.V) console.log(log[log.length - 1]); };
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  let NEW = null; // null = version.json 그대로 · 문자열 = 그 판이 최신이라고 대답
  let CFG = null, CFG_FROM = 0, cfgN = 0; // CFG = config.js 판을 그걸로 (새 판이 깔린 흉내) · CFG_FROM 번째 요청부터
  await ctx.route('**/version.json*', (r) => (NEW ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ v: NEW }) }) : r.continue()));
  await ctx.route('**/js/config.js*', async (r) => { cfgN++; if (!CFG || cfgN < CFG_FROM) return r.continue(); const res = await r.fetch(); const t = (await res.text()).replace(/DS\.VERSION = '[^']+'/, `DS.VERSION = '${CFG}'`); return r.fulfill({ response: res, body: t }); });
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); p._nav = 0; p.on('load', () => { p._nav++; }); return p; };
  // ① 실패: 최신 = 9.9.9 · 판은 그대로 → 새로 고침 2번 뒤 큰 안내 · 그 뒤 더 안 고침
  NEW = 'citadel-9.9.9';
  const A = await mk('A'); await A.goto(U); await A.waitForTimeout(9000);
  const navA = A._nav; let cov = await A.evaluate(() => (document.querySelector('#fresh-cover') || {}).textContent || '');
  ok(/완전히 껐다/.test(cov), `① 두 번 새로 고쳐도 옛 판 → 「앱을 완전히 껐다 다시 켜 주세요」 (열기 ${navA}번 = 처음 1 + 새로 고침 2 · ${cov.slice(0, 20)})`);
  await A.waitForTimeout(3000); ok(A._nav === navA, `④ 무한 새로 고침 없음 (${A._nav})`);
  await A.screenshot({ path: `${OUT}/89-fail.png` }); await A.evaluate(() => localStorage.removeItem('ds-fresh')); await A.close();
  // ① 성공: 새로 고치면 새 판(9.9.9)이 깔림 → 안내 없음 · 기록 지움
  CFG = 'citadel-9.9.9'; CFG_FROM = cfgN + 2; const B = await mk('B'); await B.goto(U); await B.waitForTimeout(6000); // 처음 열기 = 옛 판 · 새로 고침부터 새 판
  const vb = await B.evaluate(() => ({ v: DS.VERSION, cov: !!document.querySelector('#fresh-cover'), rec: localStorage.getItem('ds-fresh') }));
  ok(vb.v === 'citadel-9.9.9' && !vb.cov && !vb.rec, `① 켤 때 옛 판 → 저절로 새 판 (${JSON.stringify(vb)})`);
  await B.evaluate(() => localStorage.removeItem('ds-fresh')); await B.close(); NEW = null; CFG = null; CFG_FROM = 0;
  // 수업 준비 (지금 판 = 최신)
  const T = await mk('T'); await T.setViewportSize({ width: 1400, height: 900 }); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1500);
  await T.evaluate(() => [DS.VERSION, localStorage.getItem('ds-fresh'), location.href]).then((x) => process.env.V && console.log('T', x)).catch((e) => console.log('T nav', e.message.slice(0, 40)));
  await T.waitForTimeout(1500);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  const { code } = await T.evaluate(() => DS.Act.createRoom('set-06', '1-3'));
  // ② 입장 잠금: 옛 판이면 들어가지 않고 「바꾸는 중」
  await S.evaluate(() => localStorage.removeItem('ds-fresh')); NEW = 'citadel-9.9.9'; const n0 = S._nav; void n0;
  await S.evaluate(async (c) => { window.__rl = 0; DS.Fresh.reload = () => { window.__rl++; }; await DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }); }, code).catch(() => {}); await S.waitForTimeout(800);
  const g = await S.evaluate(() => ({ st: !!document.querySelector('#screen-student.active'), cov: (document.querySelector('#fresh-cover') || {}).textContent || '', rl: window.__rl }));
  ok(!g.st && /바꾸는 중/.test(g.cov) && g.rl === 1, `② 옛 판 입장 → 잠금 + 「🔄 새 판으로 바꾸는 중…」 (${JSON.stringify(g)})`);
  NEW = null; await S.evaluate(() => localStorage.removeItem('ds-fresh')); await S.goto(U + '&role=student'); await S.waitForTimeout(2500);
  // 지금 판으로 입장
  await S.evaluate(async (c) => { await DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }); }, code).catch((e) => errs.push('enter ' + e)); await S.waitForTimeout(1500);
  const ver = await S.evaluate(async (c) => DS.Net.get(`rooms/${c}/players/${DS.Net.uid()}/ver`), code); ok(ver === (await S.evaluate(() => DS.VERSION)), `입장하면 players/나/ver = ${ver}`);
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-06'); for (let i = 0; i < 12; i++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(L, R); if (s && s.id === 'u4') break; await DS.Act.go(c, R, L, 1); } }, code);
  await S.waitForTimeout(2500);
  // ③ 수업 중 새 판: 띠만 (새로 고침 없음) → 다음 단계로 넘어가면 새로 고침 → 다시 그 수업
  NEW = 'citadel-9.9.9'; CFG = 'citadel-9.9.9'; const n1 = S._nav;
  await S.evaluate(async () => { await DS.Fresh.check(true); }); await S.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/${DS.Net.uid()}/x`, Date.now()); }, code); await S.waitForTimeout(2500);
  const band = await S.evaluate(() => (document.querySelector('#fresh-band') || {}).textContent || '');
  ok(/다음 몬스터로 넘어갈 때/.test(band) && S._nav === n1, `③ 몬스터 푸는 중 = 띠만 「${band}」 · 새로 고침 없음`);
  await S.screenshot({ path: `${OUT}/89-band.png` });
  // ④ 리모컨: 옛 판 학생 (ver 를 옛 값으로 흉내)
  await S.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/${DS.Net.uid()}/ver`, 'citadel-0.9.38.1'); }, code);
  await T.evaluate(async (c) => { await DS.Teacher.open(c); }, code).catch(() => {}); await T.waitForTimeout(2500);
  const tt = await T.evaluate(() => (document.querySelector('.t-old') || {}).textContent || ''); ok(/옛 판 1명: 1번/.test(tt), `④ 리모컨 「${tt.slice(0, 30)}」`);
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-06'), R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.go(c, R, L, 1); }, code);
  await S.waitForTimeout(7000);
  const after = await S.evaluate(() => ({ v: DS.VERSION, st: !!document.querySelector('#screen-student.active'), band: !!document.querySelector('#fresh-band') }));
  ok(S._nav > n1 && after.v === 'citadel-9.9.9' && after.st && !after.band, `③ 다음 단계 → 새로 고침 → 새 판으로 다시 그 수업 (${JSON.stringify(after)} · 열기 +${S._nav - n1})`);
  const ver2 = await S.evaluate(async (c) => DS.Net.get(`rooms/${c}/players/${DS.Net.uid()}/ver`), code); ok(ver2 === 'citadel-9.9.9', `다시 들어오면 ver = ${ver2}`);
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
