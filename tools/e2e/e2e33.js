// ⚒ 모루 4~10차시 (2026-11-03): 연산 · 재료 줄 화면 · 두 번째 연성식(같은 카드 두 장 · 다른 연산) 실제 연성 — node tools/e2e/e2e33.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const errs = [], log = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto('http://localhost:8765/index.html?local&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  await p.evaluate(() => { DS.Quiz.ask = async () => true; DS.Forge.open({ c: '교사', n: 0, name: '선생님', hero: 7, fx: 'twinkle', preview: true }, { preview: true, no: 10 }); }); // 마력 예제는 단위 시험에서 채점 확인
  await p.waitForTimeout(1500);
  log.push('연산 ' + (await p.locator('.fc-ops [data-op]').count()) + '개 · 재료 ' + (await p.locator('.fc-mats [data-put]').count()) + '개');
  await p.screenshot({ path: `${OUT}/forge-10.png` });
  const craft = async (name, op, a, c) => {
    await p.click('#fg-clear').catch(() => {}); await p.waitForTimeout(150);
    await p.click(`[data-op="${op}"]`); await p.waitForTimeout(120);
    for (const t of [a, c].filter(Boolean)) { await p.locator(`.fc-mats [data-put="${t}"]`).first().click(); await p.waitForTimeout(120); }
    await p.click('#fg-hit'); await p.waitForTimeout(2600);
    const msg = await p.evaluate(() => { const r = document.querySelector('.fg-reveal'); return r ? `${r.querySelector('.fg-new').textContent} ${r.querySelector('.fg-name').textContent}` : `실패 · ${(document.getElementById('fg-msg') || {}).textContent || ''}`; });
    if (await p.locator('#fg-keep').count()) { await p.click('#fg-keep'); await p.waitForTimeout(400); }
    log.push(`${name}: ${msg.trim().slice(0, 60)}`);
  };
  await craft('교집합 A ∩ B', 'cap', 'A', 'B');
  await craft('합집합 A ∪ B', 'cup', 'A', 'B');
  await craft('교환법칙 ② [합집합] = [합집합]', 'eq', 'card:union', 'card:union');
  await craft('여집합 ② U − A', 'minus', 'U', 'A');
  await craft('드모르간 ① ② [여집합] ∩ [여집합]', 'cap', 'card:comp', 'card:comp');
  await craft('실수: B − A', 'minus', 'B', 'A');
  const owned = await p.evaluate(() => [...document.querySelectorAll('.fc-mats [data-put^="card:"]')].map((e) => e.dataset.put.slice(5)));
  log.push('가진 카드: ' + owned.join(', '));
  await p.screenshot({ path: `${OUT}/forge-after.png` });
  console.log(log.join('\n')); console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
