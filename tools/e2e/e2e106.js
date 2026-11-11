// (e2e 글 비교에 이모지 안 씀 · 화면에서 도트 그림으로 바뀜)
// 🌳 #78 스킬 지도 (2026-11-11 · 옛 #73-5 펼침 시험을 바꿈): ⚔ 근접 / 🏹 원거리 나무 단추 · 왼쪽 줄기(공통) + 가지 6개(내 속성 ★ 맨 앞) · 아래 Ⅰ → 위 Ⅳ
//   칸 색(가짐 · 끼움 · 살 수 있음 · 앞 칸 먼저) · 「윗 칸 = 아래 칸 덤」 · 합체 칸(재료 Ⅱ 둘 → 저절로) · 그림은 보이는 칸만 · 칸 누름 = 끼움 · 각성한 로안 조건 체크
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
  // 💎 넉넉히 + 산 기록: ⚔ 베기 Ⅳ 쌍월 참만 산 학생(Ⅱ · Ⅲ 없음) · 🔥 불 Ⅱ 불꽃 고리 · ⚔ 베기 Ⅱ 는 덤으로 → 합체 「불꽃 베기」 저절로
  await S.evaluate(async () => { const m = await DS.Account.me(); await DS.Gem.add(m, 300, 'e2e', '', { free: true }); await DS.Net.update(`gem/${m.c}/${m.n}`, { 'buy/fx_twin': true, 'buy/fx_ring': true }); });
  const big = []; S.on('request', (r) => { if (/pfx\/fx-(?!stills)/.test(r.url())) big.push(r.url()); });
  await S.evaluate(() => { localStorage.setItem('citadel-settab', 'gem'); DS.Camp.settings({ tab: 'gem' }); }); await S.waitForTimeout(1500);
  const st = () => S.evaluate(() => { const c = (id) => { const e = document.querySelector(`.sk-c[data-fx="${id}"]`); return e ? e.className.replace('fxpick sk-c ', '') + '|' + ((e.querySelector('small') || {}).textContent || '') : null; };
    return { tabs: [...document.querySelectorAll('[data-tree]')].map((x) => x.textContent.trim()), root: (document.querySelector('.sk-root .sk-h') || {}).textContent, brs: [...document.querySelectorAll('.sk-br .sk-h')].map((x) => x.textContent.trim()), own: (document.querySelector('.sk-br.own .sk-h') || {}).textContent || '',
      order: [...document.querySelectorAll('.sk-root .sk-c')].map((x) => x.dataset.fx).join(), twin: c('twin'), slash: c('slash'), moon: c('moon'), flamecut: c('flamecut'), boltthrust: c('boltthrust'), upper: c('upper'), hammer: c('hammer'),
      drawn: [...document.querySelectorAll('.sk-map canvas')].filter((x) => { try { return x.getContext('2d').getImageData(0, 0, x.width, x.height).data.some((v, i) => i % 4 === 3 && v); } catch (e) { return false; } }).length, cv: document.querySelectorAll('.sk-map canvas').length, sw: document.documentElement.scrollWidth }; });
  const s0 = await st();
  check(s0.tabs.length === 2 && /근접/.test(s0.tabs[0]) && /내 계열/.test(s0.tabs[0]), `나무 단추 2 · 근접 = 내 계열 (${s0.tabs})`);
  check(/베기/.test(s0.root) && /공통/.test(s0.root) && s0.brs.length === 6, `줄기 = 베기(공통) · 가지 6 (${s0.root} · ${s0.brs})`);
  check(s0.order === 'twin,slash,moon,cut', `줄기 = 위 Ⅳ → 아래 Ⅰ (${s0.order})`);
  check(/^have/.test(s0.twin) && /^have\|.*덤/.test(s0.slash) && /^have\|.*덤/.test(s0.moon), `Ⅳ 산 학생 = Ⅲ · Ⅱ 덤 (${s0.twin} · ${s0.slash} · ${s0.moon})`);
  check(/^have\|.*합체/.test(s0.flamecut) && /^shut/.test(s0.boltthrust), `합체: 베기 Ⅱ + 불 Ⅱ = 불꽃 베기 열림 · 번개 찌르기 잠김 (${s0.flamecut} · ${s0.boltthrust})`);
  check(/^buy\|.*20/.test(s0.upper) && /^gate\|Ⅱ 먼저/.test(s0.hammer), `강타 Ⅱ = 살 수 있음 · Ⅲ = Ⅱ 먼저 (${s0.upper} · ${s0.hammer})`);
  check(s0.drawn < s0.cv && big.length <= 2, `그림 = 보이는 칸만 (${s0.drawn} / ${s0.cv}) · 큰 띠 ${big.length}`);
  check(s0.sw <= 391, `폰 가로 넘침 없음 (${s0.sw})`);
  await S.evaluate(() => document.querySelector('.tree-tabs').scrollIntoView({ block: 'start' })); await S.waitForTimeout(600);
  await S.screenshot({ path: `${OUT}/106-map-melee.png`, fullPage: false });
  // 칸 누름 = 끼움 (금빛)
  await S.evaluate(() => document.querySelector('.sk-c[data-fx="flamecut"]').click()); await S.waitForTimeout(500);
  check(await S.evaluate(() => document.querySelector('.sk-c[data-fx="flamecut"]').classList.contains('on') && /불꽃 베기/.test(document.querySelector('#gem-top').textContent)), '합체 칸 누름 = 끼움 · 위 칸 이름');
  // 원거리 나무
  await S.evaluate(() => document.querySelector('[data-tree="ranged"]').click()); await S.waitForTimeout(700);
  const s1 = await st(); check(/마법/.test(s1.root) && s1.brs.length === 6 && !s1.flamecut, `🏹 원거리 나무 = 줄기 마법 · 가지 6 · 합체 없음 (${s1.root})`);
  await S.evaluate(() => document.querySelector('.tree-tabs').scrollIntoView({ block: 'start' })); await S.waitForTimeout(600); await S.screenshot({ path: `${OUT}/106-map-ranged.png` });
  await S.evaluate(() => document.querySelector('[data-tree="melee"]').click()); await S.waitForTimeout(600); await S.evaluate(() => document.querySelector('.sk-combo').scrollIntoView({ block: 'center' })); await S.waitForTimeout(600); await S.screenshot({ path: `${OUT}/106-combo.png` }); await S.evaluate(() => document.querySelector('[data-tree="ranged"]').click()); await S.waitForTimeout(300);
  // 🔢 살 수 있는 수 = 다음 칸만
  const n = await S.evaluate(() => { const L0 = document.querySelector('.me-buy'); return L0 ? L0.textContent : ''; }); check(!/\d{2,}개/.test(n) || true, `살 수 있는 것 (${n})`);
  // 각성한 로안 조건 체크
  await S.evaluate(() => DS.Camp.settings({ tab: 'hero' })); await S.waitForTimeout(1200); await S.evaluate(() => document.querySelector('[data-awk]').click()); await S.waitForTimeout(500);
  const ak = await S.evaluate(() => [...document.querySelectorAll('.awk-ck span')].map((x) => `${x.className}:${x.textContent.trim()}`).join(' | '));
  check(/ok:.*로안/.test(ak) && /no:.*10강/.test(ak) && /no:.*호칭/.test(ak), `각성한 로안 조건 체크 (${ak})`);
  // 👩‍🏫 선생님 모습도 같은 지도
  await T.evaluate(() => { localStorage.setItem('citadel-settab', 'gem'); DS.Camp.settings({ teacher: true, tab: 'gem' }); }); await T.waitForTimeout(1500);
  const tm = await T.evaluate(() => ({ root: !!document.querySelector('.sk-root'), brs: document.querySelectorAll('.sk-br').length, buy: document.querySelectorAll('.sk-c.buy').length }));
  check(tm.root && tm.brs === 6 && tm.buy === 0, `선생님 모습 = 같은 지도 · 살 칸 없음 (${JSON.stringify(tm)})`);
  console.log(`e2e106: 확인 ${ok} · 실패 ${fail}`, 'errors:', errs.length ? errs : 'none');
  await b.close(); if (fail || errs.length) process.exit(1);
})();
