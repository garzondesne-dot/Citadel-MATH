// 📖 #54 기호 톡 (2026-11-10): 문제 속 기호 톡 → 말풍선(정확한 뜻 · 💬 쉽게 말하면 · 더 보기) · 4초 뒤 닫힘 · 보기 안 기호는 고르지 않음 · 기록 xp/반/번호/st · 성채 문제 창 — node tools/e2e/e2e87.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.setViewportSize({ width: 1400, height: 900 }); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.evaluate(async () => { await DS.Net.set('gcfg/photo', { on: true, url: 'https://example.invalid/x' }); await DS.Net.set('photo_rubric/set-06/u4', { on: true }); });
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  const { code } = await T.evaluate(() => DS.Act.createRoom('set-06', '1-3'));
  await S.evaluate(async (c) => { await DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }); }, code).catch(() => {}); await S.waitForTimeout(1500);
  await T.evaluate(async (c) => { const L = DS.Lessons.get('set-06'); for (let i = 0; i < 12; i++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(L, R); if (s && s.id === 'u4') break; await DS.Act.go(c, R, L, 1); } const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.setSolve(c, R, L, { now: true }); }, code);
  await S.waitForTimeout(2500); const clr = () => S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove()));
  await clr(); const dk = () => S.evaluate(() => ({ go: !!document.querySelector('.cr-dock #cr-go'), wr: !!document.querySelector('.cr-dock #cr-write'), prac: (document.querySelector('.cr-dock #cr-prac') || {}).disabled, bind: !!document.querySelector('#st-bind'), heal: !!document.querySelector('#st-heal'), lis: document.querySelectorAll('.cr-story li').length }));
  const syms = await S.evaluate(() => [...document.querySelectorAll('#st-body .sym-t')].map((e) => `${e.textContent}:${e.dataset.st}`));
  ok(syms.length > 0, `문제 속 기호에 점선 (${syms.slice(0, 8).join(' ')})`);
  const bub = () => S.evaluate(() => { const b = document.querySelector('.st-bub'); return b ? { def: (b.querySelector('.st-def') || {}).textContent, easy: (b.querySelector('.st-easy') || {}).textContent, more: !!b.querySelector('.st-more'), memo: (b.querySelector('.st-memo') || {}).hidden } : null; });
  // 🐞 2026-11-11 선생님: 답 칸(보기 · 칩) 안 기호엔 톡을 안 붙임 → 문제 글 기호로 시험 · 답 칸 안 점선 0개 확인
  ok(await S.evaluate(() => !document.querySelector('#st-body .choice .sym-t, #st-body button .sym-t, #st-body label .sym-t')), '답 칸(보기 · 칩) 안 기호 = 톡 없음 (누르면 바로 고르기)');
  const target = await S.evaluate(() => { const c = [...document.querySelectorAll('#st-body .sym-t')].find((x) => !x.closest('button, .choice, label')); c.scrollIntoView({ block: 'center' }); c.id = 'sym-x'; return { inChoice: !!c.closest('.choice'), st: c.dataset.st }; });
  const y0 = await S.evaluate(() => ({ p: (document.querySelector('#st-body .paper') || {}).scrollTop || 0, w: scrollY }));
  await S.click('#sym-x'); await S.waitForTimeout(300);
  let bb = await bub(); ok(bb && bb.def && /쉽게 말하면/.test(bb.easy), `톡 → 말풍선 (${target.st}) 「${bb && bb.def}」 · 「${bb && bb.easy}」`);
  const y1 = await S.evaluate(() => ({ p: (document.querySelector('#st-body .paper') || {}).scrollTop || 0, w: scrollY }));
  ok(JSON.stringify(y0) === JSON.stringify(y1), `말풍선 떠도 스크롤 그대로 ${JSON.stringify(y1)}`);
  await S.screenshot({ path: `${OUT}/87-bubble.png` });
  await S.waitForTimeout(4300); ok(!(await bub()), '4초 뒤 닫힘');
  // 더 보기 → 닫을 때까지
  const withMore = await S.evaluate(() => { const ids = ['in', 'empty', 'sub', 'nsub', 'eq', 'cap', 'cup', 'disj', 'ncup', 'U', 'compl', 'diff', 'list', 'build', 'n']; const c = [...document.querySelectorAll('#st-body .sym-t')].find((e) => ids.includes(e.dataset.st)); if (c) { c.id = 'sym-y'; c.scrollIntoView({ block: 'center' }); } return !!c; });
  if (withMore) { await S.click('#sym-y'); await S.waitForTimeout(300); await S.click('.st-bub .st-more'); await S.waitForTimeout(4500); bb = await bub(); ok(bb && bb.memo === false, '더 보기 펼치면 4초가 지나도 그대로'); await S.screenshot({ path: `${OUT}/87-more.png` }); const r0 = await S.evaluate(() => { const r = document.querySelector('.st-bub').getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; }); await S.mouse.click(30, r0.top > 200 ? r0.top - 60 : r0.bottom + 60); await S.waitForTimeout(300); ok(!(await bub()), '바깥 누르면 닫힘'); }
  // 기록
  await S.waitForTimeout(2000);
  const st = await S.evaluate(() => DS.Net.get('xp/1-3/1/st')); ok(st && st['set-06'] && Object.values(st['set-06']).reduce((a, v) => a + v, 0) >= 2, `기록 xp/1-3/1/st = ${JSON.stringify(st)}`);
  // 나의 풀이 (첫 졸개 맞힌 뒤)
  await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'), me = DS.Net.uid(), it = DS.Raid.chainItems(L, R, 'u4', me, 0); await DS.Net.set(`rooms/${c}/chain/u4/${me}/0`, { s: 0, p: 0, g: DS.Raid.chainAns(it[0]), at: DS.Net.TS }); await DS.Net.set(`rooms/${c}/chain/u4/${me}/1`, { s: 1, p: 0, g: DS.Raid.chainAns(it[1]), at: DS.Net.TS }); }, code);
  await S.waitForTimeout(3000); await clr();
  await S.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'), me = DS.Net.uid(), it = DS.Raid.chainItems(L, R, 'u4', me, 0); await DS.Net.set(`rooms/${c}/chain/u4/${me}/2`, { s: 2, p: 0, g: DS.Raid.chainAns(it[2]), at: DS.Net.TS }); }, code); await S.waitForTimeout(3000); await clr();
  const pc = await S.evaluate(() => { const c = document.querySelector('#st-body .sym-c'); if (!c) return null; c.scrollIntoView({ block: 'center' }); c.click(); const b = document.querySelector('.st-bub'); return { chip: c.textContent, def: b && (b.querySelector('.st-def') || {}).textContent }; });
  ok(pc && pc.chip === '2ⁿ' && /부분집합의 개수는 2ⁿ 개/.test(pc.def || ''), `📖 개념 톡: 문제 4 대장 「집합 X 의 개수는?」 옆 2ⁿ → 「${pc && pc.def}」`); await S.mouse.click(5, 5); await S.waitForTimeout(1800);
  const st2 = await S.evaluate(() => DS.Net.get('xp/1-3/1/st/set-06')); ok(st2 && st2['2^n'] >= 1, `개념 톡 기록 키 2^n (${JSON.stringify(st2)})`);
  const story = await S.evaluate(() => [...document.querySelectorAll('#st-body .cr-story .sym-t')].map((e) => `${e.textContent}:${e.dataset.st}`)); ok(story.length > 0, `📜 나의 풀이 기호도 (${story.join(' ')})`);
  // 대시보드 「📖 기호 톡」
  await T.evaluate(() => DS.Dash.enter()); await T.waitForTimeout(1800); if (await T.isVisible('[data-cls="1-3"]')) { await T.click('[data-cls="1-3"]'); await T.waitForTimeout(1500); }
  await T.click('[data-tab="sym"]'); await T.waitForTimeout(800);
  const dt = await T.evaluate(() => (document.querySelector('.dash-main') || {}).innerText || ''); ok(/조건/.test(dt) && /번/.test(dt), `대시보드 📖 기호 톡 순위 (${dt.replace(/\s+/g, ' ').slice(0, 90)})`);
  await T.screenshot({ path: `${OUT}/87-dash.png` });
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
