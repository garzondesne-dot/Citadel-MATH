// 🔐 2026-11-14 선생님 「추천대로」: 정식 종합실 비밀번호 노출 고침 — ① TV 주소 ?key= 읽은 즉시 지움 ② 교사 폰 맨 위 키 = ●●●● · 「보기」 5초 ③ 입력 칸 type=password · 설정 칸 미리 채움 없음 ④ 방 칸 hosts = true (키 글자 없음)
//   PORT=8766 node tools/e2e/e2e158.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  ok(await T.evaluate(() => document.getElementById('t-hallpw').type === 'password' && document.getElementById('t-hallpw').value === ''), '③ 교사 설정 비밀번호 칸 = password · 미리 채움 없음');
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준'); await T.click('#r-up'); await T.waitForTimeout(800);
  await T.click('#screen-students .nav-back'); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  if (!(await T.isVisible('#lesson'))) { await T.click('.role[data-role=teacher]'); await T.waitForTimeout(600); }
  await T.selectOption('#t-cls', '1-3'); await T.waitForTimeout(300); await T.selectOption('#lesson', 'set-10'); await T.click('#t-new'); await T.waitForTimeout(2500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const head = () => T.evaluate(() => (document.querySelector('#t-head') || {}).textContent || '');
  let h = await head(); ok(!h.includes(key) && /●●●●/.test(h), `② 교사 폰 맨 위 = ●●●● (키 ${key} 안 보임)`);
  const vis = await T.isVisible('#t-head .t-keyshow'); await T.evaluate(() => document.querySelector('#t-head .t-keyshow').click()); await T.waitForTimeout(300); log.push('  (보기 단추 보임 ' + vis + ')'); h = await head(); ok(h.includes(key), '② 「보기」 = 키 보임'); await T.waitForTimeout(5600); h = await head(); ok(!h.includes(key), '② 5초 뒤 다시 가림');
  const H = await mk('H'); await H.setViewportSize({ width: 1400, height: 800 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(3500);
  ok(!H.url().includes('key='), `① TV 주소에 키 없음 (${H.url().replace(/.*\?/, '?')})`);
  ok(await H.evaluate(() => document.querySelector('#screen-hall.active, #screen-tcamp.active, .screen.active') && !/screen-auth|screen-login/.test(document.querySelector('.screen.active').id)), `① 그래도 종합실 입장 (${await H.evaluate(() => document.querySelector('.screen.active').id)})`);
  ok(await H.evaluate(() => document.getElementById('h-key').type === 'password'), '③ TV 키 칸 = password');
  const hosts = await H.evaluate(async (c) => (await DS.Net.get(`rooms/${c}/hosts`)) || {}, code);
  ok(Object.values(hosts).every((v) => v === true) && !JSON.stringify(hosts).includes(key), `④ 방 칸 hosts = true 만 (${JSON.stringify(hosts)})`);
  ok(!(await H.evaluate((k) => document.body.innerText.includes(k), key)), '화면 글자에 키 없음 (TV)');
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
