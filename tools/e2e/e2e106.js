// (e2e 글 비교에 이모지 안 씀 · 화면에서 도트 그림으로 바뀜)
// 🧙 #98 내 용사 창 새 구조 (2026-11-11 · 옛 #73 소개 카드 e2e105 · #96 사다리 시험을 바꿈): 맨 위 출전 용사 · 탭 강화(처음) · 스킬 · 기록
//   강화 · 스킬 해금 · 용사 사기 · 출전 바꾸기 = 「고름」(💎 화면에서만 빠짐) → 저장 막대 [되돌리기] [저장] · 저장 = 서버에 한 번에 · 저장 안 하고 닫으면 한 번 물음
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
  const srv = () => S.evaluate(async () => { const m = await DS.Account.me(); const g = (await DS.Net.get(`gem/${m.c}/${m.n}`)) || {}, a = (await DS.Net.get(`accounts/${m.c}/${m.n}`)) || {}; return { total: g.total, enh: g.enh || 0, buy: Object.keys(g.buy || {}), v: Object.entries(g.log || {}).filter(([k]) => /^buy_/.test(k)).map(([k, x]) => `${k}:${x.v}`), hero: a.hero, fx: a.fx }; });
  const ui = () => S.evaluate(() => ({ tabs: [...document.querySelectorAll('.set-tabs [data-tab]')].map((x) => x.dataset.tab + (x.classList.contains('on') ? '*' : '')).join(), gem: (document.querySelector('.me-h .g') || {}).textContent || '', top: (document.querySelector('#mh-top') || {}).textContent || '', lv: (document.querySelector('.mh-lvl') || {}).textContent || '',
    party: document.querySelectorAll('.mh-party .mh-pc').length, plock: document.querySelectorAll('.mh-party .mh-pc.lock').length, bar: (document.querySelector('#mh-bar') || {}).textContent || '', lad: [...document.querySelectorAll('.lad .lad-c')].map((x) => x.dataset.fx + ':' + x.className.replace(/fxpick lad-c /, '')).join(' '), v: (document.querySelector('#lad-v') || {}).textContent || '', sheet: !!document.querySelector('#mh-sheet'), sw: document.documentElement.scrollWidth, iw: innerWidth }));
  await S.evaluate(() => { localStorage.removeItem('citadel-settab'); DS.Camp.settings({}); }); await S.waitForTimeout(1500);
  let u = await ui();
  check(u.tabs === 'enh*,gem,ttl', `탭 = 강화(처음) · 스킬 · 기록 (${u.tabs})`);
  check(/로안/.test(u.top) && /김민준/.test(u.top) && /베기/.test(u.top) && /바꾸기/.test(u.top), `맨 위 = 출전 용사 · 이름표 · 속성 (${u.top.slice(0, 60)})`);
  check(u.party >= 20 && u.plock > 0 && /\+0/.test(u.lv) && /함께/.test(u.lv) && !u.bar, `강화 = 모든 용사 한 판 (${u.party} · 잠김 ${u.plock}) · 막대 없음`);
  check(u.sw <= u.iw + 1, '가로 넘침 없음');
  await S.screenshot({ path: `${OUT}/106-enh.png` });
  // ① 강화 고름 → 💎 화면에서만 빠짐 → 되돌리기
  const g0 = Number(u.gem.replace(/\D/g, ''));
  await S.click('#enh-go'); await S.waitForTimeout(400); u = await ui(); const g1 = Number(u.gem.replace(/\D/g, ''));
  check(/\+1/.test(u.lv) && /고름/.test(u.lv) && g1 < g0 && /강화 \+0 → \+1/.test(u.bar) && /되돌릴 수/.test(u.bar) && /못 돌려받아요/.test(u.bar), `강화 고름 · 💎 ${g0} → ${g1} · 막대 (${u.bar.slice(0, 50)})`);
  check((await srv()).enh === 0, '저장 전 = 서버 그대로');
  await S.click('#mh-undo'); await S.waitForTimeout(300); u = await ui(); check(/\+0/.test(u.lv) && !u.bar && Number(u.gem.replace(/\D/g, '')) === g0, '↺ 되돌리기 = 처음으로');
  // ② 스킬: 다음 칸 고름 · 사다리 밖으로 끼운 것 = Ⅰ
  await S.click('[data-tab="gem"]'); await S.waitForTimeout(900); u = await ui();
  check(/^cut:have on moon:next slash:shut twin:shut$/.test(u.lad), `사다리 = 가짐 · 다음 · 잠김 (${u.lad})`);
  await S.click('.lad-c[data-fx="slash"]'); await S.waitForTimeout(300); u = await ui(); check(/필살기 가능/.test(u.v), `잠긴 Ⅲ 누름 = 판정 한 줄만 (${u.v})`);
  await S.click('.lad-c[data-fx="moon"]'); await S.waitForTimeout(400); u = await ui(); check(/moon:pend/.test(u.lad) && /slash:next/.test(u.lad) && /스킬 1칸/.test(u.bar), `Ⅱ 고름 → Ⅲ 가 다음 (${u.lad})`);
  await S.screenshot({ path: `${OUT}/106-skill.png` });
  // ③ 강화도 하나 더 고르고 💾 저장 = 한 번에
  await S.click('[data-tab="enh"]'); await S.waitForTimeout(400); await S.click('#enh-go'); await S.waitForTimeout(300);
  await S.click('#set-ok'); await S.waitForTimeout(1500); let s1 = await srv();
  check(s1.enh === 1 && s1.buy.includes('fx_moon') && s1.v.includes('buy_fx_moon:96') && s1.total <= 300 - 20 - 10 + 5, `💾 저장 = 강화 +1 · 달빛 베기 · v96 · 💎 ${s1.total}`);
  check(!(await S.evaluate(() => !!document.querySelector('.set-box'))), '저장하면 창 닫힘');
  // ④ 용사 고르기 창: 잠긴 💎 용사 사기 고름 · 가진 용사로 출전
  await S.evaluate(() => DS.Camp.settings({})); await S.waitForTimeout(1300);
  await S.click('#mh-top'); await S.waitForTimeout(600); u = await ui(); check(u.sheet, '맨 위 누름 = 용사 고르기 창');
  await S.click('.mh-hc[data-hp="12"]'); await S.waitForTimeout(500);
  const det = await S.evaluate(() => ({ t: (document.querySelector('.mh-det') || {}).textContent || '', b: [...document.querySelectorAll('.mh-hs-b .btn')].map((x) => x.textContent).join('|') }));
  check(/→/.test(det.t) && /사기/.test(det.b), `잠긴 용사 = 상세 · 4칸 줄 · 「사기」 (${det.b})`);
  await S.screenshot({ path: `${OUT}/106-sheet.png` });
  await S.click('#hs-buy'); await S.waitForTimeout(300);
  await S.click('.mh-hc[data-hp="2"]'); await S.waitForTimeout(400); await S.click('#hs-set'); await S.waitForTimeout(500); u = await ui();
  check(!u.sheet && /리아넬/.test(u.top) && /고름/.test(u.top) && /용사 사기/.test(u.bar) && /출전 용사/.test(u.bar), `출전 = 리아넬 고름 · 막대에 사기 · 출전 (${u.bar.slice(0, 60)})`);
  await S.click('[data-tab="gem"]'); await S.waitForTimeout(800); u = await ui(); check(/^wblade/.test(u.lad), `스킬 = 리아넬 바람 사다리 (${u.lad.slice(0, 20)})`);
  // ⑤ 저장 안 하고 닫기 = 한 번 물음 → 버리기
  await S.evaluate(() => document.querySelector('#set-x').click()); await S.waitForTimeout(400);
  check(await S.evaluate(() => /저장 안 한 것/.test((document.querySelector('.mh-ask') || {}).textContent || '')), '닫기 = 「저장 안 한 것이 있어요」');
  await S.click('#ask-drop'); await S.waitForTimeout(500); s1 = await srv();
  check(!s1.buy.includes('hero_12') && s1.hero === 0, `버리기 = 서버 그대로 (용사 ${s1.hero})`);
  // ⑥ 다시: 사기 + 출전 저장
  await S.evaluate(() => DS.Camp.settings({})); await S.waitForTimeout(1300); await S.click('#mh-top'); await S.waitForTimeout(500);
  await S.click('.mh-hc[data-hp="12"]'); await S.waitForTimeout(300); await S.click('#hs-buy'); await S.waitForTimeout(300); await S.click('#hs-set'); await S.waitForTimeout(400);
  await S.click('#set-ok'); await S.waitForTimeout(1500); s1 = await srv();
  check(s1.buy.includes('hero_12') && s1.v.includes('buy_hero_12:96') && s1.hero === 12 && s1.fx === 'flame', `사기 + 출전 저장 = 12 · 기본 불꽃 (${s1.hero} · ${s1.fx})`);
  console.log(`e2e106: 확인 ${ok} · 실패 ${fail}`, errs.length ? `errors: ${errs.join(' | ')}` : 'errors: none');
  await b.close(); process.exit(fail || errs.length ? 1 : 0);
})();