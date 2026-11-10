// ⚔ #73-5 스킬 탭 버벅임 (2026-11-11): A 내 속성 + 공통만 펼침 · 누른 속성만 그림 · B 정지 그림표 한 장 · C 스킬을 누르면 위 칸 · 미리보기만 다시
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e106.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = []; let ok = 0, fail = 0;
  const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  const big = []; p.on('request', (r) => { if (/pfx\/fx-(?!stills)/.test(r.url())) big.push(r.url()); });
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1200);
  big.length = 0;
  await p.evaluate(() => { localStorage.setItem('citadel-settab', 'gem'); DS.Camp.settings({ teacher: true, tab: 'gem' }); }); await p.waitForTimeout(1500);
  const st = () => p.evaluate(() => ({ open: [...document.querySelectorAll('.fx-fam:not(.shut)')].map((e) => e.dataset.fam), shut: document.querySelectorAll('.fx-fam.shut').length, cv: document.querySelectorAll('.fx-fams canvas').length }));
  const s0 = await st();
  check(s0.open.length === 1 || s0.open.length === 2, `처음 펼친 속성 = 내 속성 + 공통 (${s0.open})`);
  check(s0.shut >= 8 && s0.cv <= 8, `나머지 접힘 · 그림 ${s0.cv}개만`);
  check(big.length <= 2, `정지 그림은 그림표 한 장 · 큰 띠는 미리보기 공격 1~2장만 (${big.map((u) => u.split('/').pop())})`);
  const fam = await p.evaluate(() => document.querySelector('.fx-fam.shut').dataset.fam);
  await p.evaluate((f) => document.querySelector(`[data-famt="${f}"]`).click(), fam); await p.waitForTimeout(300);
  const s1 = await st(); check(s1.open.includes(fam) && s1.cv === s0.cv + 4, `누른 속성만 펼침 · 그림 +4 (${s1.cv})`);
  await p.evaluate(() => { document.querySelectorAll('.fx-fams .fxpick').forEach((x) => { x.dataset.mark = '1'; }); });
  const pick = await p.evaluate((f) => { const c = [...document.querySelectorAll(`[data-fam="${f}"] .fxpick`)].find((x) => !x.classList.contains('on')); c.click(); return c.dataset.fx; }, fam); await p.waitForTimeout(400);
  const r = await p.evaluate((k) => ({ on: (document.querySelector('.fxpick.on') || {}).dataset?.fx, kept: [...document.querySelectorAll('.fx-fams .fxpick')].every((x) => x.dataset.mark === '1'), top: document.querySelector('#gem-top').textContent }), pick);
  check(r.on === pick && r.kept, `스킬 누름 = 고른 칸 · 위 칸만 다시 (${r.on} · 칸 그대로 ${r.kept})`);
  await p.screenshot({ path: `${OUT}/skill.png` });
  console.log(`e2e106: 확인 ${ok} · 실패 ${fail}`, 'errors:', errs.length ? errs : 'none');
  await b.close(); if (fail || errs.length) process.exit(1);
})();
