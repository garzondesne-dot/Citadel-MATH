const { chromium } = require('playwright');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [w, h] of [[390, 844], [360, 640]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
    await p.goto('http://localhost:8765/index.html?local&role=teacher'); await p.waitForTimeout(1200);
    await p.fill('#f-teacher .t-id', process.env.E2E_ID || 'e2e-teacher'); await p.fill('#f-teacher .t-pw', process.env.E2E_PW || '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
    await p.selectOption('#p-lesson', 'set-05'); await p.click('#x-go'); await p.waitForTimeout(2500);
    await p.screenshot({ path: `${OUT}/camp-${w}.png` });
    await p.click('#camp-anvil'); await p.waitForTimeout(1500);
    const m = await p.evaluate(() => { const ov = document.getElementById('forge'); return { scroll: ov.scrollHeight - ov.clientHeight, hammerOp: getComputedStyle(document.getElementById('fg-hammer')).opacity, ops: document.querySelectorAll('.fc-ops .fc-tile').length, mats: document.querySelectorAll('.fc-mats .fc-tile').length, hitVisible: (() => { const r = document.getElementById('fg-hit').getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0; })() }; });
    console.log(w + 'x' + h, JSON.stringify(m));
    await p.screenshot({ path: `${OUT}/forge-${w}.png` });
    // 재료 · 연산 · 재료 올리고 연성 (아무 조합 — 실패해도 망치 대신 흔들림) → 힌트 창
    await p.click('#fg-hints'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/hints-${w}.png` });
    console.log('hint groups:', await p.evaluate(() => [...document.querySelectorAll('.fc-hgroup summary')].map((s) => s.textContent.replace(/\s+/g, ' ').trim()).join(' | ')));
    await p.click('#fg-hx'); await p.waitForTimeout(300);
    // 성공 연성: 첫 레시피를 그대로 넣기 (망치 등장 프레임)
    const ok = await p.evaluate(() => { const c = DS.Unit.CARDS.find((x) => x.no <= 5); return c ? { op: c.op, a: c.in[0], b: c.in[1] } : null; });
    await p.evaluate(({ op, a, b }) => { document.querySelector(`[data-op="${op}"]`).click(); }, ok); await p.waitForTimeout(200);
    for (const t of [ok.a, ok.b].filter(Boolean)) { const el = await p.$(`[data-put="${t}"]`); if (el) { await el.click(); await p.waitForTimeout(150); } }
    await p.screenshot({ path: `${OUT}/slots-${w}.png` });
    await p.close();
  }
  console.log('ERRORS', errs.length, errs.slice(0, 5)); await b.close();
})();
