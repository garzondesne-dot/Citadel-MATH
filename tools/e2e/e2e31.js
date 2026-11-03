// 📊 학급 대시보드 (교사만): 가짜 기록 8명 × 3차시 → 표 · 랭킹 · 주의 학생 · 개념별 약점 · 세특 메모 — node tools/e2e/e2e31.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  await p.evaluate(async () => {
    const names = ['김민준', '이서연', '박도윤', '최하은', '정시우', '강지유', '조주원', '윤서아'];
    await DS.Net.set('roster/1-1', Object.fromEntries(names.map((n, i) => [i + 1, n])));
    await DS.Net.set('roster/1-2', { 1: '한지민', 2: '오세훈', 3: '임하늘' });
    for (let n = 1; n <= 3; n++) await DS.Net.set(`records/1-2/${n}`, { 'set-02': { no: 2, conc: { c1: [n, 3] }, names: { c1: '조건제시법' }, boss: 2 + n, bossN: 5, won: true, fixed: n, perfects: 0 } });
    const L = ['set-02', 'set-03', 'set-04'].map((id) => DS.Lessons.get(id));
    for (let i = 0; i < names.length; i++) {
      const n = i + 1, rec = {};
      L.forEach((l, k) => {
        if ((i === 6 && k === 2) || (i === 7 && k > 0)) return; // 불참
        const conc = {}, titles = {};
        l.steps.filter((s) => s.kind === 'concept').forEach((s, j) => { const tot = 3 + (j % 2); conc[s.id] = [Math.max(0, tot - ((i + j + k) % 4)), tot]; titles[s.id] = s.title.replace(/^개념 \d+ · /, ''); });
        rec[l.id] = { no: l.no, conc, names: titles, boss: Math.max(1, l.boss.hpItems - ((i + k) % 5)), bossN: l.boss.hpItems, won: true, fixed: (i * 3 + k) % 6, perfects: i % 3, miss: [], weak: [] };
      });
      await DS.Net.set(`records/1-1/${n}`, rec);
      await DS.Net.set(`xp/1-1/${n}`, { total: 40 + i * 37 });
      if (i % 3 === 0) await DS.Net.set(`bonus/1-1/${n}`, { 'set-04': { b1: { clear: true, tries: 2 + i } } });
      if (i % 2 === 0) await DS.Net.set(`cards/1-1/${n}`, { belong: true, roster: true, subset: true });
    }
  });
  await p.click('#d-go'); await p.waitForTimeout(1500);
  for (const t of ['table', 'rank', 'watch', 'weak', 'memo']) { await p.click(`[data-tab="${t}"]`); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/d-${t}.png`, fullPage: true }); }
  await p.click('[data-tab="table"]'); await p.waitForTimeout(300); await p.click('[data-sort="boss"]'); await p.waitForTimeout(300);
  const top = await p.locator('.dash-t tr:nth-child(2) td:nth-child(2)').innerText();
  await p.click('[data-cls="*"]'); await p.waitForTimeout(1200);
  for (const t of ['table', 'rank']) { await p.click(`[data-tab="${t}"]`); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/all-${t}.png`, fullPage: true }); }
  console.log('전체: 학생', await p.evaluate(() => document.querySelectorAll('.dash-board .dash-rank')[0] ? document.querySelectorAll('.dash-board')[1].querySelectorAll('li').length : 0), '명 · 반 대항전', await p.locator('.dash-vs tr').count() - 1, '반');
  console.log('형성평가 정렬 1위:', top, '· 메모 예:', (await p.evaluate(() => document.body.innerText.includes('게임 기반 협동 레이드'))));
  console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
