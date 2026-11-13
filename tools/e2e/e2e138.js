// 🏫 2026-11-13 학교판 첫날 = 차시 0개: 수업 준비가 「Cannot read properties of null (reading 'id')」로 깨지던 것 → 「📊 엑셀로 차시 만들기」만 열림 · 첫 엑셀 저장 → 그 차시 준비 화면
//   + 교사 메뉴의 다른 단추(수업 열기 · 테스트 · 대시보드 · 내 캠프 · 명단) · 학생 캠프 · 허수아비도 차시 0개에서 깨지지 않는지 — PORT=8766 node tools/e2e/e2e138.js <출력 폴더>
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), P = require('../school/page.js');
const OUT = process.argv[2] || '.', BASE = `http://localhost:${process.env.PORT || 8765}`;
const code = 'ex7q2', sch = P.list()[code], dir = path.join(ROOT, 's', code);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'index.html'), P.build(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), code, sch));
fs.writeFileSync(path.join(dir, 'manifest.webmanifest'), P.manifest(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'), code, sch));
const cleanup = () => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* 무시 */ } };
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const U = `${BASE}/s/${code}/index.html?local`;
  try {
    const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push('T: ' + e.message)); T.on('dialog', (d) => d.accept());
    await T.goto(U + '&role=teacher'); await T.waitForTimeout(1500);
    await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1200);
    ok((await T.evaluate(() => DS.Lessons.list.length)) === 0, '차시 0개 학교');
    const toastOf = () => T.evaluate(() => [...document.querySelectorAll('.toast, #toast')].map((e) => e.textContent).join(' | '));
    // 교사 메뉴 단추들 (깨지지 않는지 · 오류 상자 없음)
    for (const id of ['#t-new', '#x-go', '#d-go', '#t-camp', '#s-go']) {
      const e0 = errs.length;
      await T.evaluate((id) => { const e = document.querySelector(id); if (e) e.click(); }, id); await T.waitForTimeout(1500);
      const box = await T.evaluate(() => [...document.querySelectorAll('.modal, .toast, #toast')].map((e) => e.textContent).join(' ').match(/Cannot read|undefined|null \(/));
      ok(errs.length === e0 && !box, `교사 메뉴 ${id} = 깨지지 않음 ${errs.slice(e0).join(' ')}`);
      await T.goto(U + '&role=teacher'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
    }
    // 수업 준비
    await T.evaluate(() => document.querySelector('#p-go').click()); await T.waitForTimeout(1500);
    const pv = await T.evaluate(() => ({ act: !!document.querySelector('#screen-prep.active'), txt: (document.querySelector('#p-body') || {}).innerText || '', sheetOpen: !!document.querySelector('#p-sheet[open]'), file: !!document.querySelector('#x-file') }));
    ok(pv.act && /아직 차시가 없어요/.test(pv.txt) && pv.sheetOpen && pv.file && !/Cannot read/.test(pv.txt), '수업 준비 = 「아직 차시가 없어요」 + 📊 엑셀로 차시 만들기 열림 · 양식 내려받기');
    await T.screenshot({ path: `${OUT}/138-prep-empty.png` });
    await T.setInputFiles('#x-file', path.join(ROOT, 'assets/templates/question-bank-school-v1.xlsx')); await T.waitForTimeout(2000);
    await T.click('#x-save'); await T.waitForTimeout(2500);
    const after = await T.evaluate(() => ({ n: DS.Lessons.list.map((l) => l.id), txt: (document.querySelector('#p-body') || {}).innerText || '', opt: [...document.querySelectorAll('#p-lesson option')].map((o) => o.value) }));
    ok(after.n.join() === 'xl-ex-1' && /단계별 이미지/.test(after.txt) && after.opt.includes('xl-ex-1'), `첫 엑셀 저장 → 그 차시 준비 화면 (이미지 칸 · 차시 목록 ${after.opt})`);
    await T.screenshot({ path: `${OUT}/138-prep-after.png` });
    // 지우면 다시 빈 화면
    await T.evaluate(() => { const d = document.querySelector('#p-sheet'); if (d) d.open = true; }); await T.evaluate(() => { const x = document.querySelector('[data-xdel]'); if (x) x.click(); }); await T.waitForTimeout(2000);
    ok(/아직 차시가 없어요/.test(await T.evaluate(() => document.querySelector('#p-body').innerText)), '그 차시를 지우면 다시 「아직 차시가 없어요」');
    // 학생: 가입 → 캠프 → 허수아비 (차시 0개)
    await T.evaluate(() => DS.Account.uploadRoster([{ c: '1-1', n: 1, name: '가' }]));
    const S = await ctx.newPage(); S.on('pageerror', (e) => errs.push('S: ' + e.message)); S.on('dialog', (d) => d.accept());
    await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
    await S.selectOption('#s-cls', '1-1'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
    await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
    await S.click('#s-go'); await S.waitForTimeout(2500);
    await S.evaluate(() => DS.Control.run(async () => DS.Bonus.enter(await DS.Account.me(), { train: true }))); await S.waitForTimeout(1500);
    ok(/허수아비/.test(await S.evaluate(() => (document.querySelector('#bonus') || {}).innerText || '')), '학생 캠프 · 허수아비 = 차시 0개여도 열림');
  } catch (e) { log.push('✘ 오류 ' + String(e.message).split('\n')[0]); bad++; } finally { cleanup(); }
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
