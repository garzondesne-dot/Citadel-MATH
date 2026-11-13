// ✂ 2026-11-13 선생님 「PDF 넣으면 알아서 잘라서 이미지 추가하기」 → C: 칸 위치가 없는 엑셀 차시에서 학습지 PDF 글자로 칸을 찾아 자름
//   2단 학습지(생각 열기 · STEP 1 · 문제 1 / 보강 · 형성평가) → 칸마다 찾은 줄 ~ 같은 단 다음 칸 이름 위 · 못 찾는 칸 = ⚠ · 글자 없는 PDF = 안내
//   + 우리 코드 차시는 여전히 crops 대로 — PORT=8766 node tools/e2e/e2e142.js <출력 폴더> [학습지.pdf 엑셀.xlsx]
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), P = require('../school/page.js');
const OUT = process.argv[2] || '.', BASE = `http://localhost:${process.env.PORT || 8765}`, REAL_PDF = process.argv[3], REAL_XLSX = process.argv[4];
const code = 'ex7q2', sch = P.list()[code], dir = path.join(ROOT, 's', code);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'index.html'), P.build(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), code, sch));
fs.writeFileSync(path.join(dir, 'manifest.webmanifest'), P.manifest(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'), code, sch));
const cleanup = () => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* 무시 */ } };
const { chromium } = require('playwright');
const SHEET = `<style>body{font:15px sans-serif;margin:0}.cols{display:flex;gap:4%;padding:24px}.c{width:48%}h2{font-size:20px;margin:22px 0 8px}p{margin:6px 0;line-height:1.6}</style>
<h1 style="text-align:center">1차시 · 도수분포표 학습지</h1><div class="cols"><div class="c">
<h2>생각 열기</h2><p>우리 반 통학 시간을 모아 봐요.</p><p>가장 오래 걸리는 사람은?</p>
<h2>STEP 1 · 도수분포표 만들기</h2><p>계급 · 도수 · 계급의 크기</p><p>자료를 계급으로 나누어 세어요.</p><p>10 이상 20 미만 : ___</p>
<h2>문제 1 · 통학 시간</h2><p>(1) 도수가 가장 큰 계급은?</p><p>(2) 20 이상 30 미만의 도수는?</p><p>(3) 도수의 총합은?</p></div><div class="c">
<h2>보강 · 한 걸음 더</h2><p>계급의 크기가 5 인 표로 다시 만들어 봐요.</p><p>(1) ___</p><p>(2) ___</p>
<h2>형성평가</h2><p>1. 다음 표에서 계급의 크기는?</p><p>2. 도수가 4 인 계급은?</p><p>3. 도수의 총합은?</p></div></div>`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const pdfPath = REAL_PDF || path.join(OUT, '142-sheet.pdf'), scanPath = path.join(OUT, '142-scan.pdf');
  try {
    if (!REAL_PDF) { const pg = await b.newPage(); await pg.setContent(SHEET); await pg.pdf({ path: pdfPath, format: 'A4' }); await pg.close(); }
    { const pg = await b.newPage(); await pg.setContent(`<img src="data:image/png;base64,${fs.readFileSync(path.join(ROOT, 'icons/icon-192-m2.png')).toString('base64')}" style="width:600px">`); await pg.pdf({ path: scanPath, format: 'A4' }); await pg.close(); }
    const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push('T: ' + e.message)); T.on('dialog', (d) => d.accept());
    await T.goto(`${BASE}/s/${code}/index.html?local&role=teacher`); await T.waitForTimeout(1500);
    await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1200);
    await T.evaluate(() => document.querySelector('#p-go').click()); await T.waitForTimeout(1500);
    await T.setInputFiles('#x-file', REAL_XLSX || path.join(ROOT, 'assets/templates/question-bank-school-v1.xlsx')); await T.waitForTimeout(2500);
    await T.click('#x-save'); await T.waitForTimeout(2500);
    const steps = await T.evaluate(() => { const L = DS.Lessons.list[0]; return L.steps.map((s) => `${s.id}:${s.kind}:${s.title}`); });
    log.push('단계: ' + steps.join(' | '));
    // 글자 없는 PDF
    await T.setInputFiles('#p-pdf', scanPath); await T.waitForTimeout(4000);
    const t0 = await T.evaluate(() => [...document.querySelectorAll('.toast, #toast')].map((e) => e.textContent).join(' '));
    ok(/글자를 찾지 못했어요/.test(t0), `글자 없는 PDF = 「글자를 찾지 못했어요 — 직접」 안내 (${t0.slice(0, 60)})`);
    await T.evaluate(() => { const d = document.querySelector('#p-drop'); if (d) d.click(); }); await T.waitForTimeout(600);
    // 학습지 PDF
    await T.setInputFiles('#p-pdf', pdfPath); await T.waitForTimeout(6000);
    const t1 = await T.evaluate(() => [...document.querySelectorAll('.toast, #toast')].map((e) => e.textContent).join(' '));
    const st = await T.evaluate(() => [...document.querySelectorAll('.p-slot')].map((e) => e.innerText.replace(/\s+/g, ' ').slice(0, 60)));
    log.push('토스트: ' + t1.slice(0, 120)); log.push('칸: ' + st.join(' | '));
    const miss = st.filter((x) => /못 찾음/.test(x)).length;
    ok(/글자로 \d+칸/.test(t1) && miss <= (REAL_PDF ? 1 : 0), `✂ 글자로 칸을 찾아 자름 (못 찾음 ${miss})`);
    await T.evaluate(() => document.querySelector('#p-open-all').click()); await T.waitForTimeout(1500);
    await T.screenshot({ path: `${OUT}/142-auto.png`, fullPage: true });
    // 자른 칸 그림을 따로 (눈 확인용)
    const imgs = await T.evaluate(() => [...document.querySelectorAll('img.p-prev.draft')].map((i) => ({ alt: i.alt, src: i.src })));
    imgs.forEach((im, k) => fs.writeFileSync(path.join(OUT, `142-crop-${k + 1}.${/webp/.test(im.src) ? 'webp' : 'jpg'}`), Buffer.from(im.src.split(',')[1], 'base64')));
    ok(imgs.length >= 4, `미리 넣은 칸 ${imgs.length}개 (${imgs.map((i) => i.alt).join(' · ')})`);
    // 올리기
    await T.evaluate(() => { const a = document.querySelector('#p-all'); if (a) a.click(); }); await T.waitForTimeout(3000);
    const n = await T.evaluate(async () => Object.keys(((await DS.Net.get(`prep/${DS.Lessons.list[0].id}`)) || {}).img || {}).length);
    ok(n >= 4, `✅ 전부 올리기 = ${n}칸 저장`);
    // 우리 코드 차시 = crops 그대로 (자동 찾기를 쓰지 않음)
    const M = await ctx.newPage(); M.on('pageerror', (e) => errs.push('M: ' + e.message)); await M.goto(`${BASE}/index.html?local`); await M.waitForTimeout(1500);
    ok(await M.evaluate(() => !!DS.Lessons.get('set-09').crops), '우리 코드 차시 = 칸 위치(crops)가 있어 예전 방식 그대로');
    // 순수 함수: 찾기 규칙
    const r = await M.evaluate(() => { const A = DS.Prep._auto; const steps = [{ id: 'i', kind: 'intro', title: '도입' }, { id: 'c1', kind: 'concept', title: '개념 1 · 뜻' }, { id: 'm1', kind: 'monster', title: '문제 1 · 통학' }, { id: 'b', kind: 'boss', title: '형성평가' }];
      const L = (p, x0, y, s) => ({ p, x0, x1: x0 + 0.2, y, h: 0.015, s }); const lines = [L(1, 0.05, 0.1, '생각 열기'), L(1, 0.05, 0.2, '본문'), L(1, 0.05, 0.85, '끝 줄'), L(1, 0.05, 0.3, 'STEP 1 · 뜻'), L(1, 0.05, 0.6, '문제 1 · 통학'), L(1, 0.55, 0.1, '보강'), L(1, 0.55, 0.2, 'x'), L(1, 0.55, 0.3, 'y'), L(1, 0.55, 0.5, '형성평가')];
      return A.autoRects(lines, steps); });
    ok(r.i && Math.abs(r.i[0].y - 0.092) < 0.01 && Math.abs(r.i[0].y + r.i[0].h - 0.227) < 0.01 && r.i[0].w <= 0.49 && r.b && r.b[0].x >= 0.49 && Math.abs(r.m1[0].y + r.m1[0].h - 0.877) < 0.01, `찾기 규칙: 도입 = 생각 열기 ~ STEP 1 위 · 왼쪽 단 · 형성평가 = 오른쪽 단 · 문제 1 = 마지막 글자 줄까지 (빈 아래 자름) (${JSON.stringify(r.i)})`);
  } catch (e) { log.push('✘ 오류 ' + String(e.message).split('\n')[0]); bad++; } finally { cleanup(); }
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
