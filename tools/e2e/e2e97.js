// 🔢 #65-3 수업 준비 「숫자 4판 보기」 (2026-11-10): 8차시 몬스터 · 형성평가마다 첫 시도 + 재도전 3 — node tools/e2e/e2e97.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1100, height: 900 } })).newPage(); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  await p.selectOption('#p-lesson', 'set-08'); await p.click('#p-go'); await p.waitForTimeout(1200);
  const look = async (id) => { await p.evaluate((id) => document.querySelector(`[data-open="${id}"]`).click(), id); await p.waitForTimeout(400); await p.evaluate((id) => document.querySelector(`[data-v4="${id}"]`).click(), id); await p.waitForTimeout(400);
    const vs = []; for (let a = 0; a < 4; a++) { await p.evaluate((a) => document.querySelector(`[data-va="${a}"]`).click(), a); await p.waitForTimeout(150); vs.push(await p.evaluate(() => document.querySelector('.v4-list').innerText)); }
    return vs; };
  const m3 = await look('m3');
  ok(m3.length === 4 && /x² = 4/.test(m3[0]) && /정답: \{2\}/.test(m3[0]) && new Set(m3).size === 4, `문제 4: 4판 모두 다름 · 첫 시도 = 학습지 (${m3.map((x) => (x.match(/x² = \d+/) || [''])[0]).join(' · ')})`);
  await p.screenshot({ path: `${OUT}/97-v4.png` });
  await p.evaluate(() => document.querySelector('#v4-x').click());
  const bs = await look('boss');
  ok(bs.length === 4 && /수학은 재미있다/.test(bs[0]) && new Set(bs).size === 4 && /자연수 전체의 집합 → P \{3\}/.test(bs[0].replace(/\s+/g, ' ')), `형성평가 4판 (${bs[0].slice(0, 60).replace(/\n/g, ' ')})`);
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
