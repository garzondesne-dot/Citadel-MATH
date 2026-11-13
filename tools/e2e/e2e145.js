// 🟢 2026-11-13 밤 선생님 「직전 맞춘 풀이를 빨간색으로 강조 → 틀렸다는 느낌 · 초록색으로」: 📜 나의 풀이 이번 단계 줄 = 초록(#0b7a4a) · 소레이드 시연(학생과 같은 부품 · e2e128 흐름) — PORT=8766 node tools/e2e/e2e145.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = []; let ok = 0, fail = 0;
  const check = (c, m) => { if (c) ok++; else fail++; console.log(`${c ? '✔' : '✘'} ${m}`); };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(() => DS.Account.uploadRoster([{ c: '1-3', n: 1, name: '김민준' }, { c: '1-3', n: 2, name: '이서연' }])); await T.waitForTimeout(600);
  await T.reload(); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]').catch(() => {}); await T.waitForTimeout(600); }
  await T.selectOption('#t-cls', '1-3'); await T.waitForTimeout(400); await T.selectOption('#lesson', 'set-10'); await T.click('#t-new'); await T.waitForTimeout(2500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/bot1`, { num: 1, nick: '학생1', hero: 1, fx: 'flame', cls: '1-3', at: Date.now() }); await DS.Net.set(`rooms/${c}/online/bot1`, true); await DS.Net.update(`rooms/${c}/state`, { solve: 0 }); }, code);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  const step = () => T.evaluate(async () => { const c = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), R); return s && s.id; });
  const duck = () => H.evaluate(() => DS.Sound.ducked);
  const goTo = async (id) => { for (let k = 0; k < 12 && (await step()) !== id; k++) { await go(); await T.waitForTimeout(700); } };
  await goTo('m1'); await H.waitForTimeout(2000); check((await step()) === 'm1', '문제 1 (일반 몬스터)');
  await H.click('#h-demo'); await H.waitForTimeout(900);
  check((await H.$$('#h-demo-ov .ans-line')).length >= 3, '시연 문제마다 「✍ 나의 답」 줄 (학생과 같음)');
  const nItems = (await H.$$('#h-demo-ov .ans-line')).length;
  for (let i = 0; i < nItems; i++) { // 보기 = 첫 단추 · 숫자 = 룬 1 (정답이 아니어도 됨 · 연출만 봄)
    const r = await H.$(`#h-demo-ov [data-rune="${i}|1"]`); if (r) { await r.click(); await H.waitForTimeout(150); continue; }
    const bt = await H.$(`#h-demo-ov [data-pick^="${i}|"]`); if (bt) { await bt.click(); await H.waitForTimeout(250); } }
  check((await H.$$('#h-demo-ov .ans-line.pen')).length === nItems, `고르면 · 룬을 누르면 그 줄에 적힘 (${nItems}줄)`);
  await H.click('#demo-go'); await H.waitForTimeout(250);
  check((await H.$$('.ans-fly')).length > 0 && !!(await H.$('.ans-card')), '⚔ 공격 → 답 줄이 📜 나의 답안으로 모임');
  await H.screenshot({ path: `${OUT}/128-merge.png` });
  await H.waitForTimeout(1100);
  const pr = await H.evaluate(() => ({ box: !!document.querySelector('#h-demo-ov .pen-res'), lis: document.querySelectorAll('#h-demo-ov .pen-res li').length, res: !!document.querySelector('#h-demo-ov .demo-res') }));
  check(pr.box && pr.lis === nItems && !pr.res, `📜 나의 답안 채점 도장 중 (${pr.lis}줄 · 결과는 도장 뒤)`);
  await H.screenshot({ path: `${OUT}/128-stamp.png` });
  await H.waitForTimeout(2000);
  check(!!(await H.$('#h-demo-ov .demo-res')) && !!(await H.$('#h-demo-ov .pen-res.pen-still')), '도장 끝 → 결과 · 해설');
  await H.click('#demo-x'); await H.waitForTimeout(500);
  const chainId = await T.evaluate(async () => { const c = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get(R.meta.lesson); const s = L.steps.find((x) => x.kind === 'monster' && DS.Raid.isChain(L, R, x.id)); return s && s.id; });
  await goTo(chainId); await H.waitForTimeout(2000); check(!!chainId && (await step()) === chainId, `소레이드 단계 (${chainId})`);
  await H.click('#h-demo'); await H.waitForTimeout(900);
  // 첫 단계: 보기를 하나씩 눌러 공격 → 맞으면 📜 나의 풀이 한 줄 (틀리면 같은 문제 그대로)
  for (let k = 0; k < 6 && !(await H.$('#h-demo-ov .cr-story li')); k++) {
    const picks = await H.$$('#h-demo-ov [data-pick]'); if (!picks[k]) break;
    await picks[k].click(); await H.waitForTimeout(250); const g = await H.$('#demo-go'); if (g && await g.isEnabled()) { await g.click(); await H.waitForTimeout(250); }
  }
  const sd = await H.evaluate(() => ({ li: document.querySelectorAll('#h-demo-ov .cr-story li').length, pix: document.querySelectorAll('#h-demo-ov .cr-story li.pix-in').length }));
  check(sd.li >= 1 && sd.pix >= 1, `소레이드 시연 = 📜 나의 풀이 새 줄 모래 새김 (${JSON.stringify(sd)})`);
  await H.screenshot({ path: `${OUT}/128-chain.png` });
  await H.waitForTimeout(1600);
  const col = await H.evaluate(() => { const li = document.querySelector('#h-demo-ov .cr-story li.cr-new'); return li ? getComputedStyle(li).color : null; });
  check(col === 'rgb(11, 122, 74)', `이번 단계 줄 = 초록 (${col})`);
  const box = await H.$('#h-demo-ov .cr-story'); if (box) await box.screenshot({ path: `${OUT}/145-green.png` });
  console.log(`e2e145: 확인 ${ok} · 실패 ${fail}`, errs.length ? `errors: ${errs.join(' | ')}` : 'errors: none'); await b.close(); process.exit(fail || errs.length ? 1 : 0);
})();
