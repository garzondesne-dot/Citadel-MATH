// 📖 #105 기호 톡 = 형광펜 (2026-11-12 선생님 A · 정식): 점선 없음 · 금빛 띠 · 누르는 칸 넓힘(이웃 기호와 섞이지 않게 가까운 쪽) · 한 번 본 기호 = 회색(다시 열어도) · 선생님 = 늘 금빛 · 360px 가로 넘침 0
//   사용: python3 -m http.server 8765 뒤 node tools/e2e/e2e118.js <출력 폴더> (PORT 로 다른 칸)
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

  const ask = (p) => p.evaluate(() => { document.querySelectorAll('.modal:not(#quiz)').forEach((e) => e.remove()); DS.Quiz.ask({ name: '기호 톡 시험', formula: '' }, { type: 'number', question: 'n(Aᶜ∩Bᶜ) = ?  A∪B = U', answer: 3 }, {}); });
  const spans = (p) => p.evaluate(() => [...document.querySelectorAll('#quiz-q .sym-t:not(.sym-c)')].map((x) => { const r = x.getBoundingClientRect(), cs = getComputedStyle(x); return { id: x.dataset.st, seen: x.classList.contains('seen'), x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, deco: cs.textDecorationLine, bg: cs.backgroundImage }; }));
  await S.evaluate(async () => { const m = await DS.Account.me(); DS.SymTalk.setCtx(m, 'set-06'); }); await S.waitForTimeout(300);
  await ask(S); await S.waitForTimeout(900);
  let sp = await spans(S);
  check(sp.length >= 5 && sp.every((x) => x.deco === 'none' && /245, 184, 74/.test(x.bg) && !x.seen), `형광펜 금빛 · 점선 없음 · ${sp.length}칸 (${sp.map((x) => x.id).join(' ')})`);
  await S.screenshot({ path: `${OUT}/118-gold.png` });
  // 하나하나 누르기: 가운데를 누르면 그 기호 말풍선
  let okTap = 0; for (const x of sp) { await S.mouse.click(x.x, x.y); await S.waitForTimeout(250); const t = await S.evaluate(() => (document.querySelector('.st-bub .st-sym') || {}).textContent || ''); if (t) okTap++; await S.evaluate(() => DS.SymTalk.close()); }
  check(okTap === sp.length, `기호마다 누르면 말풍선 (${okTap}/${sp.length})`);
  // 이웃 기호 사이: ∩ 오른쪽 2px = ∩ (B 쪽 ᶜ 가 아님)
  const cap = sp.find((x) => x.id === 'cap'); if (cap) { await S.mouse.click(cap.x + cap.w / 2 + 1, cap.y); await S.waitForTimeout(250); const t = await S.evaluate(() => (document.querySelector('.st-bub .st-sym') || {}).textContent || ''); check(/∩/.test(t), `∩ 가장자리 누름 = ∩ (${t})`); await S.evaluate(() => DS.SymTalk.close()); }
  // 위로 10px (넓힌 칸 안) = 그 기호
  { const u = sp[0]; await S.mouse.click(u.x, u.y - 10); await S.waitForTimeout(250); check(!!(await S.evaluate(() => document.querySelector('.st-bub'))), '기호 위 10px 도 눌림'); await S.evaluate(() => DS.SymTalk.close()); }
  sp = await spans(S); check(sp.every((x) => x.seen) && sp.every((x) => /140, 150, 170/.test(x.bg)), `본 기호 = 회색 (${sp.filter((x) => x.seen).length}/${sp.length})`);
  check(await S.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), '360px 가로 넘침 없음');
  await S.screenshot({ path: `${OUT}/118-seen.png` });
  // 다시 열어도 회색 (서버 기록에서)
  await S.waitForTimeout(2000); await S.reload(); await S.waitForTimeout(2500);
  await S.evaluate(async () => { const m = await DS.Account.me(); DS.SymTalk.setCtx(m, 'set-02'); }); await S.waitForTimeout(800);
  await ask(S); await S.waitForTimeout(900); sp = await spans(S);
  check(sp.length && sp.every((x) => x.seen), `다시 열어도 · 다른 차시여도 회색 (${sp.filter((x) => x.seen).length}/${sp.length})`);
  // 선생님 = 늘 금빛
  await T.evaluate(() => DS.SymTalk.setCtx(null, 'set-06')); await ask(T); await T.waitForTimeout(900); sp = await spans(T);
  check(sp.length && sp.every((x) => !x.seen && /245, 184, 74/.test(x.bg)), '선생님 = 늘 금빛');
  console.log(`e2e118: 확인 ${ok} · 실패 ${fail}`, errs.length ? `errors: ${errs.join(' | ')}` : 'errors: none');
  await b.close(); process.exit(fail || errs.length ? 1 : 0);
})();