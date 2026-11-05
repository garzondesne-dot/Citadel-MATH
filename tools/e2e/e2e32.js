// 🏛 교사 캠프 = 학생 캠프 화면 그대로 (2026-11-05: 교사 폰 · 종합상황실 모두 DS.Camp) (v2: 성채 · 텐트=책장 · 아치 문) + 모닥불 · 허수아비 · 우편함 (교사 폰 · 종합상황실) — node tools/e2e/e2e32.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  const { code, hallKey } = await T.evaluate(() => DS.Act.createRoom('set-03', '1-1'));
  await T.evaluate(([c, k]) => DS.TCamp.enter({ code: c, hallKey: k }), [code, hallKey]); await T.waitForTimeout(1500);
  log.push('교사 폰 오브젝트: ' + (await T.evaluate(() => ['camp-anvil', 'camp-castle', 'camp-gate', 'camp-dummy', 'camp-tent', 'camp-mail'].map((i) => (document.getElementById(i) ? i.slice(5) : `없음:${i}`)).join(' ') + (document.querySelector('#camp .camp-fire-img') ? ' fire' : ''))));
  await T.locator('.camp-stage').scrollIntoViewIfNeeded(); await T.screenshot({ path: `${OUT}/t-camp.png` });
  await T.click('#camp-tent'); await T.waitForTimeout(1500); log.push('책장: ' + (await T.locator('.sh-l').count()) + '개 차시'); await T.screenshot({ path: `${OUT}/t-shelf.png` }); await T.click('.modal .ui-x');
  await T.click('#camp-dummy'); await T.waitForTimeout(1500); log.push('허수아비 화면: ' + (await T.evaluate(() => document.getElementById('screen-bonus').classList.contains('active'))));
  await T.evaluate(([c, k]) => DS.TCamp.enter({ code: c, hallKey: k }), [code, hallKey]); await T.waitForTimeout(1000);
  await T.click('#camp-mail'); await T.waitForTimeout(1500); log.push('우편함(교사 폰) → 대시보드: ' + (await T.evaluate(() => document.getElementById('screen-dash').classList.contains('active'))));
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${hallKey}`); await H.waitForTimeout(2500);
  await H.screenshot({ path: `${OUT}/h-camp.png` });
  await H.click('#camp-mail'); await H.waitForTimeout(1200); log.push('우편함(종합상황실) → 대시보드 안 열림: ' + (await H.evaluate(() => !document.getElementById('screen-dash').classList.contains('active'))));
  console.log(log.join('\n')); console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
