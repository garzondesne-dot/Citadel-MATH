// 2026-11-05 · 🖥 종합상황실 비밀번호 고정 · 수업 코드 없이 자동 찾기 · 다음 수업 자동 입장 · 🏛 교사 개인 캠프(학생 캠프 그대로) · 출석부 없음 — node tools/e2e/e2e58.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1200);
  const att = await T.$('#a-go'), stuRow = (await T.textContent('.t-stu-row')).replace(/\s+/g, ' ');
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.evaluate(() => DS.Scene.clear()); await T.goto(U + '&role=teacher'); await T.waitForTimeout(2500);
  if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(800); }
  await T.screenshot({ path: `${OUT}/0-teacher.png` });
  await T.fill('#t-hallpw', '2580'); await T.click('#t-hallpw-save'); await T.waitForTimeout(600);
  const pw = await T.evaluate(() => DS.Net.get('tcfg/hallPw'));
  const r1 = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-04', '1-3', { noLimit: true }); return { code: c.code, key: c.hallKey }; });
  log.push(`비밀번호 고정 ${pw} → 수업 ${r1.code} 키 ${r1.key} · 출석부 버튼 ${att ? '있음' : '없음'} · 학생 관리 「${stuRow}」`);
  // 종합상황실: 코드 없이 → 찾은 수업 · 비밀번호만
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 });
  await H.goto(U + '&role=hall'); await H.waitForTimeout(2500);
  const found = await H.evaluate(() => ({ list: (document.querySelector('#h-find') || {}).textContent || '', code: document.querySelector('#h-code').value }));
  await H.screenshot({ path: `${OUT}/1-hall-find.png` });
  await H.fill('#h-key', '2580'); await H.click('#h-go'); await H.waitForTimeout(3000);
  const in1 = await H.evaluate(() => (document.querySelector('.screen.active') || {}).id);
  log.push(`종합상황실 찾기: 「${found.list.replace(/\s+/g, ' ').slice(0, 60)}」 · 코드 칸 ${found.code} · 입장 뒤 화면 ${in1}`);
  // 수업 끝 → 다음 수업 만들기 → 종합상황실 캠프가 저절로 새 수업으로
  await T.evaluate(async (code) => DS.Act.endClass(code), r1.code); await H.waitForTimeout(2500);
  const r2 = await T.evaluate(async () => { const c = await DS.Act.createRoom('set-05', '1-3', { noLimit: true }); return { code: c.code, key: c.hallKey }; });
  await H.waitForTimeout(21000);
  const hostOk = await T.evaluate(async ({ code }) => { const R = await DS.Net.get(`rooms/${code}/hosts`); return Object.keys(R || {}).length > 1; }, r2);
  const hallTop = await H.evaluate(() => (document.querySelector('#tc-info') || document.querySelector('#h-top') || {}).textContent || '');
  await H.screenshot({ path: `${OUT}/2-hall-next.png` });
  log.push(`다음 수업 ${r2.code} 키 ${r2.key} · 종합상황실 자동 입장 ${hostOk} · 「${hallTop.replace(/\s+/g, ' ').slice(0, 60)}」`);
  // 교사 개인 캠프
  await T.evaluate(() => DS.Scene.clear()); await T.goto(U + '&role=teacher'); await T.waitForTimeout(2500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(800); } await T.click('#t-camp'); await T.waitForTimeout(2500);
  const camp = await T.evaluate(() => ({ scr: (document.querySelector('.screen.active') || {}).id, gate: (document.querySelector('#camp-gate .camp-label') || {}).textContent || '', code: !!document.querySelector('#camp-code:not([hidden])') }));
  await T.screenshot({ path: `${OUT}/3-tcamp.png` });
  await T.click('#camp-castle', { force: true }); await T.waitForTimeout(2500);
  const castle = await T.evaluate(() => ({ cards: ((document.querySelector('#bonus') || {}).textContent.match(/도전/g) || []).length, locked: (document.querySelector('#bonus') || {}).textContent.match(/차시 수업 뒤/g) || [] }));
  await T.screenshot({ path: `${OUT}/4-tcamp-castle.png` });
  await T.click('#bn-back'); await T.waitForTimeout(1500);
  const back = await T.evaluate(() => (document.querySelector('.screen.active') || {}).id);
  log.push(`교사 캠프: ${camp.scr} · 문 「${camp.gate}」 · 코드 버튼 ${camp.code} · 성채 칸 ${castle.cards} · 「n차시 수업 뒤」 ${castle.locked.length} · 뒤로 ${back}`);
  const C = { 출석부없음: !att && !/출석부/.test(stuRow), 고정: pw === '2580' && r1.key === '2580' && r2.key === '2580', 찾기: /1-3반/.test(found.list) && found.code === r1.code, 입장: in1 === 'screen-tcamp' || in1 === 'screen-hall', 다음수업: hostOk,
    교사캠프: camp.scr === 'screen-camp' && /수업 진행|새 수업/.test(camp.gate) && !camp.code, 모든방: castle.cards > 0 && castle.locked.length === 0, 뒤로: back === 'screen-camp' };
  const bad = Object.keys(C).filter((k) => !C[k]); if (bad.length) log.push('틀린 항목: ' + bad.join(', '));
  console.log(log.join('\n')); console.log(!bad.length ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad.length || errs.length) process.exit(1);
})();
