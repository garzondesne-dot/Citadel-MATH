// 📚 성취기준 ⑥ · 🔎 오개념 ⑦ 탭 · 세특 문장 · 학생 결과 「자주 하는 실수」 한 줄 — node tools/e2e/e2e35.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  await p.evaluate(async () => {
    const names = ['김민준', '이서연', '박도윤', '최하은', '정시우', '강지유'];
    await DS.Net.set('roster/1-1', Object.fromEntries(names.map((n, i) => [i + 1, n])));
    const L = ['set-02', 'set-03', 'set-04', 'set-06'].map((id) => DS.Lessons.get(id));
    const MIS = [{ M01: [2, 2] }, { M03: [1, 0], M04: [2, 1] }, { M08: [3, 1] }, {}, { M01: [1, 0] }, { M11: [2, 2], M13: [1, 0] }];
    for (let i = 0; i < names.length; i++) {
      const n = i + 1, rec = {};
      L.forEach((l, k) => {
        const conc = {}, titles = {};
        l.steps.filter((s) => s.kind === 'concept').forEach((s, j) => { const tot = 4; conc[s.id] = [Math.max(0, tot - ((i + j + k) % 4) - (i > 3 ? 1 : 0)), tot]; titles[s.id] = s.title.replace(/^개념 \d+ · /, ''); });
        rec[l.id] = { no: l.no, conc, names: titles, boss: l.boss.hpItems - (i % 3), bossN: l.boss.hpItems, won: true, fixed: i, perfects: 0, miss: [], weak: [], ...(k === 1 || k === 3 ? { mis: MIS[i] } : {}) };
      });
      await DS.Net.set(`records/1-1/${n}`, rec);
      if (i === 2) await DS.Net.set(`bonus/1-1/${n}`, { 'set-04': { b1: { clear: true, tries: 3, mis: { M09: [1, 1] } } } });
    }
  });
  await p.click('#d-go'); await p.waitForTimeout(1500);
  for (const t of ['std', 'mis', 'memo']) { await p.click(`[data-tab="${t}"]`); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/d-${t}.png`, fullPage: true }); }
  const txt = await p.evaluate(() => document.body.innerText);
  console.log('세특 성취기준 문장:', txt.includes('성취기준에 안정적으로 도달'), '· 오개념 문장:', txt.includes('스스로 바로잡음'));
  await p.click('[data-tab="mis"]'); await p.waitForTimeout(300);
  console.log('⑦ 탭 M01 · M09(보강):', await p.evaluate(() => { const t = document.getElementById('screen-dash').innerText; return [t.includes('∈ ↔ ⊂'), t.includes('겹친 부분')]; }));
  // 학생 결과 · 우편함 한 줄
  const line = await p.evaluate(() => { const d = document.createElement('div'); d.innerHTML = DS.Mis.top({ M03: [2, 1], M01: [1, 1] }, 1).map((t) => t.kid).join(''); return d.textContent; });
  console.log('학생 한 줄:', line);
  console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
