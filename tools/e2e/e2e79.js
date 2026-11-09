// 🧙 #32 선생님 모습 · 소리 · 쉼터 분 = 서버 gcfg/teacher (2026-11-09) — node tools/e2e/e2e79.js <출력 폴더>
//   교사 폰에서 바꾼 모습 → 다른 기기(종합실 · 이 기기 localStorage 지움)의 교사 캠프 · 새 수업 방에 그대로 · 소리 → 다음 수업 방 state.sound
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push('T: ' + e.message)); T.on('dialog', (d) => d.accept());
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(() => DS.Art.setTeacherLook({ hero: 3, fx: 'fire', title: 'none', socket: { 3: 'fire' } }));
  await T.evaluate(() => DS.Art.saveTeacherCfg('restMin', 9));
  const { code } = await T.evaluate(() => DS.Act.createRoom('set-05', '1-3'));
  await T.evaluate((c) => DS.Act.setSound(c, { sfx: true, bgm: false, vol: 'low' }), code);
  const srv = await T.evaluate(() => DS.Net.get('gcfg/teacher'));
  ok(srv && srv.look && srv.look.hero === 3 && srv.look.fx === 'fire', `서버 look = ${JSON.stringify(srv && srv.look)}`);
  ok(srv && srv.sound && srv.sound.vol === 'low' && srv.sound.bgm === false, `서버 sound = ${JSON.stringify(srv && srv.sound)}`);
  ok(srv && srv.restMin === 9, `서버 restMin = ${srv && srv.restMin}`);
  // 다른 기기처럼: 이 기기 선생님 모습 기록 지움 → 서버에서 다시 읽음
  await T.evaluate(() => { localStorage.removeItem('citadel-tlook'); localStorage.removeItem('citadel-thero'); });
  await T.reload(); await T.waitForTimeout(1500);
  const before = await T.evaluate(() => DS.Art.teacherHero());
  await T.evaluate(() => DS.Art.loadTeacherCfg());
  const after = await T.evaluate(() => ({ hero: DS.Art.teacherHero(), look: DS.Art.teacherLook(), rest: DS.Act.restMinDef() }));
  ok(after.hero === 3 && after.look.fx === 'fire', `기록 지운 뒤 서버에서: 용사 ${before} → ${after.hero} · 이펙트 ${after.look.fx}`);
  ok(after.rest === 9, `쉼터 기본 분 = ${after.rest}`);
  const R2 = await T.evaluate(async () => { const r = await DS.Act.createRoom('set-05', '1-3'); return DS.Net.get(`rooms/${r.code}`); });
  ok(R2 && R2.state && R2.state.sound && R2.state.sound.vol === 'low', `새 수업 방 소리 = ${JSON.stringify(R2 && R2.state && R2.state.sound)}`);
  ok(R2 && R2.players && Object.values(R2.players).some((p) => Number(p.hero) === 3 && p.fx === 'fire'), '새 수업 방 선생님 용사 = 3 · fire');
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
