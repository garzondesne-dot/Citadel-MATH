// ⏰ #68 A 보스 문 닫기 장면 (2026-11-11): 마감 → 종합실 · 리모컨 · 학생 폰에 장면 · 15초 묻기 → [+5분 연장] = 선생님이 문을 밀어 엶 · 마감 +5분
//   → 다음 마감(연장 이미 씀) = 묻지 않고 닫힘 장면 3.5초 → 수업 끝 · 따로: 15초 안 누름 → 끝
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e103.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = []; let ok = 0, fail = 0;
  const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연\n3 박지호'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  const S1 = await mk('S1'); await S1.goto(U + '&role=student'); await S1.waitForTimeout(1500);
  if (await S1.isVisible('#splash')) { await S1.click('#splash'); await S1.waitForTimeout(500); }
  await S1.selectOption('#s-cls', '1-3'); await S1.waitForTimeout(200); await S1.selectOption('#s-num', '1'); await S1.waitForTimeout(300);
  await S1.click('#s-new'); await S1.fill('#s-p1', '1234'); await S1.fill('#s-p2', '1234'); await S1.click('#s-make'); await S1.waitForTimeout(1200);
  await S1.click('#s-go'); await S1.waitForTimeout(2000);
  await T.selectOption('#lesson', 'set-09'); await T.selectOption('#t-cls', '1-3'); await T.click('#t-new'); await T.waitForTimeout(2500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  await S1.bringToFront(); await S1.click('#camp-gate'); await S1.waitForTimeout(3500);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  await T.evaluate(async () => { await DS.Net.update(`rooms/${DS.Teacher.code()}/state`, { solve: 0 }); });
  for (let k = 0; k < 4; k++) { await go(); await T.waitForTimeout(700); }
  const st = () => T.evaluate(async () => (await DS.Net.get(`rooms/${DS.Teacher.code()}/state`)) || {});
  const setDl = (ms) => T.evaluate(async (ms) => { const c = DS.Teacher.code(); const s = (await DS.Net.get(`rooms/${c}/state`)) || {}; await DS.Net.update(`rooms/${c}/state`, { deadline: DS.Net.now() + ms - (Number(s.extend) || 0) * 60e3 }); }, ms);
  // ① 마감 → 묻기
  await setDl(1500); await T.waitForTimeout(3500);
  const s1 = await st(); check(s1.door && s1.door.ask === true && !s1.closed, `마감 → door ask (${JSON.stringify(s1.door)})`);
  check(await H.$eval('#door-ov', (e) => e.className).then((c) => /hall ask/.test(c)).catch(() => false), '종합실 장면 (ask)');
  check(/던전 문을 닫으려 한다/.test(await H.$eval('#door-ov', (e) => e.textContent).catch(() => '')), '종합실 문구');
  check(await T.$('#door-ov.teacher.ask [data-door-ext]') != null, '리모컨 [+5분 연장] 단추');
  check(/선생님을 기다리는 중/.test(await S1.$eval('#door-ov', (e) => e.textContent).catch(() => '')), '학생 위쪽 띠');
  check(await S1.$eval('#door-ov', (e) => getComputedStyle(e).pointerEvents).catch(() => '') === 'none', '학생 띠 = 누름 통과 (풀기 계속)');
  await Promise.all([H.screenshot({ path: `${OUT}/d-hall-ask.png` }), T.screenshot({ path: `${OUT}/d-remote-ask.png` }), S1.screenshot({ path: `${OUT}/d-phone-ask.png` })]);
  // ② 연장 → 선생님이 문을 밂
  await T.bringToFront(); await T.click('#door-ov [data-door-ext]'); await T.waitForTimeout(1500);
  const s2 = await st(); check(Number(s2.extend) === 5 && s2.doorExt && !s2.closed, `+5분 연장 (${s2.extend})`);
  check(await H.$eval('#door-ov', (e) => /ext/.test(e.className) && /\+5분/.test(e.textContent)).catch(() => false), '종합실 「⏳ +5분!」 · 선생님 모습');
  check(/5분을 벌었다/.test(await S1.$eval('#door-ov', (e) => e.textContent).catch(() => '')), '학생 「🧙 선생님이 5분을 벌었다!」');
  await H.bringToFront(); await H.waitForTimeout(300); await H.screenshot({ path: `${OUT}/d-hall-ext.png` });
  await S1.waitForTimeout(6500); check(!(await S1.$('#door-ov')), '6초 뒤 띠 사라짐 · 남은 시간 이어짐');
  // ③ 연장 뒤 마감 = 묻지 않고 닫힘
  await setDl(1200); await T.waitForTimeout(2600);
  const s3 = await st(); check(s3.door && s3.door.ask === false, `연장 뒤 마감 = 묻지 않음 (${JSON.stringify(s3.door)})`);
  check(!(await T.$('#door-ov [data-door-ext]')), '리모컨 단추 없음');
  await H.screenshot({ path: `${OUT}/d-hall-shut.png` });
  await T.waitForTimeout(5000);
  check((await st()).closed === true, '3.5초 뒤 수업 끝');
  console.log(`e2e103: 확인 ${ok} · 실패 ${fail}`, 'errors:', errs.length ? errs : 'none');
  await b.close(); if (fail || errs.length) process.exit(1);
})();
