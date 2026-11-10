// 🧙 #73 용사 고르기 소개 카드 (2026-11-11): 칸 = 카드만 바뀜 · 단추로 정함 · 잠긴 용사 「???」 · 💎 용사 「💎 n 으로 열기」(모자람) · 도전 용사 진행 막대 · 처음 누르면 얼굴 컷인
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e105.js <출력 폴더>
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
  await S.evaluate(() => DS.Camp.settings({ tab: 'hero' })); await S.waitForTimeout(1500);
  const card = () => S.$eval('.hero-card', (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => '');
  check(/로안 · 검사/.test(await card()) && /기본기의 검/.test(await card()) && /지금 내 용사/.test(await card()), `처음 = 내 용사 카드 (${(await card()).slice(0, 60)})`);
  check(/근접/.test(await card()) && /공통\s*\S*\s*베기/.test(await card()), '꼬리표 근접 · 공통');
  const tap = (n) => S.evaluate((n) => document.querySelector(`[data-h="${n}"]`).click(), n);
  await tap(1); await S.waitForTimeout(300);
  check(!!(await S.$('.ult.peek')), '처음 누르면 얼굴 컷인');
  check(/이번엔 안 터져/.test(await S.$eval('.ult.peek .u-sub', (e) => e.textContent).catch(() => '')), '💬 #76 컷인 자막 = 한마디'); await S.waitForTimeout(1300);
  check(/누아 · 마녀/.test(await card()) && /이 용사로 정하기/.test(await card()), '가진 용사 = 「이 용사로 정하기」');
  check(/이번엔 안 터져/.test(await card()), '💬 #76 카드 한마디');
  await tap(1); await S.waitForTimeout(200); check(!(await S.$('.ult.peek')), '두 번째는 컷인 없음');
  await tap(24); await S.waitForTimeout(1200);
  check(/\?\?\? · 마검사/.test(await card()) && /열면 다음 이야기가 보여요/.test(await card()) && /60 으로 열기/.test(await card()) && /모자람/.test(await card()), `💎 용사 카드 (${(await card()).slice(0, 120)})`);
  check(!/둘 중 하나만 고르라는/.test(await card()) && !/왜 하나만 골라야 해/.test(await card()), '잠긴 용사 = 이야기 ①만 · 한마디 가림');
  await S.screenshot({ path: `${OUT}/h-gem.png` });
  await tap(33); await S.waitForTimeout(1200);
  check(/별점술사/.test(await card()) && /0 \/ 15/.test(await card()) && /로는 열 수 없어요/.test(await card()), `도전 용사 카드 (${(await card()).slice(0, 120)})`);
  await S.screenshot({ path: `${OUT}/h-chal.png` });
  await tap(1); await S.waitForTimeout(300); await S.evaluate(() => document.querySelector('[data-hset]').click()); await S.waitForTimeout(500);
  check(/지금 내 용사/.test(await card()) && /누아/.test(await card()), '정하기 → 지금 내 용사');
  console.log(`e2e105: 확인 ${ok} · 실패 ${fail}`, 'errors:', errs.length ? errs : 'none');
  await b.close(); if (fail || errs.length) process.exit(1);
})();
