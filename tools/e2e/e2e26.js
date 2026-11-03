// 종합상황실 학습지 크기 · 용사 겹침 확인: 1600×900 · 1366×768 · 1920×1080 에서 개념 · 문제 해설 그림이 칸 안에 다 들어가는지, 용사가 해설 위로 올라오지 않는지
// 사용: 출력 폴더에 wide.png · tall.png (위 · 아래 표시 그림)를 두고, python3 -m http.server 8765 띄운 뒤 node tools/e2e/e2e26.js <출력 폴더>
const { chromium } = require('playwright'); const fs = require('fs');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(`${OUT}/${f}.png`).toString('base64');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const T = await ctx.newPage(); T.on('dialog', (d) => d.accept());
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  await T.evaluate(async ([w, t]) => { await DS.Net.set('prep/set-04/img/m1', w); await DS.Net.set('prep/set-04/img/c1', t); await DS.Net.set('prep/set-04/has/m1', true); await DS.Net.set('prep/set-04/has/c1', true); }, [b64('wide'), b64('tall')]);
  await T.selectOption('#lesson', 'set-04'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(1500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  await T.evaluate(async (c) => { for (let h = 0; h < 18; h++) await DS.Net.set(`rooms/${c}/players/v${h}`, { num: h + 1, nick: `용사${h}`, hero: h % 17, at: Date.now() }); }, code);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  await go(); await T.waitForTimeout(500); await T.evaluate(async (c) => { for (let h = 0; h < 18; h++) await DS.Net.set(`rooms/${c}/active/v${h}`, true); }, code);
  const stepId = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const st = DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), R); return st ? st.id : ''; });
  const H = await ctx.newPage();
  for (const [w, h] of [[1600, 900], [1366, 768], [1920, 1080]]) {
    await H.setViewportSize({ width: w, height: h }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(1500);
    for (let k = 0; k < 6 && (await stepId()) !== 'c1'; k++) { await go(); await T.waitForTimeout(400); }
    await H.waitForTimeout(1200); await H.screenshot({ path: `${OUT}/c1-${w}.png` });
    await H.click('.h-half[data-zoom="l"], .h-concept[data-zoom]'); await H.waitForTimeout(500); await H.screenshot({ path: `${OUT}/c1z-${w}.png` }); console.log(w, 'concept zoom:', await H.evaluate(() => { const c = document.querySelector('.h-concept'); return c.className + ' bg=' + getComputedStyle(c).backgroundColor; })); await H.click('.h-concept'); await H.waitForTimeout(400);
    for (let k = 0; k < 6 && (await stepId()) !== 'm1'; k++) { await go(); await T.waitForTimeout(400); }
    await T.evaluate(async () => { await DS.Act.setSheet(DS.Teacher.code(), true); }); await H.waitForTimeout(1500);
    const r = await H.evaluate(() => { const i = document.querySelector('#h-sheet-ov img'), a = document.querySelector('#h-arena'); if (!i) return 'no img'; const ir = i.getBoundingClientRect(), ar = a.getBoundingClientRect(); return { imgTop: Math.round(ir.top - ar.top), imgBottomGap: Math.round(ar.bottom - ir.bottom), heroAbove: [...document.querySelectorAll('.fh2')].some((h) => +getComputedStyle(h).zIndex >= 30) }; });
    console.log(w, h, 'sheet:', JSON.stringify(r));
    await H.screenshot({ path: `${OUT}/m1-${w}.png` });
    await H.click('#h-sheet-ov img'); await H.waitForTimeout(400); await H.screenshot({ path: `${OUT}/m1z-${w}.png` }); console.log(w, 'sheet zoom:', await H.evaluate(() => document.querySelector('#h-sheet-ov').className)); await H.click('#h-sheet-ov'); await H.waitForTimeout(300);
    await T.evaluate(async () => { await DS.Act.setSheet(DS.Teacher.code(), false); });
    // 처음으로 되돌려 다음 크기
    await T.evaluate(async () => { const code = DS.Teacher.code(); await DS.Net.update(`rooms/${code}/state`, { step: 0 }); });
  }
  await b.close();
})();
