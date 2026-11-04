// 🔄 컴시간 스위치 (2026-11-04 · v0.9.7.2): 시간표 창 「컴시간 시간표 쓰기」 켜기 → 노란 칸(컴시간) · 고친 칸 우선 · 저장 → 예약 방 — 로컬 시험이라 sched/comci 는 시험용 값 — node tools/e2e/e2e44.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push(e.message)); T.on('dialog', (d) => d.accept());
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(async () => { for (const c of ['1-1', '1-3', '1-5']) await DS.Net.set(`roster/${c}/1`, '가');
    await DS.Net.set('sched/comci', { ok: true, at: DS.Net.now(), n: 3, week: { '2-1': '1-3', '3-3': '1-3', '1-5': '1-5' } }); }); // 월 5 는 자율 → 빠져야 함
  await T.click('#t-today [data-sc]'); await T.waitForTimeout(800);
  log.push('스위치 보임: ' + (await T.isVisible('#sc-comci')));
  await T.check('#sc-comci'); await T.waitForTimeout(1200);
  const cells = await T.evaluate(() => [...document.querySelectorAll('.sc-edit td.sc-auto select')].map((s) => `${s.dataset.dp}=${s.value}`));
  log.push('노란 칸: ' + cells.join(' '));
  await T.selectOption('.sc-edit select[data-dp="3-3"]', ''); await T.selectOption('.sc-edit select[data-dp="4-2"]', '1-1'); // 컴시간 칸 비우기 · 수동 칸 추가
  await T.screenshot({ path: `${OUT}/1-editor.png` });
  await T.click('.sc-edit #sc-save'); await T.waitForTimeout(2500);
  const st = await T.evaluate(async () => ({ week: await DS.Net.get('sched/week'), eff: (await DS.Sched.effective()).week }));
  log.push('수동 저장: ' + JSON.stringify(st.week) + ' · 합친 시간표: ' + JSON.stringify(st.eff));
  const ok = cells.length === 2 && !cells.some((c) => c.startsWith('1-5')) && st.week['3-3'] === '-' && st.week['4-2'] === '1-1' && !st.week['2-1'] && JSON.stringify(st.eff) === JSON.stringify({ '2-1': '1-3', '4-2': '1-1' });
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
