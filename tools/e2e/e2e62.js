// 🔒 성채 층 잠금 (2026-11-05 사용자 「대단원 평가는 잠그는 거 · 지금은 잠그는 게 좋아」) — node tools/e2e/e2e62.js <출력 폴더>
//   학생: 2층 = 🔒 잠김 패널(방 없음) · 1층은 그대로 → 교사 개인 캠프 성채: 2층 방 보임 + 「🔒 학생에게 잠김」 + 🔓 열기 → 학생: 2층 방 열림 → 🔒 잠그기 → 다시 잠김
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message + ' @ ' + String(e.stack).split('\n').slice(1, 3).join(' '))); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500);
  if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); });
  await S.click('#s-go'); await S.waitForTimeout(2000);
  // 진도 6차시 · 4차시 기록: 문제 1 틀림(x) · 형성평가 일부
  await S.evaluate(async () => {
    await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); await DS.Net.set('unlock/1-3', 6); await DS.Net.set('held/1-3', { 'set-04': true });
    await DS.Net.set('records/1-3/1/set-04', { at: 1, no: 4, mons: { r1: 'o', m1: 'x', m2: 'o', m3: 'f' }, bossM: 'ooxoo', boss: 4, bossN: 5, conc: {}, names: {} });
  });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(2500);

  const P = (m) => log.push(m);
  const stu = async () => { await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500); await S.click('#camp-castle', { force: true }); await S.waitForTimeout(1800);
    const one = () => S.evaluate(() => { const f = document.querySelector('.cs-floor'); return { t: (f.querySelector('.bn-h b') || {}).textContent || '', rooms: f.querySelectorAll('[data-fight]').length, lock: f.classList.contains('lock') }; });
    // 2026-11-06 포털 메뉴: 1층 누르고 보기 · 2층 포털 = 잠기면 회색 + 눌러도 1층 그대로 / 열리면 2층 방
    await S.click('.cs-portal[data-floor="eval-1"]'); await S.waitForTimeout(400); const a = await one();
    const p2lock = await S.evaluate(() => document.querySelector('.cs-portal[data-floor="eval-3"]').classList.contains('lock'));
    await S.click('.cs-portal[data-floor="eval-3"]'); await S.waitForTimeout(500); const b2 = await one();
    return [a, p2lock ? { t: '2층 · 집합과 명제 대단원', rooms: 0, lock: true } : b2]; };
  const s1 = await stu(); P('학생 처음: ' + JSON.stringify(s1));
  await S.screenshot({ path: `${OUT}/1-student-locked.png`, fullPage: true });
  // 교사 개인 캠프 → 성채
  await T.evaluate(() => DS.Scene.clear()); await T.goto(U + '&role=teacher'); await T.waitForTimeout(2500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(800); }
  await T.click('#t-camp'); await T.waitForTimeout(2500); await T.click('#camp-castle', { force: true }); await T.waitForTimeout(2500);
  await T.click('.cs-portal[data-floor="eval-3"]'); await T.waitForTimeout(500);
  const t1 = await T.evaluate(() => ({ btn: (document.querySelector('.cs-lockbtn[data-flock^="eval-3"]') || {}).textContent || '', lk: [...document.querySelectorAll('.cs-lk')].map((e) => e.textContent).join(' / '), rooms2: document.querySelector('.cs-floor').querySelectorAll('[data-fight]').length }));
  P('교사 성채: ' + JSON.stringify(t1));
  await T.screenshot({ path: `${OUT}/2-teacher-castle.png`, fullPage: true });
  const open2 = await T.$('.cs-lockbtn[data-flock="eval-3|1"]'); if (open2) { await open2.click(); await T.waitForTimeout(1500); }
  const v1 = await T.evaluate(() => DS.Net.get('gcfg/floorOpen/eval-3'));
  const s2 = await stu(); P(`🔓 연 뒤 (gcfg ${v1}) 학생: ` + JSON.stringify(s2));
  const close2 = await T.$('.cs-lockbtn[data-flock="eval-3|0"]'); if (close2) { await close2.click(); await T.waitForTimeout(1500); }
  const s3 = await stu(); P('🔒 다시 잠근 뒤 학생: ' + JSON.stringify(s3));
  const C = { 처음잠김: s1[1] && s1[1].lock && s1[1].rooms === 0 && s1[0].rooms > 0, 교사보임: /열기/.test(t1.btn) && /잠김/.test(t1.lk) && t1.rooms2 > 0, 열림: v1 === true && s2[1] && !s2[1].lock && s2[1].rooms > 0, 다시잠김: s3[1] && s3[1].lock && s3[1].rooms === 0 };
  const bad = Object.keys(C).filter((k) => !C[k]); if (bad.length) log.push('틀린 항목: ' + bad.join(', '));
  console.log(log.join('\n')); console.log(!bad.length ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad.length || errs.length) process.exit(1);
})();
