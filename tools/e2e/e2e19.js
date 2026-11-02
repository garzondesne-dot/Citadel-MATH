// v0.9.6 📦 지난 차시 정리: 수업 준비 → 이 차시 수업 찾기 → 백업 파일 받기 → 서버에서 지우기 (학생 성장 기록은 남음)
// 사용: python3 -m http.server 8765 띄운 뒤 node tools/e2e/e2e19.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); const errs = [];
  const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push(e.message)); T.on('dialog', (d) => d.accept());
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  // 끝난 4차시 수업 2개 + 진행 중 1개 + 5차시 1개 · 학습지 이미지 · 학생 기록
  await T.evaluate(async () => {
    const room = (lesson, closed) => ({ meta: { lesson, teacher: DS.Net.uid(), code: 'x' }, state: { step: 3, closed: closed || null }, players: {} });
    await DS.Net.set('rooms/111111', room('set-04', true)); await DS.Net.set('rooms/222222', room('set-04', true)); await DS.Net.set('rooms/333333', room('set-04', false)); await DS.Net.set('rooms/444444', room('set-05', true));
    await DS.Net.set('prep/set-04/img/c1', 'data:image/webp;base64,AAAA'); await DS.Net.set('prep/set-04/pct', 80); await DS.Net.set('xp/1-3/1', { total: 50 });
  });
  await T.selectOption('#p-lesson', 'set-04'); await T.click('#p-go'); await T.waitForTimeout(800);
  await T.click('#p-tidy summary'); await T.click('#td-scan'); await T.waitForTimeout(600);
  console.log('found:', await T.textContent('#p-tidy .row span'));
  console.log('delete disabled before backup:', await T.$eval('#td-del', (x) => x.disabled));
  const [dl] = await Promise.all([T.waitForEvent('download'), T.click('#td-backup')]);
  const f = `${OUT}/${dl.suggestedFilename()}`; await dl.saveAs(f); const bk = JSON.parse(require('fs').readFileSync(f, 'utf8'));
  console.log('backup rooms:', Object.keys(bk.rooms), 'prep img:', Object.keys(bk.prep.img || {}));
  await T.waitForTimeout(300); await T.screenshot({ path: `${OUT}/tidy.png`, fullPage: true });
  await T.click('#td-del'); await T.waitForTimeout(1200);
  console.log('after:', await T.evaluate(async () => JSON.stringify({ r1: !!(await DS.Net.get('rooms/111111')), r3: !!(await DS.Net.get('rooms/333333')), r4: !!(await DS.Net.get('rooms/444444')), img: await DS.Net.get('prep/set-04/img'), pct: await DS.Net.get('prep/set-04/pct'), xp: await DS.Net.get('xp/1-3/1') })));
  console.log('ERRORS', errs.length, errs.slice(0, 5)); await b.close();
})();
