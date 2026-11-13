// 🎵 #91 배경음 (2026-11-11): 체험판 한 화면 — 첫 화면 · 캠프 = camp(폰) · 대기실 = lobby(TV) · 개념 = 없음 · 몬스터 = raid-1(🎚 체력 100% = 10%) · 맞히면 음량 커짐 · 🏕 쉼터 = rest · ⚖ = bal · 📄 학습지 창 = 멈춤 · 👑 보스 = boss-n · 캠프로 = camp
//   학생 폰 성채 = 없음 · DS.Sound.bgmNow() 로 확인 (헤드리스는 소리가 안 나도 고른 곡 · 음량은 확인됨) · node tools/e2e/e2e113.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/trial/';
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = []; let ok = 0, fail = 0;
  await ctx.addInitScript(() => { window.DS_FUN = { pick: 4000, show: 2500 }; });
  const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  const now = () => p.evaluate(() => DS.Sound.bgmNow());
  const shut = () => p.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove()));
  const next = async (ms = 2500) => { await shut(); await p.click('#tb-next'); await p.waitForTimeout(ms); };
  await p.goto(U); await p.waitForTimeout(3500);
  let n = await now(); check(n.phone === 'camp' && !n.tv, `첫 화면 = camp (${JSON.stringify(n)})`);
  await p.evaluate(() => { window.__clk = 0; const f = DS.Sound.click; DS.Sound.click = () => { window.__clk++; f.call(DS.Sound); }; }); // 🔘 #87a
  await p.click('[data-mode="s"]'); await p.waitForTimeout(300); await p.fill('#tp-name', '박선생'); await p.click('[data-go="set-03"]'); await p.waitForTimeout(3500);
  n = await now(); check(n.phone === 'camp' && n.playing === 'camp', `캠프 = camp (${JSON.stringify(n)})`);
  { const c0 = await p.evaluate(() => window.__clk); check(c0 >= 1, `🔘 [data-go] 시작 단추 = 딸깍 (${c0})`); }
  await shut(); await p.click('#camp-gate'); await p.waitForTimeout(4000);
  n = await now(); check(n.tv === 'lobby' && n.playing === 'lobby', `대기실 = lobby · TV 쪽만 (${JSON.stringify(n)})`);
  for (let k = 0; k < 15; k++) { if (/수업 시작 ▶ \(5/.test(await p.evaluate(() => (document.querySelector('#test-bar') || {}).innerText || ''))) break; await p.waitForTimeout(1000); }
  await next(); await next(3000); n = await now(); check(n.playing === null, `개념 = 없음 (${JSON.stringify(n)})`);
  { const c1 = await p.evaluate(() => window.__clk); await next(3000); const c2 = await p.evaluate(() => window.__clk); check(c2 === c1 + 1, `🔘 다음 ▶ = 딸깍 (${c1} → ${c2})`); }
  await p.waitForTimeout(1500); n = await now(); check(n.playing === 'raid-1' && n.scale <= 0.2, `몬스터 1 = raid-1 · 체력 가득 = 작게 (${JSON.stringify(n)})`);
  await p.evaluate(async () => { const c = Object.keys((await DS.Net.get('rooms')) || {}).pop(), R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R), me = DS.Net.uid(); const items = DS.Raid.itemsFor(L, R, st.id, me, 0); await DS.Net.set(`rooms/${c}/subs/${st.id}/${me}/0`, DS.Net.pack(items.map((q) => DS.Bots.given(q, true)))); });
  await p.waitForTimeout(5000); n = await now(); check(n.playing === 'raid-1' && n.scale > 0.2, `맞힐수록 음량 커짐 (${JSON.stringify(n)})`);
  await p.evaluate(() => { const b = document.querySelector('#tb-sheet, [data-sheet]'); if (b) b.click(); }); await p.waitForTimeout(1500); n = await now();
  const sheetHeld = n.hold.length > 0; await p.evaluate(() => { const b = document.querySelector('#tb-sheet, [data-sheet]'); if (b) b.click(); }); await p.waitForTimeout(1200);
  check(sheetHeld, `📄 학습지 = 멈춤 (${JSON.stringify(n)})`);
  await shut(); await p.click('#tb-rest'); await p.waitForTimeout(2500); n = await now(); check(n.playing === 'rest', `🏕 쉼터 = rest (${JSON.stringify(n)})`);
  await p.click('#test-fun .fun-btn.k-bal'); await p.waitForTimeout(3000); n = await now(); check(n.playing === 'bal', `⚖ 밸런스 = bal (${JSON.stringify(n)})`);
  await p.click('#test-fun [data-fun="stop"]').catch(() => {}); await p.waitForTimeout(1500); await p.click('#tb-back-class').catch(() => {}); await p.waitForTimeout(2000);
  await next(3000); await next(3000); await next(4000); n = await now(); check(/^boss-[12]$/.test(n.playing || ''), `👑 보스 = boss-n (${JSON.stringify(n)})`);
  // ≪ 캠프로 나가면 TV 꺼짐 → camp
  await shut(); await p.click('#st-back'); await p.waitForTimeout(3000); n = await now(); check(n.tv === null && n.playing === 'camp', `캠프로 = camp (${JSON.stringify(n)})`);
  // 학생 폰 성채 = 없음
  await shut(); await p.click('#camp-castle'); await p.waitForTimeout(3500); n = await now(); check(n.phone === null && n.playing === null, `성채 = 없음 (${JSON.stringify(n)})`);
  // 🔇 배경음 끄기
  await p.click('#bn-back'); await p.waitForTimeout(2500); await p.evaluate(() => DS.Sound.setBgm(false)); await p.waitForTimeout(1200); n = await now(); check(n.playing === null, `배경음 끔 = 멈춤 (${JSON.stringify(n)})`);
  await p.evaluate(() => DS.Sound.setBgm(true));
  console.log(`e2e113: 확인 ${ok} · 실패 ${fail}`, 'errors:', errs.length ? errs.slice(0, 3) : 'none'); await b.close(); if (fail || errs.length) process.exit(1);
})();
