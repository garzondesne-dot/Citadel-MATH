// 👑 교사 시연: 2~6차시 보스(형성평가) 세트 1 · 2 를 종합상황실 시연 창에 그리고, 정답을 넣으면 「선생님의 일격」이 나오는지
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e27.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 });
  for (const lid of ['set-02', 'set-03', 'set-04', 'set-05', 'set-06']) {
    const { code, hallKey: key } = await T.evaluate((lid) => DS.Act.createRoom(lid, '1-3'), lid);
    await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/v1`, { num: 1, nick: '용사', hero: 0, at: Date.now() }); }, code);
    await T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const L = DS.Lessons.get(R.meta.lesson); await DS.Act.go(c, R, L, 1); await DS.Net.set(`rooms/${c}/active/v1`, true); await DS.Net.update(`rooms/${c}/state`, { step: L.steps.findIndex((s) => s.kind === 'boss'), focus: false }); }, code);
    await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2000);
    const btn = await H.textContent('#h-demo').catch(() => 'none');
    const res = [];
    for (const set of [0, 1]) {
      await H.click('#h-demo'); await H.waitForTimeout(400); if (set) { await H.click('#h-demo-ov [data-da="1"]'); await H.waitForTimeout(300); }
      const n = await H.$$eval('#h-demo-ov .demo-items > .item, #h-demo-ov .demo-items > .demo-bwrap', (x) => x.length); // 2026-11-06: 한 화면 시연
      // 정답 채우기 (화면 칸으로 직접)
      const ok = await H.evaluate(async ([lid, set]) => {
        const L = DS.Lessons.get(lid), items = L.boss.sets[set ? 2 : 1];
        const right = (q) => (q.type === 'choice' ? q.answerIndex : q.type === 'blanks' ? q.items.map((i) => i.answer) : q.type === 'subsets' ? DS.SetGen.allSubsets(q.base) : q.answer);
        return items.map((q) => DS.Quiz.grade(q, right(q))).every(Boolean) ? items.map((q) => q.type).join(',') : 'grade-fail';
      }, [lid, set]);
      res.push(`세트${set + 1}: ${n}칸 (${ok})`);
      await H.click('#demo-x'); await H.waitForTimeout(300);
    }
    console.log(lid, '버튼:', btn, '|', res.join(' · '));
  }
  // 2026-11-06: 형성평가 시연 = 한 화면 · 「부분집합 모두 쓰기」 문항만 학생과 같은 입력 창 (3차시 4번) → 입력 창이 시연 창 위에 뜨는지
  {
    const { code, hallKey: key } = await T.evaluate(() => DS.Act.createRoom('set-03', '1-3'));
    await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/v1`, { num: 1, nick: '용사', hero: 0, at: Date.now() }); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const L = DS.Lessons.get(R.meta.lesson); await DS.Act.go(c, R, L, 1); await DS.Net.update(`rooms/${c}/state`, { step: L.steps.findIndex((s) => s.kind === 'boss'), focus: false }); }, code);
    await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2000);
    await H.click('#h-demo'); await H.waitForTimeout(400);
    await H.click('#h-demo-ov [data-ask]'); await H.waitForTimeout(400);
    console.log('부분집합 입력 창 z:', await H.evaluate(() => { const q = document.getElementById('quiz'); return q && !q.classList.contains('hidden') ? getComputedStyle(q).zIndex : 'none'; }), '· 시연 창 z:', await H.evaluate(() => getComputedStyle(document.getElementById('h-demo-ov')).zIndex));
    await H.screenshot({ path: `${OUT}/boss-demo-quiz.png` });
  }
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
