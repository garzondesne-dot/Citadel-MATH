// 🟪 중단원던전 (보강던전 대신 · 2026-11-03): 층 해금(unlock) · 꼭대기 층 잠금 → 교사 메뉴 「열기」 → 열림 · 형성평가 재대결 · 인장 — node tools/e2e/e2e36.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  await p.evaluate(async () => { await DS.Net.set('roster/1-1', { 3: '박도윤' }); await DS.Net.set('rosterMask/1-1', { 3: '박*윤' }); await DS.Net.set('unlock/1-1', 5); await DS.Net.set('bonus/1-1/3', { 'set-04': { b1: { clear: true, tries: 1 }, b2: { clear: true, tries: 2 }, b3: { clear: true, tries: 1 } }, 'set-02': { boss: { clear: true, tries: 1 } } }); });
  await p.reload(); await p.waitForTimeout(1200); if (await p.locator('#f-teacher .t-id').isVisible().catch(() => false)) { await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000); }
  const me = { c: '1-1', n: 3, name: '박도윤', hero: 3, fx: 'flame' };
  const floors = async () => p.evaluate(() => ({ heads: [...document.querySelectorAll('.bn-card .bn-h b')].map((e) => e.textContent), seal: document.querySelector('.bn-seal').textContent, fights: document.querySelectorAll('[data-fight]').length }));
  await p.evaluate((m) => DS.Bonus.enter(m), me); await p.waitForTimeout(800);
  let f = await floors(); log.push(`잠금 상태: ${f.heads.join(' | ')} · ${f.seal}`);
  await p.screenshot({ path: `${OUT}/floors-locked.png`, fullPage: true });
  // 교사 메뉴에서 꼭대기 층 열기
  await p.evaluate(() => DS.UI.show('screen-home')); await p.evaluate(() => document.querySelector('[data-role="teacher"]') && document.querySelector('[data-role="teacher"]').click()); await p.waitForTimeout(500);
  await p.selectOption('#e-cls', '1-1'); await p.waitForTimeout(400); log.push('교사 패널(전): ' + (await p.textContent('#e-go')));
  await p.click('#e-go'); await p.waitForTimeout(600); log.push('교사 패널(후): ' + (await p.textContent('#e-go')) + ' · ' + (await p.textContent('#e-st')));
  await p.locator('.t-eval').scrollIntoViewIfNeeded(); await p.screenshot({ path: `${OUT}/teacher-eval.png` });
  await p.evaluate((m) => DS.Bonus.enter(m), me); await p.waitForTimeout(800);
  f = await floors(); log.push(`열림: ${f.heads.join(' | ')} · ${f.seal} · 도전 버튼 ${f.fights}`);
  await p.screenshot({ path: `${OUT}/floors-open.png`, fullPage: true });
  // 3층 형성평가 재대결 · 꼭대기 ① 몬스터 문제 창
  for (const id of ['set-03|boss', 'eval-1|e1', 'eval-1|e5']) {
    await p.evaluate((i) => document.querySelector(`[data-fight="${i}"]`).click(), id); await p.waitForTimeout(600);
    await p.click('#bf-go'); await p.waitForTimeout(700);
    log.push(`${id}: ${(await p.textContent('.bn-fight .scene-bar')).replace(/\s+/g, ' ').trim()} / 문제: ${(await p.textContent('#quiz-q')).slice(0, 60)}`);
    if (id === 'eval-1|e5') await p.screenshot({ path: `${OUT}/top-e5.png` });
    await p.evaluate(() => { document.getElementById('quiz').classList.add('hidden'); document.querySelectorAll('.bn-fight').forEach((e) => e.remove()); });
    await p.evaluate((m) => DS.Bonus.enter(m), me); await p.waitForTimeout(500);
  }
  // 캠프 보라 차원문
  await p.evaluate(async () => { const m = await DS.Account.me().catch(() => null); return m; });
  log.push('인장 계산(4층 보강 모두 + 2층 재대결): ' + (await p.evaluate(async () => DS.Bonus.seals(await DS.Net.get('bonus/1-1/3')).join(','))));
  log.push('결과 화면 소개: ' + (await p.evaluate(() => DS.Result.floorText(DS.Lessons.get('set-05')).replace(/<[^>]+>/g, ''))));
  log.push('교사 차시 목록에 평가 없음: ' + (await p.evaluate(() => ![...document.querySelectorAll('#lesson option')].some((o) => o.value === 'eval-1'))));
  console.log(log.join('\n')); console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
