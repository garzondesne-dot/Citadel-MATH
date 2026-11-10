// 🪞 #81 종합실 🎮 시연 = 학생과 같은 소레이드 (2026-11-11): 졸개 → 대장 한 단계씩 · 나의 풀이 한 줄 · 처치 뒤 ⚔ / ⚡ · 숫자 바꾼 사슬 = 근거 빈칸
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e107.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = []; let ok = 0, fail = 0;
  const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  const S1 = await mk('S1'); await S1.goto(U + '&role=student'); await S1.waitForTimeout(1500);
  if (await S1.isVisible('#splash')) { await S1.click('#splash'); await S1.waitForTimeout(500); }
  await S1.selectOption('#s-cls', '1-3'); await S1.waitForTimeout(200); await S1.selectOption('#s-num', '1'); await S1.waitForTimeout(300);
  await S1.click('#s-new'); await S1.fill('#s-p1', '1234'); await S1.fill('#s-p2', '1234'); await S1.click('#s-make'); await S1.waitForTimeout(1200);
  await S1.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S1.click('#s-go'); await S1.waitForTimeout(2000);
  const { code, hallKey: key } = await T.evaluate(() => DS.Act.createRoom('set-06', '1-3'));
  await S1.evaluate(async (c) => { await DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }); }, code).catch(() => {}); await S1.waitForTimeout(1500);
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-06'); for (let i = 0; i < 14; i++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(L, R); if (s && s.id === 'u4') break; await DS.Act.go(c, R, L, 1); } await DS.Net.update(`rooms/${c}/state`, { solve: 0 }); }, code);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(3000);
  console.log('hall:', await H.evaluate(() => [document.querySelector('.screen.active') && document.querySelector('.screen.active').id, !!document.querySelector('#h-demo'), (document.querySelector('#h-step, .h-step') || {}).textContent])); await H.screenshot({ path: `${OUT}/h0.png` });
  await H.evaluate(() => document.querySelector('#h-demo').click()); await H.waitForTimeout(800);
  const st = () => H.evaluate(() => ({ chips: document.querySelectorAll('#h-demo-ov .cr-chip').length, now: (document.querySelector('#h-demo-ov .cr-now b') || {}).textContent || '', story: document.querySelectorAll('#h-demo-ov .cr-story li').length, strike: !!document.querySelector('#h-demo-ov [data-strike]'), q: (document.querySelector('#h-demo-ov .item') || {}).textContent || '' }));
  const s0 = await st(); check(s0.chips >= 2 && /졸개/.test(s0.now), `시연 = 소레이드 단계 (${s0.chips}칸 · ${s0.now})`);
  check(!/풀이는 학습지에/.test(s0.q), '옛 통째 문제(「풀이는 학습지에」) 아님');
  await H.screenshot({ path: `${OUT}/demo-chain.png` });
  // 정답 펼치기 → 정답 입력은 💡 로 확인 · 단계마다 정답을 넣고 공격
  for (let k = 0; k < 8; k++) {
    const r = await H.evaluate(() => { const ov = document.getElementById('h-demo-ov'); if (ov.querySelector('[data-strike]')) return 'done'; const L = DS.Lessons.get('set-06'); return 'go'; });
    if (r === 'done') break;
    await H.evaluate(() => { // 정답 칸 누르기: 보기 data-pick 중 정답 (시연 상태는 내부라 정답 펼치기 글로 찾음)
      document.querySelector('#demo-reveal').click(); });
    await H.waitForTimeout(150);
    await H.evaluate(() => { const ov = document.getElementById('h-demo-ov'); const sol = (ov.querySelector('.sol-line') || {}).textContent || ''; const picks = [...ov.querySelectorAll('[data-pick]')];
      const ans = sol.replace(/^.*정답:\s*/, '').split(' · ')[0];
      const want = ans.split(/[,{}]/).map((x) => x.trim()).filter(Boolean);
      const grp = picks.length && picks[0].closest('.quiz-grp');
      picks.forEach((p) => { const t = p.textContent.replace(/^[①-⑳]\s*/, '').trim(); if (want.includes(t) || t === ans.trim()) p.click(); }); });
    await H.waitForTimeout(150);
    await H.evaluate(() => { const g = document.querySelector('#demo-go'); if (g && !g.disabled) g.click(); }); await H.waitForTimeout(250);
  }
  const s1 = await st(); console.log('끝 상태:', JSON.stringify(s1));
  check(s1.story >= 2, `나의 풀이 줄이 쌓임 (${s1.story})`);
  console.log(`e2e107: 확인 ${ok} · 실패 ${fail}`, 'errors:', errs.length ? errs : 'none');
  await b.close(); if (fail || errs.length) process.exit(1);
})();
