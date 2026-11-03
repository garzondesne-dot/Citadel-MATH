// 🧙 교사 메뉴 정리 · 교사 캠프 ⚙ 설정 (2026-11-04 · v0.9.6.32): 메뉴 = 수업 준비 옆 🧪 테스트 · 학생 관리(명단 · 대시보드) · 선생님 모습 칸 없음
//   교사 캠프 ⚙ 설정 = 용사 18 · 이펙트 · 호칭 모두 열림 → 저장하면 수업 방 선생님 용사 · 이펙트 · 캠프 용사 · 이름표 바뀜 — node tools/e2e/e2e42.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [];
  const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push(e.message)); T.on('dialog', (d) => d.accept());
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  const menu = await T.evaluate(() => ({ secs: [...document.querySelectorAll('#f-teacher .t-sec b')].map((e) => e.textContent.trim()), test: !!document.querySelector('.t-prep-row #x-go'), stu: [...document.querySelectorAll('.t-stu-row .btn')].map((e) => e.textContent.trim()), skin: !!document.getElementById('t-skin'), xl: !!document.getElementById('x-lesson') }));
  log.push(`메뉴 칸: ${menu.secs.join(' | ')}`); log.push(`🧪 테스트 = 수업 준비 줄: ${menu.test} · 학생 관리 버튼: ${menu.stu.join(' / ')} · 선생님 모습 칸 남음: ${menu.skin} · 따로 차시 칸: ${menu.xl}`);
  await T.locator('#f-teacher .t-prep-row').scrollIntoViewIfNeeded(); await T.screenshot({ path: `${OUT}/1-menu.png` });
  const { code, hallKey } = await T.evaluate(() => DS.Act.createRoom('set-05', '1-1'));
  await T.evaluate(([c, k]) => DS.TCamp.enter({ code: c, hallKey: k }), [code, hallKey]); await T.waitForTimeout(1200);
  await T.click('#tc-set'); await T.waitForTimeout(900);
  const st = await T.evaluate(() => ({ h: document.querySelectorAll('.set-grid .hpick').length, hl: document.querySelectorAll('.set-grid .hpick.lock').length, fx: document.querySelectorAll('.fxpick').length, fl: document.querySelectorAll('.fxpick.lock').length, tl: document.querySelectorAll('.ttl-pick.lock').length }));
  log.push(`설정 창: 용사 ${st.h}(잠김 ${st.hl}) · 이펙트 ${st.fx}(잠김 ${st.fl}) · 호칭 잠김 ${st.tl}`);
  await T.screenshot({ path: `${OUT}/2-settings.png` });
  await T.click('.set-grid .hpick[data-h="3"]'); await T.click('.fxpick >> nth=-1'); await T.click('.ttl-pick:not([data-ttl=none]) >> nth=0'); await T.waitForTimeout(300);
  await T.click('.modal .ui-foot #set-ok, .modal #set-ok'); await T.waitForTimeout(1200);
  const after = await T.evaluate(async (c) => ({ room: await DS.Net.get(`rooms/${c}/players/${DS.Net.uid()}`), look: DS.Art.teacherLook(), hero: document.querySelector('.tc-hero .art') && document.querySelector('.tc-hero .art').outerHTML.slice(0, 120), plate: (document.querySelector('.tc-hero .camp-plate') || {}).textContent }), code);
  log.push(`저장 뒤: 방 선생님 용사 ${after.room.hero} · 이펙트 ${after.room.fx} · 이 기기 ${JSON.stringify(after.look)} · 이름표 「${(after.plate || '').trim()}」`);
  await T.screenshot({ path: `${OUT}/3-tcamp.png` });
  const ok = !menu.skin && !menu.xl && menu.test && menu.stu.length === 3 /* 0.9.7.0: 명단 · 출석부 · 대시보드 */ && st.h === 18 && !st.hl && !st.fl && !st.tl && after.room.hero === 3 && after.look.hero === 3 && after.room.fx === after.look.fx;
  console.log(log.join('\n')); console.log(ok ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (!ok || errs.length) process.exit(1);
})();
