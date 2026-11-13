// 🏫 2026-11-13 학교판 수업 준비 「PDF 자르기가 안먹혀」: 엑셀 차시 + 학습지 PDF 올리기 → ✏ 자르기 → 칸에 넣기 · 🖼 고르기도 — PORT=8766 node tools/e2e/e2e140.js <출력 폴더>
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
  const pdfPath = path.join(OUT, '140-sheet.pdf'), pngPath = path.join(OUT, '140-img.png');
  try {
    { const pg = await b.newPage(); await pg.setContent('<h1 style="font:40px sans-serif">도수분포표 학습지</h1><table border=1 style="font:28px sans-serif"><tr><td>계급</td><td>도수</td></tr><tr><td>10~20</td><td>3</td></tr><tr><td>20~30</td><td>5</td></tr></table>'); await pg.pdf({ path: pdfPath, format: 'A4' }); await pg.screenshot({ path: pngPath }); await pg.close(); }
    const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push('T: ' + e.message)); T.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); }); T.on('dialog', (d) => d.accept());
    await T.goto(`${BASE}/s/${code}/index.html?local&role=teacher`); await T.waitForTimeout(1500);
    await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1200);
    await T.evaluate(() => document.querySelector('#p-go').click()); await T.waitForTimeout(1500);
    await T.setInputFiles('#x-file', path.join(ROOT, 'assets/templates/question-bank-school-v1.xlsx')); await T.waitForTimeout(2000);
    await T.click('#x-save'); await T.waitForTimeout(2500);
    // PDF 올리기
    await T.setInputFiles('#p-pdf', pdfPath); await T.waitForTimeout(5000);
    const st = await T.evaluate(() => ({ edit: document.querySelectorAll('[data-edit]').length, draft: document.querySelectorAll('.p-state.gold, #p-all').length, txt: (document.querySelector('#p-body') || {}).innerText.slice(0, 300) }));
    ok(st.edit > 0 || st.draft > 0, `학습지 PDF 올림 → ✏ 자르기 단추 ${st.edit} · 미리보기 ${st.draft}`);
    await T.screenshot({ path: `${OUT}/140-pdf.png`, fullPage: false });
    // ✏ 자르기 → 이 칸 올리기
    { const o = await T.$('[data-open]'); if (o) { await o.click(); await T.waitForTimeout(800); } }
    const e0 = await T.$('[data-edit]');
    if (e0) { await e0.click(); await T.waitForTimeout(1200); }
    const ed = await T.evaluate(() => ({ ed: !!document.querySelector('.crop-ed'), up: document.querySelectorAll('[data-up]').length }));
    ok(ed.ed, `✏ 자르기 창 열림 (${JSON.stringify(ed)})`);
    await T.screenshot({ path: `${OUT}/140-crop.png` });
    { const okb = await T.$('#ce-ok'); if (okb) { await okb.click(); await T.waitForTimeout(800); } }
    const up = await T.$('[data-up]'); if (up) { await up.click(); await T.waitForTimeout(2500); }
    const saved = await T.evaluate(async () => { const id = DS.Lessons.list[0].id; return Object.keys(((await DS.Net.get(`prep/${id}`)) || {}).img || {}); });
    ok(saved.length >= 1, `칸 그림이 그 학교 서버(prep)에 저장 (${saved})`);
    // 자르기 창을 연 채로 「✅ 전부 올리기」 (깨지던 길)
    { const o = await T.$('[data-open]'); if (o) { await o.click(); await T.waitForTimeout(600); } const e1 = await T.$('[data-edit]'); if (e1) { await e1.click(); await T.waitForTimeout(800); } const all = await T.$('#p-all'); if (all) { await all.click(); await T.waitForTimeout(2500); } }
    const n3 = await T.evaluate(async () => { const id = DS.Lessons.list[0].id; return Object.keys(((await DS.Net.get(`prep/${id}`)) || {}).img || {}).length; });
    ok(n3 >= 3 && !!(await T.$('#p-body .p-slot')), `자르기 창을 연 채로 「전부 올리기」 = 깨지지 않고 ${n3}칸 저장`);
    // 🖼 고르기
    const fi = await T.$('input[data-slot]'); if (fi) { await fi.setInputFiles(pngPath); await T.waitForTimeout(2000); }
    const up2 = await T.$('[data-up]'); if (up2) { await up2.click(); await T.waitForTimeout(2500); }
    const saved2 = await T.evaluate(async () => { const id = DS.Lessons.list[0].id; return Object.keys(((await DS.Net.get(`prep/${id}`)) || {}).img || {}); });
    ok(saved2.length >= 1, `🖼 고르기 그림도 저장 (${saved2})`);
  } catch (e) { log.push('✘ 오류 ' + String(e.message).split('\n')[0]); bad++; } finally { cleanup(); }
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
