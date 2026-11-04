// 👾 중단원던전 몬스터 공격 = 45초마다 1초 멈춤 (2026-11-04 버그 고침 · 전에는 「20초마다 45초 멈춤」) — node tools/e2e/e2e46.js <출력 폴더>
//   기본값 확인 + 시간을 줄인 시험값(DS_ATK = 레이드와 같은 세 칸 [빠름, 느림, 멈춤])으로 실제 전투 화면에서 멈춤 글자 · 길이를 잼
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  const def = await p.evaluate(() => DS.Raid.soloAtk()); log.push(`기본: ${def.per}초마다 ${def.lock}초 멈춤`);
  await p.evaluate(async () => { await DS.Net.set('roster/1-1', { 3: '박도윤' }); await DS.Net.set('unlock/1-1', 5); });
  const me = { c: '1-1', n: 3, name: '박도윤', hero: 3, fx: 'flame' };
  await p.evaluate(() => { window.DS_ATK = { monster: [1, 3, 1], boss: [1, 3, 1] }; }); // 시험: 3초마다 1초
  await p.evaluate((m) => DS.Bonus.enter(m), me); await p.waitForTimeout(900);
  await p.evaluate(() => document.querySelector('[data-fight^="set-05|b"], [data-fight^="set-04|b"], [data-fight]').click()); await p.waitForTimeout(600);
  await p.click('#bf-go'); await p.waitForTimeout(500);
  let txt = '', seen = 0, gone = 0;
  for (let k = 0; k < 60; k++) { await p.waitForTimeout(100); const t = await p.evaluate(() => { const s = document.querySelector('.stun'); return s ? s.textContent : ''; }); if (t && !seen) { seen = k; txt = t; } if (seen && !t && !gone) { gone = k; break; } }
  log.push(`화면 글자: 「${txt.trim()}」 · 멈춤 길이 약 ${((gone - seen) / 10).toFixed(1)}초`);
  await p.screenshot({ path: `${OUT}/1-fight.png` });
  const ok = def.per === 45 && def.lock === 1 && /1초 멈춤/.test(txt) && gone - seen <= 15;
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
