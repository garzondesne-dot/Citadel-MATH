// 🎯 허수아비 · 📘 보강던전: 모든 차시 · 모든 몬스터 「전투 시작」 → 문제 창이 뜨는지 (2026-11-03 'find' 오류 회귀) — node tools/e2e/e2e34.js
const { chromium } = require('playwright');
const U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = [], bad = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  await p.evaluate(() => { DS.Control.run = async (f) => { try { return await f(); } catch (e) { window.__errs = (window.__errs || []).concat(e.message); } }; });
  let n = 0;
  for (const train of [true, false]) {
    await p.evaluate((t) => DS.Bonus.enter({ c: '교사', n: 0, name: '선생님', hero: 0, fx: 'flame', preview: true }, { preview: true, train: t, no: 99 }), train); await p.waitForTimeout(800);
    const ids = await p.evaluate(() => [...document.querySelectorAll('[data-fight]')].map((e) => e.dataset.fight));
    for (const id of ids) {
      await p.evaluate((i) => { window.__errs = []; document.querySelector(`[data-fight="${i}"]`).click(); }, id); await p.waitForTimeout(500);
      const go = p.locator('#bf-go'); if (await go.count()) { await go.click(); await p.waitForTimeout(600); }
      const st = await p.evaluate(() => ({ quiz: !document.getElementById('quiz').classList.contains('hidden') && document.getElementById('quiz-q').textContent.trim().length > 0, err: (window.__errs || []).join(' / ') }));
      n++; if (!st.quiz || st.err) bad.push(`${train ? '허수아비' : '보강'} ${id}: ${st.quiz ? '' : '문제 창 없음 '}${st.err}`);
      await p.evaluate(() => { document.getElementById('quiz').classList.add('hidden'); document.querySelectorAll('.bn-fight, .modal:not(#quiz)').forEach((e) => e.remove()); });
      await p.evaluate((t) => DS.Bonus.enter({ c: '교사', n: 0, name: '선생님', hero: 0, fx: 'flame', preview: true }, { preview: true, train: t, no: 99 }), train); await p.waitForTimeout(400);
    }
  }
  console.log(`몬스터 ${n}마리 확인 · 문제 ${bad.length ? `실패 ${bad.length}` : '모두 뜸'}`); bad.forEach((x) => console.log(' ✘', x));
  console.log('errors:', errs.length ? errs.slice(0, 5) : 'none'); await b.close(); process.exit(bad.length || errs.length ? 1 : 0);
})();
