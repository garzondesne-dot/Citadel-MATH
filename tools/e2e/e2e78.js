// ⛶ 체험판 위 TV 크게 보기 (2026-11-08 요청 #9): 누르면 가로 전체 화면 → 아무 데나 누르면 원래대로 · 폰 세로 390×844 · PC 1440×900
//   node tools/e2e/e2e78.js <출력 폴더> [폭 높이]
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/trial/';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: Number(process.argv[3]) || 390, height: Number(process.argv[4]) || 844 } }); const errs = [], log = [];
  await ctx.addInitScript(() => { window.DS_FUN = { pick: 4000, show: 2500 }; });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push((e.stack || e.message).split('\n').slice(0, 3).join(' | '))); p.on('dialog', (d) => d.accept());
  const P = (s) => { log.push(s); console.log(s); };
  const VW = Number(process.argv[3]) || 390, shot = (n) => p.screenshot({ path: `${OUT}/78-${VW}-${n}.png` });
  const shut = () => p.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove())); // 🎁 · 🦇 무작위 팝업
  const bar = () => p.evaluate(() => (document.querySelector('#test-bar') || {}).innerText || '');
  const next = async (ms = 2500) => { await shut(); await p.click('#tb-next'); await p.waitForTimeout(ms); };
  const room = () => p.evaluate(async () => { const c = Object.keys((await DS.Net.get('rooms')) || {}).pop(); return c ? DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)) : null; });
  // 내 답 (bots.js given 과 같은 꼴)
  const answer = (att, firstWrong) => p.evaluate(async ([att, w]) => {
    const c = Object.keys((await DS.Net.get('rooms')) || {}).pop(), R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R), me = DS.Net.uid();
    if (st.kind === 'boss') { for (let i = 0; i < L.boss.items; i++) await DS.Net.set(`rooms/${c}/bossTry/${me}/${i}/0`, DS.Net.pack(DS.Bots.given(L.boss.sets[1][i], true))); return 'boss'; }
    const items = DS.Raid.itemsFor(L, R, st.id, me, att);
    await DS.Net.set(`rooms/${c}/subs/${st.id}/${me}/${att}`, DS.Net.pack(items.map((q, i) => DS.Bots.given(q, !(w && i === 0)))));
    return st.id;
  }, [att, firstWrong]);
  // ① 첫 화면(이름 · 용사) → 내 캠프

  await p.goto(U); await p.waitForTimeout(4000);
  await p.fill('#tp-name', '김선생'); await p.click('.tp-h1[data-h="2"]'); await p.click('#tp-go'); await p.waitForTimeout(3500);
  await shut(); await p.click('#camp-gate'); await p.waitForTimeout(4000);
  for (let k = 0; k < 15; k++) { if (/수업 시작 ▶ \(5/.test(await bar())) break; await p.waitForTimeout(1000); }
  await next(); await next(3000);
  if (await p.evaluate(() => { const o = document.getElementById('focus'); return !!o && !o.hidden; })) { await p.click('#tb-focus'); await p.waitForTimeout(1200); }
  await next(3000); await shut();
  const box = () => p.evaluate(() => { const b = document.getElementById('test-tv'); if (!b) return null; const r = b.getBoundingClientRect(), i = b.querySelector('.tt-in').getBoundingClientRect(); return { big: b.classList.contains('tv-big'), w: Math.round(r.width), h: Math.round(r.height), iw: Math.round(i.width), ih: Math.round(i.height) }; });
  const b0 = await box(); await shot('1-small');
  await p.click('#test-tv .tt-tap'); await p.waitForTimeout(900); const b1 = await box(); await shot('2-big');
  await p.mouse.click(30, 30); await p.waitForTimeout(900); const b2 = await box(); await shot('3-back');
  const vw = VW, vh = Number(process.argv[4]) || 844;
  P(`작은 TV ${JSON.stringify(b0)} → 누름 ${JSON.stringify(b1)} → 다시 누름 ${JSON.stringify(b2)}`);
  const ok = b0 && !b0.big && b1 && b1.big && b1.w === vw && b1.h === vh && (Math.abs(Math.min(b1.iw, b1.ih) - Math.min(vw, vh)) <= 2 || Math.abs(Math.max(b1.iw, b1.ih) - Math.max(vw, vh)) <= 2) && b2 && !b2.big && b2.w === b0.w;
  console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs.slice(0, 5) : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
