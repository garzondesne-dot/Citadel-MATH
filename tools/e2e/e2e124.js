// 📝 #126 세특 초안 = 생기부 낱말 (2026-11-12): 대시보드 「⑦ 세특 메모」 · 학생 상세 · 게임 낱말 없음 · 더 보기 줄 · 복사 = 본문만 — node tools/e2e/e2e124.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1000, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push(e.message)); T.on('dialog', (d) => d.accept());
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(async () => {
    await DS.Account.uploadRoster([{ c: '1-2', n: 1, name: '가나' }, { c: '1-2', n: 2, name: '다라' }]);
    await DS.Net.set('records/1-2/1/set-09', { no: 9, conc: { c1: [9, 10], c2: [4, 5] }, names: { c1: '명제 p → q 의 참 · 거짓', c2: '역과 대우' }, boss: 4, bossN: 4, won: true, fixed: 6, hg: 2, hints: 3, miss: ['m2'] });
    await DS.Net.set('records/1-2/1/set-10', { no: 10, conc: { c1: [5, 5] }, names: { c1: '충분조건과 필요조건' }, boss: 3, bossN: 4, won: true, fixed: 2 });
    await DS.Net.set('records/1-2/2/set-09', { no: 9, conc: { c1: [2, 10] }, names: { c1: '명제 p → q 의 참 · 거짓' }, boss: 1, bossN: 4, won: true, fixed: 0 });
    await DS.Net.set('bonus/1-2/1/eval-2/q01', { tries: 7 }); await DS.Net.set('bonus/1-2/1/set-09/m2', { tries: 3, clear: true }); // 📕 문제 2 를 복습에서 다시 풀어 보완 await DS.Net.set('cards/1-2/1/c1', { at: 1 });
    await DS.Net.set('surveyDone/1-2/1', true); await DS.Net.set('xp/1-2/1', { total: 500, st: { 'set-09': { conv: 2 } } });
  });
  await T.evaluate(() => DS.Dash.enter()); await T.waitForTimeout(1500);
  await T.evaluate(() => document.querySelector('#dash-body [data-tab="memo"]').click()); await T.waitForTimeout(800);
  const memos = await T.evaluate(() => [...document.querySelectorAll('#dash-body .dash-memo')].map((e) => ({ main: e.querySelector('p').textContent, more: (e.querySelector('.dash-more') || {}).textContent || '' })));
  const BAN = ['레이드', '몬스터', '보스', '던전', '성채', '허수아비', '모루', '용사', '레벨', 'EXP', '콤보', '랭킹', '처치', '등수'];
  const all = memos.map((m) => m.main + m.more).join(' ');
  ok(memos.length === 2, `세특 메모 2명 (${memos.length})`);
  ok(BAN.every((w) => !all.includes(w)), `게임 낱말 없음 ${BAN.filter((w) => all.includes(w))}`);
  ok(/^모둠 협동학습 형태의 수학 수업/.test(memos[0].main) && /2차시 중 2차시에 참여함\(전 차시 참여\)/.test(memos[0].main), `1번 = 참여 문장 먼저 (${memos[0].main.slice(0, 60)})`);
  ok(/단원 평가 문항에 7회 도전/.test(all) && /오답을 다시 풀어 보완을 완료함\(1문항\)/.test(all) && /성찰에 참여함/.test(all), '자기주도 · 오답 · 성찰 문장 (기록 그대로)');
  ok(memos[0].main.length <= 500 && memos[0].main.split('. ').length <= 6, `본문 6문장 · 500자 안 (${memos[0].main.length}자)`);
  ok(memos[0].more.startsWith('더 보기'), '넘친 문장 = 더 보기 줄');
  ok(!/단원 평가|성찰|친구를 돕/.test(memos[1].main), '2번 = 없는 기록 문장 없음');
  await T.screenshot({ path: `${OUT}/124-memo.png` });
  await T.evaluate(() => document.querySelector('#dash-body [data-copy="1-2|1"]').click()); await T.waitForTimeout(400);
  const clip = await T.evaluate(() => navigator.clipboard.readText()).catch(() => '');
  ok(clip === memos[0].main, '복사 = 본문만');
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
