// 💡 그림 힌트 (2026-11-04 · v0.9.7.4): 6차시 테스트 모드 → 문제 1 「💡 그림 힌트」 펼치기 → 센 수 1 · 문제 4(명제)엔 버튼 없음 — node tools/e2e/e2e45.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  await p.selectOption('#p-lesson', 'set-06'); await p.click('#x-go'); await p.waitForTimeout(2500);
  await p.click('#camp-gate'); await p.waitForTimeout(3500);
  const next = async () => { await p.click('#tb-next'); await p.waitForTimeout(1200); };
  for (let k = 0; k < 6; k++) { const t = await p.textContent('.tb-step'); if (/문제 1/.test(t)) break; await next(); }
  await p.waitForTimeout(800);
  const btn = await p.$('.item .hint-btn'); log.push('문제 1 힌트 버튼: ' + (await p.$$('.item .hint-btn')).length + '개');
  if (btn) { await btn.click(); await p.waitForTimeout(500); }
  const figs = (await p.$$('.item .hint-fig svg')).length; log.push('펼친 그림: ' + figs);
  await p.screenshot({ path: `${OUT}/1-hint.png`, fullPage: true });
  const n = await p.evaluate(() => DS.Student.hintCount()); log.push('센 힌트 수: ' + n);
  // 문제 4(명제)까지 넘겨서 버튼이 없는지
  for (let k = 0; k < 10; k++) { const t = await p.textContent('.tb-step'); if (/문제 4/.test(t) && !/4-2/.test(t)) break; await next(); }
  await p.waitForTimeout(800);
  const m4 = (await p.$$('.item .hint-btn')).length; log.push('문제 4(명제) 힌트 버튼: ' + m4 + '개 · 단계: ' + (await p.textContent('.tb-step')).trim());
  const ok = !!btn && figs === 1 && n === 1 && m4 === 0;
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
