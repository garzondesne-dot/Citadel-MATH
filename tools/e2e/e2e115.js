// 📣 #96 개편 안내 창 (2026-11-11): 옛 구매가 남아 있으면(일괄 환불 전) 안 뜸 → 환불 기록(refund96_…)이 생기면 첫 접속 한 번 · 3줄 + 돌려받은 💎 · 📜 · 용사 ○ + 스킬 ○ · 확인 = seen96 → 다시 안 뜸
//   사용: python3 -m http.server 8765 뒤 node tools/e2e/e2e115.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = []; let ok = 0, fail = 0;
  const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500);
  if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.click('#s-go'); await S.waitForTimeout(2500);
  const pop = () => S.evaluate(() => { const e = document.querySelector('.rv96'); return e ? e.innerText.replace(/\s+/g, ' ') : ''; });
  const camp = async () => { await S.evaluate(() => { document.querySelectorAll('.rv96, .modal').forEach((e) => e.remove()); DS.Camp.back(); }); await S.waitForTimeout(3000); };
  // ① 옛 구매(표시 없음)가 남아 있음 = 환불 전 → 안 뜸
  await S.evaluate(async () => { const m = await DS.Account.me(); await DS.Net.update(`gem/${m.c}/${m.n}`, { 'buy/fx_moon': true, 'log/buy_fx_moon': { g: -20, at: 1 } }); });
  await camp(); check(!(await pop()), '환불 전 = 안내 창 안 뜸');
  // ② 일괄 환불이 지나감 (refund96 과 같은 꼴) → 첫 접속 때 뜸
  await S.evaluate(async () => { const m = await DS.Account.me(); await DS.Net.update(`gem/${m.c}/${m.n}`, { 'buy/fx_moon': null, 'log/refund96_1': { g: 80, s: 3, nh: 1, nf: 2, gift: true, nopop: true, why: 'x', at: 2 } }); });
  await camp(); const t = await pop(); await S.screenshot({ path: `${OUT}/115-popup.png` });
  check(/새로워졌어요/.test(t) && /자기 속성 스킬 4칸만 배우고/.test(t) && /공통 특화/.test(t) && /아바쿠/.test(t), `바뀐 것 3줄 (${t.slice(0, 80)})`);
  check(/80/.test(t) && /3/.test(t) && /용사 1명/.test(t) && /스킬 2개/.test(t) && /내 스킬 보러 가기/.test(t) && /사면 끝/.test(t), '돌려받은 💎 80 · 📜 3 · 용사 1 + 스킬 2 · 「사면 끝」');
  await S.waitForTimeout(1500); check(await S.evaluate(() => !document.querySelector('.gift-note')), '선물 축하 창이 겹치지 않음');
  // 🐞 #115 확인 안 하고 수업 화면으로 가면 저절로 닫힘 → 다음 캠프에서 다시
  await S.evaluate(() => { document.getElementById('screen-camp').classList.remove('active'); }); await S.waitForTimeout(900);
  check(!(await pop()), '캠프를 떠나면 안내 창 저절로 닫힘');
  check(await S.evaluate(async () => { const m = await DS.Account.me(); return !(await DS.Net.get(`accounts/${m.c}/${m.n}/seen96`)); }), '확인 안 함 = 아직 안 본 것으로');
  await camp(); check(/새로워졌어요/.test(await pop()), '다음 캠프에서 다시 뜸');
  await S.click('.rv96 .ui-x'); await S.waitForTimeout(800);
  check(await S.evaluate(async () => { const m = await DS.Account.me(); return (await DS.Net.get(`accounts/${m.c}/${m.n}/seen96`)) === true; }), '확인 = seen96 저장');
  await camp(); check(!(await pop()), '다시 들어와도 안 뜸');
  // ③ 스킬 탭 위 한 줄 · 옮긴 용사 카드 「속성 바뀜」
  await S.evaluate(() => DS.Camp.settings({ tab: 'gem' })); await S.waitForTimeout(1200);
  check(await S.evaluate(() => /자기 속성 스킬만/.test((document.querySelector('.lad-tip') || {}).textContent || '')), '사다리 위 안내 한 줄');
  await S.click('#mh-top'); await S.waitForTimeout(600); await S.click('.mh-hc[data-hp="28"]'); await S.waitForTimeout(600);
  const tg = await S.evaluate(() => (document.querySelector('.mh-det') || {}).textContent || '');
  check(/마법/.test(tg) && (/속성 바뀜/.test(tg) || Date.now() > Date.parse('2026-11-19T23:59:59+09:00')), `콤파 상세 = 마법 · 속성 바뀜 (${tg.slice(0, 60)})`);
  console.log(`e2e115: 확인 ${ok} · 실패 ${fail}`, errs.length ? `errors: ${errs.join(' | ')}` : 'errors: none');
  await b.close(); process.exit(fail || errs.length ? 1 : 0);
})();