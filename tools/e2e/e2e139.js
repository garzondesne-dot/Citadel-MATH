// ✉ 2026-11-13 교사 로그인 = 아이디 칸에 이메일도 (무안행복중학교 「여기서 막혔대」): ① 콘솔에서 이메일로 만든 계정 = 이메일 그대로 로그인
//   ② 예전에 「✨ 교사 계정 만들기」에 이메일을 넣어 만든 계정(t_<@ 지운 꼴>@citadel.class) = 같은 입력으로 계속 로그인 ③ 영문 아이디 = 예전대로 — PORT=8766 node tools/e2e/e2e139.js
const { chromium } = require('playwright');
const U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    const A = DS.Account, N = DS.Net, out = {};
    const tryLogin = async (id, pw) => { try { await A.teacherLogin(id, pw); const ok = await A.isAdmin(); await N.signOut(); return ok; } catch (e) { try { await N.signOut(); } catch (e2) { /* */ } return e.message; } };
    // ② 예전 꼴: 「교사 계정 만들기」에 이메일을 넣어 만든 첫 교사
    await A.teacherCreate('Teach.One@School.kr', 'pass1234'); out.legacyEmail = N.impl && N.uid(); await N.signOut();
    out.legacy = await tryLogin('teach.one@school.kr', 'pass1234');
    // ① 콘솔에서 실제 이메일로 만든 계정 + admins 한 줄
    await N.signUp('real.teacher@school.kr', 'pass5678'); await N.set(`admins/${N.uid()}`, true); await N.signOut();
    out.raw = await tryLogin(' Real.Teacher@School.kr ', 'pass5678');
    out.wrong = await tryLogin('real.teacher@school.kr', 'nope99');
    // ③ 영문 아이디 (예전대로): 만들기는 첫 교사만 되므로 직접 예전 꼴 계정
    await N.signUp(A.teacherEmail('kimt'), 'pass9999'); await N.set(`admins/${N.uid()}`, true); await N.signOut();
    out.plain = await tryLogin('kimt', 'pass9999');
    return out;
  });
  ok(r.legacy === true, `② 예전에 「계정 만들기」에 이메일을 넣어 만든 계정 = 같은 입력으로 로그인 (${r.legacy})`);
  ok(r.raw === true, `① 콘솔 이메일 계정 = 이메일 그대로 로그인 (${r.raw})`);
  ok(typeof r.wrong === 'string' && /달라요/.test(r.wrong), `비밀번호 틀림 = 「교사 아이디나 비밀번호가 달라요」 (${r.wrong})`);
  ok(r.plain === true, `③ 영문 아이디 = 예전대로 (${r.plain})`);
  ok(/또는 이메일/.test(await p.evaluate(() => (document.querySelector('.t-id') || {}).placeholder || '')), '아이디 칸 안내 = 「영문·숫자 (또는 이메일)」');
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
