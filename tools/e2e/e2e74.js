// 🧪 테스트 모드 쉼터 놀이 (2026-11-07): 수업 시작 → 🏕 → ⚖ 밸런스(봇들이 고름 · 작은 TV 창) → ⏹ → 🏰 디펜스(지도 고르기 · 자리 · TV 창 계산 · ⏩) → 끝 → ▶ 수업으로
//   node tools/e2e/e2e74.js <출력 폴더>   (로컬 서버 http://localhost:8765)
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  await ctx.addInitScript(() => { window.DS_TD = { pick: 12000 }; window.DS_FUN = { pick: 4000, show: 2500 }; });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  await p.selectOption('#p-lesson', 'set-05'); await p.click('#x-go'); await p.waitForTimeout(2500);
  await p.click('#camp-gate'); await p.waitForTimeout(4000);
  await p.click('#tb-next'); await p.waitForTimeout(1500); // 수업 시작
  const restBtn = await p.$('#tb-rest'); log.push('🏕 단추: ' + !!restBtn);
  if (restBtn) await restBtn.click(); await p.waitForTimeout(1500);
  const row0 = await p.$('#test-fun .fun-btn.k-bal'), map0 = await p.$('#tf-map'); log.push(`놀이 줄: ⚖ ${!!row0} · 지도 고르기 ${!!map0}`);
  // ⚖ 밸런스
  if (row0) await row0.click(); await p.waitForTimeout(2500);
  const tvBal = await p.evaluate(() => ({ tv: !!document.querySelector('#test-tv .fa-wrap'), phone: !!document.querySelector('#st-body .fa-wrap') }));
  await p.click('#st-body [data-pick="a"]').catch(() => {}); await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/74-1-bal.png` });
  const code = await p.evaluate(() => { const r = JSON.parse(localStorage.getItem('citadel-test-db') || '{}').rooms || {}; return Object.keys(r)[0]; });
  let bal = null; for (let k = 0; k < 20; k++) { await p.waitForTimeout(1000); bal = await p.evaluate((c) => { const f = ((JSON.parse(localStorage.getItem('citadel-test-db') || '{}').rooms || {})[c] || {}).fun || {}; const fv = (((JSON.parse(localStorage.getItem('citadel-test-db') || '{}').rooms || {})[c] || {}).fv) || {}; return { n: f.n, phase: f.phase, votes: Object.values(fv).reduce((a, v) => a + Object.keys(v || {}).length, 0) }; }, code); if (bal.n >= 2 || bal.phase === 'end') break; }
  log.push(`⚖ TV 창 ${tvBal.tv} · 폰 ${tvBal.phone} · 판 ${bal.n} · 고른 수(봇 포함) ${bal.votes}`);
  await p.screenshot({ path: `${OUT}/74-2-bal-next.png` });
  await p.click('#test-fun [data-fun="stop"]'); await p.waitForTimeout(1500);
  // 🏰 디펜스 · 얼음 지도
  await p.selectOption('#tf-map', 'ice'); await p.click('#test-fun .fun-btn.k-td'); await p.waitForTimeout(2500);
  const tdPick = await p.evaluate(() => ({ tv: !!document.querySelector('#test-tv .td-stage canvas'), mini: !!document.querySelector('#st-body .td-mini'), map: (document.querySelector('#test-tv .td-top b') || {}).textContent || '' }));
  const slot = await p.$('#st-body .td-mini g.free'); if (slot) await slot.click(); await p.waitForTimeout(6000);
  const picks = await p.evaluate((c) => { const r = (JSON.parse(localStorage.getItem('citadel-test-db') || '{}').rooms || {})[c] || {}; const f = r.fun || {}; return Object.values((r.tdp || {})[f.g] || {}); }, code);
  log.push(`🏰 TV 창 ${tdPick.tv} · 폰 미니 지도 ${tdPick.mini} · 지도 「${tdPick.map}」 · 자리 잡은 수 ${picks.length} (나 ${picks.includes('test-teacher')})`);
  await p.screenshot({ path: `${OUT}/74-3-td-pick.png` });
  for (let k = 0; k < 20; k++) { await p.waitForTimeout(1000); if (await p.$('#tf-fast')) break; }
  await p.waitForTimeout(4000); await p.screenshot({ path: `${OUT}/74-4-td-play.png` });
  const fb = await p.$('#tf-fast'); if (fb) await fb.click(); log.push('⏩ 단추: ' + !!fb);
  let td = null; for (let k = 0; k < 150; k++) { await p.waitForTimeout(1000); td = await p.evaluate((c) => (((JSON.parse(localStorage.getItem('citadel-test-db') || '{}').rooms || {})[c] || {}).fun) || {}, code); if (td.phase === 'end' && td.res) break; }
  log.push(`🏰 끝: ${td.phase} · ${JSON.stringify(td.res && { win: td.res.win, life: td.res.life, t: td.res.t })} · 탑 ${Object.values(td.tw || {}).length}개`);
  await p.waitForTimeout(2500); await p.screenshot({ path: `${OUT}/74-5-td-end.png` });
  await p.click('#tb-back-class'); await p.waitForTimeout(2000);
  const back = await p.evaluate(() => ({ tv: !!document.querySelector('#test-tv'), row: !!document.querySelector('#test-fun'), next: !!document.querySelector('#tb-next') }));
  log.push(`▶ 수업으로: TV 창 ${back.tv} · 놀이 줄 ${back.row} · 다음 단추 ${back.next}`);
  const ok = !!restBtn && !!row0 && !!map0 && tvBal.tv && tvBal.phone && (bal.n >= 2 || bal.phase === 'end') && bal.votes >= 4 && tdPick.tv && tdPick.mini && /얼음/.test(tdPick.map)
    && picks.length >= 4 && picks.includes('test-teacher') && !!fb && td.phase === 'end' && td.res && Object.values(td.tw || {}).length >= 5 && !back.tv && !back.row && back.next;
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
