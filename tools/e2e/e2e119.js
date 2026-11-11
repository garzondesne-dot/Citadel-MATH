// ⭐ #106 기호 톡 찜 → 모루 배지 (2026-11-12 선생님 「진행 1없음 2정식」): 말풍선 아래 카드 줄 · ☆ 찜 ↔ ★ 찜함 · 캠프 모루 이름표 ★n · 모루 💡 목록 · 도감 ★ 맨 위 · 만든 카드 = 배지에서 빠짐 · 다시 열어도 유지 · 선생님 = 찜 줄 없음 · 360px
//   사용: python3 -m http.server 8765 뒤 node tools/e2e/e2e119.js <출력 폴더> (PORT 로 다른 칸)
const { chromium } = require('playwright');
const OUT = process.argv[2], U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 360, height: 780 } }); const errs = []; let ok = 0, fail = 0;
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

  const ask = (p, q) => p.evaluate((q) => { document.querySelectorAll('.modal:not(#quiz)').forEach((e) => e.remove()); DS.Quiz.ask({ name: '찜 시험', formula: '' }, { type: 'number', question: q, answer: 3 }, {}); }, q);
  const tapSym = (p, id) => p.evaluate((id) => { const x = document.querySelector(`#quiz-q .sym-t[data-st="${id}"]`); x.click(); }, id);
  const bubble = (p) => p.evaluate(() => { const b = document.querySelector('.st-bub'); return b ? { wish: (b.querySelector('.st-wish') || {}).textContent || '', btn: (b.querySelector('.st-wb') || {}).textContent || '', sw: document.documentElement.scrollWidth, iw: innerWidth } : null; });
  await S.evaluate(async () => { const m = await DS.Account.me(); DS.SymTalk.setCtx(m, 'set-04'); }); await S.waitForTimeout(800);
  await ask(S, 'n(A∩B) = ?  A = B'); await S.waitForTimeout(900);
  await tapSym(S, 'cap'); await S.waitForTimeout(300); let bb = await bubble(S);
  check(bb && /교집합/.test(bb.wish) && /☆ 찜/.test(bb.btn) && bb.sw <= bb.iw + 1, `말풍선 아래 = 교집합 카드 · ☆ 찜 (${bb && bb.wish})`);
  await S.screenshot({ path: `${OUT}/119-bubble.png` });
  await S.click('.st-bub .st-wb'); await S.waitForTimeout(600); bb = await bubble(S);
  const wsv = await S.evaluate(async () => { const m = await DS.Account.me(); return DS.Net.get(`xp/${m.c}/${m.n}/wish`); });
  check(bb && /★ 찜함/.test(bb.btn) && wsv && wsv.inter === true, `☆ 찜 → ★ 찜함 · 서버 저장 (${JSON.stringify(wsv)})`);
  await S.evaluate(() => DS.SymTalk.close());
  await tapSym(S, 'eq'); await S.waitForTimeout(300); bb = await bubble(S); check(bb && /서로 같은 집합/.test(bb.wish), '= 기호도 카드(서로 같은 집합)'); await S.evaluate(() => DS.SymTalk.close());
  // 캠프 모루 배지
  await S.evaluate(() => { document.querySelectorAll('#quiz').forEach((q) => q.classList.add('hidden')); DS.Camp.back(); }); await S.waitForTimeout(3500); await S.evaluate(() => { const x = document.querySelector('.rv96 .ui-x, #rv96-ok'); if (x) x.click(); }); await S.waitForTimeout(400);
  let lab = await S.evaluate(() => (document.querySelector('#camp-anvil .camp-label') || {}).textContent || '');
  check(/★1/.test(lab), `캠프 모루 이름표 ★1 (${lab})`);
  // 모루 안: 💡 목록 · 도감
  await S.evaluate(async () => { const m = await DS.Account.me(); await DS.Forge.open(m); }); await S.waitForTimeout(1200);
  await S.click('#fg-hints'); await S.waitForTimeout(600);
  const hl = await S.evaluate(() => { const g = [...document.querySelectorAll('.fc-hgroup')].find((d) => /4차시/.test(d.querySelector('summary').textContent)); const rows = g ? [...g.querySelectorAll('.fc-hint')] : []; return { open: g && g.open, first: rows[0] ? rows[0].className + '|' + rows[0].textContent.slice(0, 20) : '' }; });
  check(hl.open && /wish/.test(hl.first) && /★/.test(hl.first), `💡 4차시 펼침 · 찜 카드 ★ 맨 위 (${hl.first})`);
  await S.evaluate(() => document.querySelector('#fg-hx').click()); await S.waitForTimeout(300);
  await S.click('#forge [data-tab="book"]'); await S.waitForTimeout(600);
  const bk = await S.evaluate(() => { const g = [...document.querySelectorAll('#forge .fc-hgroup')].find((d) => d.querySelector('.fg-wish')); return g ? g.querySelector('.fg-cw').className : ''; });
  check(/wish/.test(bk), '도감 = 찜 카드 ★ 맨 위');
  await S.screenshot({ path: `${OUT}/119-forge.png` });
  await S.evaluate(() => DS.Forge.close()); await S.waitForTimeout(500);
  // 다시 열어도 유지
  await S.reload(); await S.waitForTimeout(2500);
  await S.evaluate(async () => { const m = await DS.Account.me(); DS.SymTalk.setCtx(m, 'set-04'); }); await S.waitForTimeout(1000);
  await ask(S, 'n(A∩B) = ?'); await S.waitForTimeout(900); await tapSym(S, 'cap'); await S.waitForTimeout(300); bb = await bubble(S);
  check(bb && /★ 찜함/.test(bb.btn), '다시 열어도 ★ 찜함'); await S.evaluate(() => DS.SymTalk.close());
  // 만든 카드 = 배지에서 빠짐 · 말풍선 ✅ 가짐
  await S.evaluate(async () => { const m = await DS.Account.me(); await DS.Net.set(`cards/${m.c}/${m.n}/inter`, true); });
  await S.evaluate(() => { document.querySelectorAll('#quiz').forEach((q) => q.classList.add('hidden')); DS.Camp.back(); }); await S.waitForTimeout(3500); await S.evaluate(() => { const x = document.querySelector('.rv96 .ui-x, #rv96-ok'); if (x) x.click(); }); await S.waitForTimeout(400);
  lab = await S.evaluate(() => (document.querySelector('#camp-anvil .camp-label') || {}).textContent || ''); check(!/★/.test(lab), `만든 뒤 배지 없음 (${lab})`);
  // 선생님 = 찜 줄 없음
  await T.evaluate(() => DS.SymTalk.setCtx(null, 'set-04')); await ask(T, 'n(A∩B) = ?'); await T.waitForTimeout(900); await tapSym(T, 'cap'); await T.waitForTimeout(300);
  check(await T.evaluate(() => !!document.querySelector('.st-bub') && !document.querySelector('.st-bub .st-wish')), '선생님 = 찜 줄 없음');
  console.log(`e2e119: 확인 ${ok} · 실패 ${fail}`, errs.length ? `errors: ${errs.join(' | ')}` : 'errors: none');
  await b.close(); process.exit(fail || errs.length ? 1 : 0);
})();