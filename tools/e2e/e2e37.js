// 🏕 캠프 v2 (달빛 숲 + 성채 · 2026-11-03): 한 화면(360×780 · 390×844) · 성채 → 중단원던전 · 텐트 → 책장 · 차시 문 빛(수업 열림) · 등불 · 상태창 · 이름표 — node tools/e2e/e2e37.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const errs = [], log = [];
  const me = { c: '1-1', n: 3, name: '박도윤', hero: 0, fx: 'flame', title: 'dawn' };
  for (const [nm, vp] of [['s360', { width: 360, height: 780 }], ['i390', { width: 390, height: 844 }]]) {
    const p = await b.newPage({ viewport: vp }); p.on('pageerror', (e) => errs.push(nm + ': ' + e.message)); p.on('dialog', (d) => d.accept());
    await p.goto(U); await p.waitForTimeout(1200);
    await p.evaluate(async (m) => {
      localStorage.setItem('citadel-tut-1-1-3', JSON.stringify({ a: 1, b: 1 }));
      await DS.Net.set('unlock/1-1', 5);
      await DS.Net.set('records/1-1/3', { 'set-02': { no: 2, conc: { c1: [3, 4] }, boss: 4, bossN: 5, won: true, fixed: 2, perfects: 1, at: 1 }, 'set-04': { no: 4, conc: { c1: [5, 6] }, boss: 5, bossN: 6, won: true, fixed: 3, perfects: 0, at: 2 } });
      await DS.Net.set('bonus/1-1/3', { 'set-02': { boss: { clear: true, tries: 2 } }, 'set-04': { b1: { clear: true, tries: 1 }, b2: { clear: true, tries: 1 }, b3: { clear: true, tries: 3 } } });
      await DS.Net.set('live/1-1', { open: true, code: '123456', no: 5, theme: '07-volcano', at: Date.now() });
      await DS.Camp.enter(m);
    }, me);
    await p.waitForTimeout(2500);
    const st = await p.evaluate(() => ({
      scroll: document.documentElement.scrollHeight, gateOn: getComputedStyle(document.querySelector('.cs-gate-on')).opacity, gateLabel: document.querySelector('#camp-gate .camp-label').textContent,
      lamps: [...document.querySelectorAll('.cs-lamp')].map((e) => e.className.replace('cs-lamp ', '')).join(','), plate: document.querySelector('.camp-plate').textContent.trim(),
      stats: [...document.querySelectorAll('.st-row')].map((e) => e.textContent.replace(/[★\s]/g, '')).join(' '), next: document.querySelector('.st-next').textContent.trim(),
      hidden: getComputedStyle(document.querySelector('#camp-castle .camp-label')).opacity,
    }));
    log.push(`${nm}: 높이 ${st.scroll}/${vp.height} · 문 빛 ${st.gateOn} · 「${st.gateLabel}」 · 등불 ${st.lamps} · 성채 이름표 투명도 ${st.hidden}`);
    log.push(`   이름표 「${st.plate}」 · ${st.stats} · ${st.next}`);
    await p.screenshot({ path: `${OUT}/camp-${nm}.png` });
    if (nm === 's360') {
      await p.click('#camp-castle'); await p.waitForTimeout(1500); log.push('성채 → ' + (await p.evaluate(() => document.querySelector('.screen.active').id)));
      await p.evaluate((m) => DS.Camp.enter(m), me); await p.waitForTimeout(1200);
      await p.click('#camp-tent'); await p.waitForTimeout(1500); log.push('텐트 → 책장 창: 차시 ' + (await p.locator('.sh-l').count()) + '개');
    }
    await p.close();
  }
  // 교사 캠프 (교사 폰 · 종합상황실)
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push('T: ' + e.message)); T.on('dialog', (d) => d.accept());
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  const { code, hallKey } = await T.evaluate(() => DS.Act.createRoom('set-05', '1-1'));
  await T.evaluate(([c, k]) => DS.TCamp.enter({ code: c, hallKey: k }), [code, hallKey]); await T.waitForTimeout(2000);
  log.push('교사 캠프: ' + (await T.evaluate(() => ['tc-castle', 'tc-tent', 'tc-gate', 'tc-anvil', 'tc-dummy', 'tc-mail'].map((i) => (document.getElementById(i) ? i.slice(3) : '없음:' + i)).join(' ') + ' · 등불 ' + [...document.querySelectorAll('#tcamp .cs-lamp')].map((e) => e.className.replace('cs-lamp ', '')).join(','))));
  await T.screenshot({ path: `${OUT}/tcamp-phone.png`, fullPage: true });
  const H = await ctx.newPage(); await H.setViewportSize({ width: 1600, height: 900 }); H.on('pageerror', (e) => errs.push('H: ' + e.message));
  await H.goto(`${U}&role=hall&code=${code}&key=${hallKey}`); await H.waitForTimeout(2500);
  await H.screenshot({ path: `${OUT}/tcamp-hall.png` });
  console.log(log.join('\n')); console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
