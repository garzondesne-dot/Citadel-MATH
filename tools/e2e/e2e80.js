// 🕶 #36 ?anon = 개발자 이름 숨김 (2026-11-09) — node tools/e2e/e2e80.js <출력 폴더>
//   실제 게임 · 체험판 trial/ · ?anon 없으면 그대로 · 같은 탭에서 주소의 ?anon 을 빼고 다시 열어도 유지
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', B = 'http://localhost:8765/';
(async () => {
  const b = await chromium.launch(); let bad = 0; const log = [], errs = [];
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const has = (p) => p.evaluate(() => document.documentElement.outerHTML.includes('김찬우'));
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(B + 'index.html'); await p.waitForTimeout(2000); ok(await has(p), '평소 = 이름 보임');
  await p.goto(B + 'index.html?anon'); await p.waitForTimeout(2000); ok(!(await has(p)), `?anon = 이름 없음 · 꼬리표 「${await p.evaluate(() => document.getElementById('ver-tag').textContent)}」`);
  await p.screenshot({ path: `${OUT}/80-anon-home.png` });
  await p.goto(B + 'index.html'); await p.waitForTimeout(2000); ok(!(await has(p)), '같은 탭에서 ?anon 빼고 다시 열어도 숨김 유지');
  const p2 = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); p2.on('pageerror', (e) => errs.push(e.message));
  await p2.goto(B + 'trial/?anon'); await p2.waitForTimeout(4000); ok(!(await has(p2)), '체험판 ?anon = 이름 없음');
  await p2.fill('#tp-name', '선생'); await p2.click('.tp-h1[data-h="2"]'); await p2.click('#tp-go'); await p2.waitForTimeout(3500);
  ok(!(await has(p2)), '체험판 캠프로 옮겨도 이름 없음'); await p2.screenshot({ path: `${OUT}/80-anon-trial-camp.png` });
  const p3 = await (await b.newContext()).newPage(); await p3.goto(B + 'trial/'); await p3.waitForTimeout(4000); ok(await has(p3), '체험판 평소 = 이름 보임');
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
