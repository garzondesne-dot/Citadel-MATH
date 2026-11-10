// 🏕 6판 캠프 재편 (2026-11-07): 🎯 복습 한곳 · ✏ 출제 공방(만들기 → 선생님 ✅ → 친구 허수아비) · 📮 우편함(공지 · 친구 선물 받기 · 보내기)
//   node tools/e2e/e2e76.js <출력 폴더>  (로컬 서버 http://localhost:8765 · 이 기기 모드라 2번 학생은 데이터로 흉내)
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept('잘 만들었어요!')); return p; };
  const P = (s) => { log.push(s); console.log(s); };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.evaluate(async () => { await DS.Net.set('unlock/1-3', 5); await DS.Net.set('gem/1-3/2', { total: 20, earned: 20 }); });
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500);
  if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); });
  await S.click('#s-go'); await S.waitForTimeout(2000);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); await DS.Gem.add({ c: '1-3', n: 1 }, 30, 'e2e', '시험', { free: true }); });
  // ① 2번 학생이 낸 문제 → 선생님 ✅ 출제 → 💎 +10 · 📜 +1
  await T.evaluate(async () => { const q = { n: 2, name: '2번 이서연', lesson: 'set-05', mid: 'm1', seed: 'e2e-q', note: '세 집합을 차례로 합쳐요', st: 'wait', at: Date.now() }; await DS.Net.set('quest/1-3/qb', q); });
  const pend = await T.evaluate(() => DS.Quest.pendingCount());
  await T.evaluate(async () => { const q = await DS.Net.get('quest/1-3/qb'); await DS.Quest.approve('1-3', 'qb', q); });
  const g2 = await T.evaluate(async () => { const d = await DS.Gem.mine({ c: '1-3', n: 2 }); return { total: d.total, scroll: d.scroll, st: (await DS.Net.get('quest/1-3/qb')).st }; });
  P(`① 출제 확인 대기 ${pend} → ✅ 출제: 2번 💎 ${g2.total} · 📜 ${g2.scroll} · 상태 ${g2.st}`);
  // ② 🎯 복습 허수아비 = 복습 한곳 (남은 복습 · 개념 다시 보기 · 친구가 낸 문제)
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1500);
  await S.click('#camp-dummy', { force: true }); await S.waitForTimeout(2500); await S.screenshot({ path: `${OUT}/76-1-dummy.png`, fullPage: true });
  const dummy = await S.evaluate(() => ({ quest: !!document.querySelector('[data-qfight="qb"]'), shelf: document.querySelectorAll('[data-shelf]').length, todo: !!document.querySelector('.bn-todo') }));
  await S.click('[data-qfight="qb"]'); await S.waitForTimeout(1500); await S.screenshot({ path: `${OUT}/76-2-quest-fight.png` });
  const fightOpen = await S.evaluate(() => !!document.querySelector('.bn-fight'));
  const cpt = await S.evaluate(() => (document.querySelector('.bn-fight .bf-cpt') || {}).textContent || '');
  P(`② 허수아비: 친구 문제 ${dummy.quest} · 개념 다시 보기 ${dummy.shelf} · 남은 복습 칸 ${dummy.todo} · 친구 문제 전투 ${fightOpen} · 「${cpt.trim().slice(0, 30)}」`);
  await S.evaluate(() => { const x = document.querySelector('#bf-x'); if (x) x.click(); }); await S.waitForTimeout(800);
  await S.click('#bn-back'); await S.waitForTimeout(1500);
  // ③ ✏ 출제 공방: 틀 → 숫자 → 풀이 → 보내기
  await S.click('#camp-tent', { force: true }); await S.waitForTimeout(1500);
  await S.click('#qs-new'); await S.waitForTimeout(400); await S.click('.qs-frames [data-mid]'); await S.waitForTimeout(300); await S.click('#qs-next'); await S.waitForTimeout(400);
  const before = await S.textContent('.qs-paper'); await S.click('#qs-roll'); await S.waitForTimeout(300); const after = await S.textContent('.qs-paper');
  await S.screenshot({ path: `${OUT}/76-3-forge.png` });
  await S.click('#qs-next'); await S.waitForTimeout(300); await S.fill('#qs-note', '두 집합을 먼저 합치고 나머지를 더해요'); await S.click('#qs-next'); await S.waitForTimeout(300);
  await S.click('#qs-send'); await S.waitForTimeout(1200); await S.screenshot({ path: `${OUT}/76-4-forge-list.png` });
  const mineQ = await S.evaluate(async () => Object.values((await DS.Net.get('quest/1-3')) || {}).filter((x) => x.n === 1).map((x) => x.st));
  P(`③ 출제 공방: 숫자 바뀜 ${before !== after} · 보낸 문제 상태 ${mineQ.join(',')} · 「정답」 표시 ${/게임이 계산한 정답/.test(after)}`);
  await S.evaluate(() => document.querySelector('#qs-x').click()); await S.waitForTimeout(500);
  // ④ 📮 우편함: 공지 + 친구 선물(반 켜기 → 2번이 보냄 → 받기) + 보내기
  await T.evaluate(async () => { await DS.Mail.notice('1-3', '내일 6차시 형성평가 있어요'); await DS.Mail.setGift('1-3', true); await DS.Mail.send({ c: '1-3', n: 2, name: '이서연' }, 1, 5, '힘내!'); });
  await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(2500);
  const badge = await S.evaluate(() => (document.querySelector('#camp-mail .ml-badge') || {}).textContent || '0');
  await S.evaluate(() => document.querySelectorAll('.nt-pop').forEach((e) => e.remove())); // 📢 #61 공지 팝업은 닫고
  await S.click('#camp-mail', { force: true }); await S.waitForTimeout(1500); await S.screenshot({ path: `${OUT}/76-5-mail.png`, fullPage: true });
  const g0 = await S.evaluate(async () => (await DS.Gem.mine({ c: '1-3', n: 1 })).total);
  await S.click('[data-claim]'); await S.waitForTimeout(1200);
  const g1 = await S.evaluate(async () => (await DS.Gem.mine({ c: '1-3', n: 1 })).total);
  const notice = await S.evaluate(() => /6차시 형성평가/.test(document.querySelector('.mail-list').textContent));
  await S.click('#ml-gift'); await S.waitForTimeout(800); await S.click('[data-to="2"]'); await S.waitForTimeout(300); await S.screenshot({ path: `${OUT}/76-6-gift.png` });
  await S.click('#gf-go'); await S.waitForTimeout(1200);
  const g2b = await S.evaluate(async () => ({ me: (await DS.Gem.mine({ c: '1-3', n: 1 })).total, sent: Object.keys((await DS.Net.get('fgift/1-3/2')) || {}).length }));
  P(`④ 우편함 배지 ${badge} · 공지 ${notice} · 친구 선물 받기 💎 ${g0} → ${g1} · 보내기 → 내 💎 ${g2b.me} · 2번 선물함 ${g2b.sent}`);
  const ok = pend === 1 && g2.st === 'ok' && g2.total === 30 && g2.scroll === 1 && dummy.quest && dummy.shelf > 0 && fightOpen && /개념/.test(cpt) && before !== after && mineQ.includes('wait')
    && Number(badge) >= 2 && notice && g1 === g0 + 5 && g2b.me === g1 - 5 && g2b.sent >= 1;
  console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs.slice(0, 5) : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
