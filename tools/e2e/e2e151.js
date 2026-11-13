// 👩‍🏫 2026-11-13 밤 (DECISIONS b5d2582 · 선생님 「B안 · 교사는 스킬 용사 리셋」): 교사 캠프 ⚙ = 용사 모두 열림 · 스킬은 학생과 같은 해금(교사 지갑 💎 9,999 · 📜 30)
//   · 🔨 강화 탭 · 「↺ 처음으로 되돌리기」 = 스킬 · 용사 · 강화 · 💎 📜 처음으로 — PORT=8766 node tools/e2e/e2e151.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push('T: ' + e.message)); T.on('dialog', (d) => d.accept());
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  const open = async (tab) => { await T.evaluate(async (tab) => { document.querySelectorAll('.camp-modal, .modal').forEach((e) => e.remove()); localStorage.setItem('citadel-settab', tab); DS.Camp.settings({ teacher: true }); }, tab); await T.waitForTimeout(1500); };
  await open('gem');
  let v = await T.evaluate(() => ({ head: (document.querySelector('.set-head') || {}).textContent || '', tabs: [...document.querySelectorAll('[data-tab]')].map((b) => b.dataset.tab).join(), lad: [...document.querySelectorAll('.lad [data-fx]')].map((b) => b.className).join('|'), reset: !!document.querySelector('#t-reset') }));
  ok(/9999/.test(v.head) && /30/.test(v.head), `교사 지갑 💎 9,999 · 📜 30 (${v.head.trim().slice(0, 30)})`);
  ok(v.tabs === 'enh,gem,ttl' && v.reset, `탭 = 🔨 강화 · ⚔ 스킬 · 🏅 호칭 · 「↺ 처음으로 되돌리기」 (${v.tabs})`);
  await T.screenshot({ path: `${OUT}/151-skill.png` });
  const before = await T.evaluate(() => DS.Gem.teacherWallet());
  // Ⅱ 칸 사기 → 저장
  const bought = await T.evaluate(() => { const bs = [...document.querySelectorAll('.lad [data-fx]')]; const b2 = bs.find((x) => Number(x.dataset.i) === 1); if (!b2) return null; b2.click(); return b2.dataset.fx; }); await T.waitForTimeout(500);
  await T.evaluate(() => { const s = document.querySelector('#set-ok'); if (s) s.click(); }); await T.waitForTimeout(1500);
  const after = await T.evaluate(() => DS.Gem.teacherWallet());
  ok(bought && after.buy[`fx_${bought}`] && after.total < before.total, `스킬 Ⅱ 「${bought}」 해금 = 학생과 같은 길 · 💎 ${before.total} → ${after.total}`);
  ok(await T.evaluate(async () => { const t = await DS.Net.get('gcfg/teacher/tw'); return !!(t && t.total < 9999); }), '교사 지갑 = 서버 gcfg/teacher/tw (학생 기록과 따로)');
  await open('enh'); await T.screenshot({ path: `${OUT}/151-enh.png` });
  await T.evaluate(() => document.querySelector('#t-reset').click()); await T.waitForTimeout(2000);
  const rs = await T.evaluate(() => DS.Gem.teacherWallet());
  ok(rs.total === 9999 && rs.scroll === 30 && !Object.keys(rs.buy).length && rs.enh === 0, `↺ 처음으로 = 💎 9,999 · 📜 30 · 해금 0 (${JSON.stringify(rs).slice(0, 60)})`);
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
