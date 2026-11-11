// (e2e 글 비교에 이모지 안 씀 · 화면에서 도트 그림으로 바뀜)
// 🪜 #96 스킬 사다리 (2026-11-11 · 옛 #78 스킬 지도 시험을 바꿈): 지금 용사 사다리 4칸 위 Ⅰ → 아래 Ⅳ · 다음 칸 크게 + 미리 보기 · 칸마다 필살기 표시 · 판정 한 줄 · 규칙 상자
//   다른 갈래 · 나무 단추 · 합체 칸 없음 · 용사를 바꾸면 그 사다리 · 용사 카드에 4칸 미리 보기 · 사다리 밖으로 끼운 스킬 = Ⅰ
//   사용: python3 -m http.server 8765 뒤 node tools/e2e/e2e106.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
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
  await S.evaluate(async () => { const m = await DS.Account.me(); await DS.Gem.add(m, 300, 'e2e', '', { free: true }); await DS.Net.update(`accounts/${m.c}/${m.n}`, { hero: 0, fx: 'void', socket: { 0: 'void' } }); m.hero = 0; m.fx = 'void'; m.socket = { 0: 'void' }; });
  await S.evaluate(() => { localStorage.setItem('citadel-settab', 'gem'); DS.Camp.settings({ tab: 'gem' }); }); await S.waitForTimeout(1500);
  const st = () => S.evaluate(() => ({ lad: [...document.querySelectorAll('.lad .lad-c')].map((x) => x.dataset.fx), cls: [...document.querySelectorAll('.lad .lad-c')].map((x) => x.className.replace('fxpick sk-c lad-c ', '')), ult: [...document.querySelectorAll('.lad .lad-c')].map((x) => x.querySelectorAll('.sk-ult').length),
    next: (document.querySelector('.lad-next b') || {}).textContent || '', nextBtn: !!document.querySelector('.lad-next [data-lbuy]'), prev: !!document.querySelector('.lad-next [data-lprev]'), v: (document.querySelector('#lad-v') || {}).textContent || '', rule: (document.querySelector('.lad-rule') || {}).textContent || '',
    tree: document.querySelectorAll('[data-tree], .sk-map, .sk-combo').length, top: (document.querySelector('.sock b') || {}).textContent || '', sw: document.documentElement.scrollWidth, iw: innerWidth }));
  const s0 = await st();
  check(s0.lad.join() === 'cut,moon,slash,twin', `로안 사다리 = 베기 Ⅰ~Ⅳ 위에서 아래 (${s0.lad})`);
  check(s0.ult.join() === '0,0,1,2', `필살기 표시 = Ⅲ 1개 · Ⅳ 2개 (${s0.ult})`);
  check(s0.tree === 0, '나무 단추 · 지도 · 합체 칸 없음');
  check(/달빛 베기/.test(s0.next) && s0.nextBtn && s0.prev, `다음 칸 = Ⅱ 달빛 베기 · 열기 · 미리 보기 (${s0.next})`);
  check(/필살기 없음/.test(s0.v) && /3연속/.test(s0.rule), `판정 한 줄 (${s0.v}) · 규칙 상자`);
  check(/베기/.test(s0.top) && !/블랙홀/.test(s0.top), `사다리 밖으로 끼운 블랙홀 → 베기 Ⅰ (${s0.top})`);
  check(s0.sw <= s0.iw + 1, '가로 넘침 없음');
  await S.screenshot({ path: `${OUT}/106-ladder.png` }); await S.evaluate(() => { const sb = document.querySelector('.set-box'); sb.scrollTop = sb.scrollHeight; }); await S.waitForTimeout(300); await S.screenshot({ path: `${OUT}/106-ladder2.png` }); await S.evaluate(() => { document.querySelector('.set-box').scrollTop = 0; });
  // 칸 누름 = 판정 한 줄 · Ⅲ 는 앞 칸 먼저
  await S.click('.lad-c[data-fx="slash"]'); await S.waitForTimeout(300); let s1 = await st();
  check(/필살기 가능/.test(s1.v) && s1.cls[2].includes('pk'), `Ⅲ 누름 → 「${s1.v}」`);
  // 다음 칸 열기 (💎)
  await S.click('.lad-next [data-lbuy]'); await S.waitForTimeout(1500); s1 = await st();
  check(s1.cls[1].startsWith('have') && /삼연 참격/.test(s1.next), `Ⅱ 산 뒤 다음 칸 = Ⅲ (${s1.cls[1]} · ${s1.next})`);
  // 미리 보기 공격
  await S.click('.lad-next [data-lprev]'); await S.waitForTimeout(600);
  check(await S.evaluate(() => !!document.querySelector('#ap .fx2, #ap canvas, #ap [class*="fx"]')), '▶ 미리 보기 공격 재생');
  // 용사 바꾸기 → 그 사다리 · 용사 카드 4칸 미리 보기
  await S.click('[data-tab="hero"]'); await S.waitForTimeout(800);
  await S.click('.hpick[data-h="2"]'); await S.waitForTimeout(600);
  const pk = await S.evaluate(() => [...document.querySelectorAll('.lad-peek span')].length);
  check(pk === 4, `용사 카드 = 사다리 4칸 미리 보기 (${pk})`);
  await S.waitForTimeout(2500); await S.evaluate(() => { const hc = document.querySelector('.hero-card'); if (hc) hc.scrollIntoView({ block: 'start' }); }); await S.waitForTimeout(300); await S.screenshot({ path: `${OUT}/106-herocard.png` });
  check(await S.evaluate(() => { const p = document.querySelector('.lad-peek'), r = p.getBoundingClientRect(); return [...p.querySelectorAll('span')].every((x) => { const q = x.getBoundingClientRect(); return q.right <= r.right + 1 && q.width > 30; }); }), '용사 카드 4칸이 카드 안에 모두 보임');
  await S.click('[data-hset]'); await S.waitForTimeout(400); await S.click('[data-tab="gem"]'); await S.waitForTimeout(1200);
  const s2 = await st(); check(s2.lad.join() === 'wblade,gale,leaf,cyclone', `리아넬 → 바람 사다리 (${s2.lad})`);
  console.log(`e2e106: 확인 ${ok} · 실패 ${fail}`, errs.length ? `errors: ${errs.join(' | ')}` : 'errors: none');
  await b.close(); process.exit(fail || errs.length ? 1 : 0);
})();