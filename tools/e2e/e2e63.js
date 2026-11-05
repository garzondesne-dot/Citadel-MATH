// 🎮 선생님 시연 → ⚔ 일반 · ⚡ 필살기 고르기 (2026-11-06 사용자 확정)
//   스킬 Ⅰ(별) = 필살기 단추 잠김 · 일반 공격 → 컷인 없음 / Ⅳ(유성우) · 🪶(심판의 빛) = 필살기 → 컷인 / 형성평가 시연도 같음
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e63.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  const { code, hallKey: key } = await T.evaluate(() => DS.Act.createRoom('set-05', '1-3'));
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/v1`, { num: 1, nick: '용사', hero: 0, at: Date.now() }); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const L = DS.Lessons.get(R.meta.lesson); await DS.Act.go(c, R, L, 1); await DS.Net.set(`rooms/${c}/active/v1`, true); await DS.Net.update(`rooms/${c}/state`, { step: L.steps.findIndex((s) => s.id === 'm1'), focus: false }); }, code);
  const look = (fx) => T.evaluate(async ([c, fx]) => DS.Net.set(`rooms/${c}/state/tlook`, { hero: 17, fx, at: Date.now() }), [code, fx]);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 });
  await look('twinkle'); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  const ans = await H.evaluate(() => DS.Lessons.get('set-05').items('m1', 'x', 0).map((q) => q.answer));
  const solve = async () => { await H.click('#h-demo'); await H.waitForTimeout(500); for (let i = 0; i < ans.length; i++) for (const k of ans[i]) { await H.click(`#h-demo-ov [data-pick="${i}|${k}"]`); await H.waitForTimeout(40); } await H.click('#demo-go'); await H.waitForTimeout(500); };
  const state = () => H.evaluate(() => { const u = document.querySelector('[data-strike="1"]'); return { normal: !!document.querySelector('[data-strike="0"]'), ult: u ? (u.disabled ? 'locked' : u.textContent.trim()) : 'none' }; });
  const cut = async (sel) => { await H.click(sel); let seen = false; for (let k = 0; k < 10; k++) { await H.waitForTimeout(120); if (await H.$('.ult .u-band')) { seen = true; break; } } await H.waitForTimeout(2600); return seen; };
  const out = [];
  // ① 별(Ⅰ) → 필살기 잠김 · 일반 공격 = 컷인 없음
  await solve(); out.push(['Ⅰ 별', await state()]); await H.screenshot({ path: `${OUT}/63-1-locked.png` });
  out.push(['Ⅰ 일반 공격 컷인?', await cut('[data-strike="0"]')]);
  // ② 유성우(Ⅳ · 수학자 특화 아님) → 필살기 열림 · 누르면 컷인 / 일반은 컷인 없음
  await look('meteor'); await H.waitForTimeout(1200);
  await solve(); out.push(['Ⅳ 유성우', await state()]); await H.screenshot({ path: `${OUT}/63-2-open.png` });
  out.push(['Ⅳ 필살기 컷인?', await cut('[data-strike="1"]')]);
  await solve(); out.push(['Ⅳ 일반 공격 컷인?', await cut('[data-strike="0"]')]);
  // ③ 심판의 빛(🪶) → 필살기 열림
  await look('smite'); await H.waitForTimeout(1200);
  await solve(); out.push(['🪶 심판의 빛', await state()]); await H.click('#demo-x'); await H.waitForTimeout(300);
  // ④ 형성평가 시연: 체력 문항을 다 맞히면 단추 2개 (입력 창은 정답으로 바꿔 둠)
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-05'); await DS.Net.update(`rooms/${c}/state`, { step: L.steps.findIndex((s) => s.kind === 'boss') }); }, code); await H.waitForTimeout(1500);
  await H.evaluate(() => { DS.Quiz.ask = async () => ({ given: 0 }); DS.Quiz.grade = () => true; });
  await H.click('#h-demo'); await H.waitForTimeout(400);
  const hp = await H.evaluate(() => DS.Lessons.get('set-05').boss.hpItems);
  out.push(['형성평가 1번만', (await state()).normal]);
  for (let i = 0; i < hp; i++) { await H.click(`[data-di="${i}"]`); await H.waitForTimeout(250); }
  out.push(['형성평가 다 맞힘', await state()]); await H.screenshot({ path: `${OUT}/63-3-boss.png` });
  out.push(['형성평가 필살기 컷인?', await cut('[data-strike="1"]')]);
  out.forEach(([k, v]) => console.log(k.padEnd(16), JSON.stringify(v)));
  console.log('ERRORS', errs.length, errs.slice(0, 5)); await b.close();
})();
