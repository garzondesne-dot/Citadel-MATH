// 🚑 2026-11-13 체험판 화면 = 학생 폰만 · 「📺 TV 화면」 단추 하나로 TV(종합실) ↔ 학생 화면 (같은 자리) · 진행 그대로 — 3차시 · 7차시 × 폰 360 · PC 1280 · node tools/e2e/e2e125.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/trial/`;
(async () => {
  const b = await chromium.launch(); const errs = []; let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) pass++; else fail++; console.log(`${c ? '✔' : '✘'} ${m}`); };
  for (const [card, vp, nm] of [['set-03', { width: 360, height: 780 }, '3-phone'], ['trial-07', { width: 360, height: 780 }, '7-phone'], ['set-03', { width: 1280, height: 720 }, '3-pc'], ['trial-07', { width: 1280, height: 720 }, '7-pc']]) {
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(`${nm}: ${e.message}`)); p.on('dialog', (d) => d.accept());
    const bar = () => p.evaluate(() => (document.querySelector('#test-bar') || {}).innerText || '');
    const step = () => p.evaluate(async () => { const c = Object.keys((await DS.Net.get('rooms')) || {}).pop(); return c ? ((await DS.Net.get(`rooms/${c}/state/step`)) ?? -1) : null; });
    const tv = () => p.evaluate(() => { const t = document.getElementById('test-tv'), bt = document.getElementById('tb-tvv'), tb = document.getElementById('test-bar'); if (!t) return { none: true, btn: bt ? bt.textContent : '' }; const r = t.getBoundingClientRect(), cs = getComputedStyle(t);
      return { vis: cs.visibility, show: t.classList.contains('tv-show'), btn: bt ? (bt.dataset.tv === '1' ? '학생 화면' : 'TV 화면') : '', btnR: bt ? bt.getBoundingClientRect().toJSON() : null, bottom: Math.round(r.bottom), barTop: Math.round(tb.getBoundingClientRect().top), stu: document.getElementById('screen-student').classList.contains('active'), over: tb.scrollWidth > tb.clientWidth + 1 || [...tb.children].some((x) => x.getBoundingClientRect().right > innerWidth + 1), pad: getComputedStyle(document.body).getPropertyValue('--tvh').trim() }; });
    await p.goto(U); await p.waitForTimeout(3500);
    await p.fill('#tp-name', '이선생'); await p.click('.tp-h1[data-h="1"]'); await p.click(`[data-go="${card}"]`); await p.waitForTimeout(3500);
    await p.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove()));
    await p.click('#camp-gate'); await p.waitForTimeout(4000);
    for (let k = 0; k < 15; k++) { if (/수업 시작 ▶ \(5/.test(await bar())) break; await p.waitForTimeout(1000); }
    await p.click('#tb-next'); await p.waitForTimeout(2500);
    let t = await tv();
    ok(!t.none && t.vis === 'hidden' && !t.show && /TV 화면/.test(t.btn) && t.stu && (t.pad === '0px' || t.pad === '') && !t.over, `${nm}: 처음 = 학생 화면만 (TV 숨김 · 단추 「${t.btn}」 · 막대 넘침 없음)`);
    await p.screenshot({ path: `${OUT}/125-${nm}-student.png` });
    const r0 = t.btnR, s0 = await step();
    await p.click('#tb-tvv'); await p.waitForTimeout(900); t = await tv();
    ok(t.vis === 'visible' && t.show && /학생 화면/.test(t.btn) && Math.abs(t.bottom - t.barTop) <= 2, `${nm}: 📺 → TV 화면 (막대 위 가득 · 단추 「${t.btn}」)`);
    ok(r0 && t.btnR && Math.abs(r0.y - t.btnR.y) < 2, `${nm}: 단추 같은 줄(막대)`);
    await p.screenshot({ path: `${OUT}/125-${nm}-tv.png` });
    await p.click('#tb-next'); await p.waitForTimeout(2500); const s1 = await step(); t = await tv();
    ok(s1 === s0 + 1 && t.show && /학생 화면/.test(t.btn), `${nm}: TV 화면에서 다음 ▶ = 진행 (${s0} → ${s1}) · TV 그대로`);
    await p.click('#tb-tvv'); await p.waitForTimeout(900); t = await tv(); const s2 = await step();
    ok(t.vis === 'hidden' && t.stu && /TV 화면/.test(t.btn) && s2 === s1, `${nm}: 📱 → 학생 화면 · 진행 그대로 (${s2})`);
    await p.click('#tb-tvv'); await p.waitForTimeout(600); await p.click('#tb-tvv'); await p.waitForTimeout(600); t = await tv(); ok(t.vis === 'hidden' && (await step()) === s1, `${nm}: 한 번 더 왕복`);
    await ctx.close();
  }
  console.log(`e2e125: 확인 ${pass} · 실패 ${fail}`, errs.length ? `errors: ${errs.join(' | ')}` : 'errors: none'); await b.close(); process.exit(fail || errs.length ? 1 : 0);
})();
