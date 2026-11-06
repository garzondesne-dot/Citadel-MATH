// 📈 활용 추이 (2026-11-06): 학생 접속 · 수업 참여가 act/{반}/{날짜}/{번호} 에 쌓이는지 + 대시보드 「📈 활용 추이」 (주별 막대 · 숫자 4개 · 학생별 · ≈ 추정) — node tools/e2e/e2e68.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.setViewportSize({ width: 1400, height: 900 }); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연\n3 박지호\n4 최유나\n5 정하늘'); await T.click('#r-up'); await T.waitForTimeout(800);
  // 실제 학생 1명: 캠프 접속 → 수업 입장
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  const { code } = await T.evaluate(() => DS.Act.createRoom('set-05', '1-3'));
  await S.evaluate(async (c) => { await DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }); }, code).catch(() => {}); await S.waitForTimeout(1500);
  log.push('오늘 1번 기록: ' + JSON.stringify(await T.evaluate(async () => { const d = DS.Usage.day(); const v = await DS.Net.get(`act/1-3/${d}/1`); return v && { v: v.v, j: v.j }; })));
  // 지난 7주 가짜 기록 (점점 늘어남) + 기록 전 추정용 💎 로그
  await T.evaluate(async () => {
    const today = DS.Usage.day(), mon = DS.Usage.monday(today);
    for (let w = 1; w <= 6; w++) for (let k = 0; k < 5; k++) { const d = DS.Usage.addDays(mon, -7 * w + k); for (let n = 2; n <= 5; n++) { if ((n + w + k) % (w > 3 ? 4 : 2)) continue; await DS.Net.set(`act/1-3/${d}/${n}`, { v: 1, r: Math.max(0, 6 - w) + (n % 2), c: w < 3 ? 1 : 0, f: k % 2, at: Date.now() }); } }
    const old = Date.now() - 9 * 7 * 86400e3; await DS.Net.set('gem/1-3/3/log', { review_a: { g: 1, at: old, why: '복습으로 해결' }, room_x: { g: 3, at: old + 86400e3, why: '성채 방 처치' } });
  });
  await T.evaluate(() => DS.Dash.enter()); await T.waitForTimeout(1500);
  await T.click('[data-cls="1-3"]').catch(() => {}); await T.waitForTimeout(800);
  await T.click('[data-tab="use"]'); await T.waitForTimeout(2000);
  log.push('숫자: ' + (await T.$$eval('.use-tile', (x) => x.map((e) => e.textContent.replace(/\s+/g, ' ').trim()).join(' | '))));
  log.push('막대: ' + (await T.$$eval('.use-chart', (x) => x.map((e) => `${e.querySelector('.use-h').textContent}=${[...e.querySelectorAll('.use-col')].map((c) => c.dataset.tip.split('·')[1].trim()).join(',')}`).join(' / '))));
  log.push('학생 줄: ' + (await T.$$eval('.use-table tbody tr', (x) => x.length)) + ' · 2주 넘게 없음 ' + (await T.$$eval('.use-tag', (x) => x.length)));
  await T.screenshot({ path: `${OUT}/68-use.png`, fullPage: true });
  console.log(log.join('\n')); console.log('errors', errs.length ? errs : 'none'); await b.close();
})();
