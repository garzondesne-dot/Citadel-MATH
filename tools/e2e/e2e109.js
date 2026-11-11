// 🎓 #82 ② 7차시(6차시 이어서 · 문제 4부터) 반 전체 리허설 (2026-11-11): 교사 폰 + 종합실(1600 → 1280 → 1024) + 진짜 학생 2명(360 좁은 폰 · 기록 없는 새 학생) + 가상 학생 13명
//   단계마다: 오류 0 · 학생 폰 가로 넘침 없음 · 종합실 체력 머릿수 15 — node tools/e2e/e2e109.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  await ctx.addInitScript(() => { window.DS_FUN = { pick: 3000, show: 1500 }; });
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); console.log((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/favicon|404|Failed to load resource/.test(m.text())) errs.push(t + ' c: ' + m.text()); }); p.on('dialog', (d) => d.accept()); return p; };
  const shut = (p) => p.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, #th-bat, .th-bat, .nt-pop').forEach((e) => e.remove())).catch(() => {});
  const T = await mk('T');
  await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n15 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  const stu = async (t, n) => { const S = await mk(t); await S.setViewportSize({ width: 360, height: 740 }); await S.goto(U + '&role=student'); await S.waitForTimeout(1500);
    if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
    await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', String(n)); await S.waitForTimeout(300);
    await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200); await S.click('#s-go'); await S.waitForTimeout(1500); return S; };
  const S1 = await stu('S1', 1), S2 = await stu('S15', 15);
  const code = await T.evaluate(async () => { const L = DS.Lessons.get('set-06'), pt = L.parts[0], k = L.steps.findIndex((s) => s.id === pt.from); await DS.Teacher.create('set-06', '1-3', { resume: k }); return DS.Teacher.code(); });
  const key = (await T.textContent('#t-key')).trim(); ok(/^\d{6}$/.test(code), `7차시 방 만듦 (${code})`);
  const H = await mk('H'); await H.setViewportSize({ width: 1600, height: 900 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  for (const S of [S1, S2]) { await S.bringToFront(); await shut(S); await S.click('#camp-gate'); await S.waitForTimeout(2500); }
  await T.evaluate((c) => DS.Bots.start(c, 13, { speed: 6, acc: { item: 0.75, boss: 0.8 } }), code); await T.waitForTimeout(4000);
  const room = () => T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R); return { id: st && st.id, kind: st && st.kind, players: Object.values(R.players || {}).filter((p) => !p.teacher).length, active: Object.keys(R.active || {}).length }; }, code);
  const go = () => T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.go(c, R, DS.Lessons.get(R.meta.lesson), 1); }, code);
  // 진짜 학생: 문제 = 모두 맞힘 · 소레이드 = 단계 하나씩 맞힘 · 형성평가 = 맞힘
  const ans = (S) => S.evaluate(async () => { const code = JSON.parse(localStorage.getItem('citadel-student')).code;
    const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const L = DS.Lessons.get(R.meta.lesson), st = DS.Raid.stepOf(L, R), me = DS.Net.uid();
    if (!st) return 'none';
    if (st.kind === 'boss') { for (let i = 0; i < L.boss.items; i++) await DS.Net.set(`rooms/${code}/bossTry/${me}/${i}/0`, DS.Net.pack(DS.Bots.given(L.boss.sets[1][i], true))); return 'boss'; }
    if (st.kind !== 'monster') return st.kind;
    if (DS.Raid.isChain(L, R, st.id)) { let rec = DS.Raid.record(L, R, st.id, me); let R2 = R; for (let g = 0; g < 8 && !rec.done; g++) { const q = rec.items[rec.stage], v = DS.Bots.given(q, true); rec = await DS.Act.chainSubmit(code, (await DS.Net.get(`rooms/${code}`)), st.id, rec.stage, 0, q.type === 'number' ? Number(Array.isArray(v) ? v[0] : v) : v); } return st.id + ' chain ' + rec.done; }
    const its = DS.Raid.itemsFor(L, R, st.id, me, 0); await DS.Net.set(`rooms/${code}/subs/${st.id}/${me}/0`, DS.Net.pack(its.map((q) => DS.Bots.given(q, true)))); return st.id; });
  const wide = (S) => S.evaluate(() => { const w = document.documentElement.clientWidth; const over = [...document.querySelectorAll('.screen.active *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > w + 2 && getComputedStyle(e).position !== 'fixed'; }).slice(0, 3).map((e) => (e.id || e.className || e.tagName).toString().slice(0, 30)); return { sw: document.documentElement.scrollWidth, w, over }; });
  const seen = []; let r0 = await room(); ok(r0.players === 15, `입장 15명 (${r0.players})`); await go(); await T.waitForTimeout(2500); r0 = await room(); ok(r0.active === 15, `수업 시작 = 15명 함께 (${r0.active}) · 첫 단계 ${r0.id}`);
  for (let k = 0; k < 20; k++) {
    const r = await room(); seen.push(r.id); if (!r.id) break;
    await T.waitForTimeout(r.kind === 'monster' || r.kind === 'boss' ? 9000 : 1500);
    if (r.kind === 'monster' || r.kind === 'boss') {
      const a1 = await ans(S1); await S1.waitForTimeout(2500); await shut(S1);
      await S1.screenshot({ path: `${OUT}/109-${r.id}-s360.png` });
      const wd = await wide(S1); ok(wd.sw <= wd.w + 1, `${r.id} 학생 360 가로 넘침 없음 (${wd.sw}/${wd.w} ${wd.over.join(',')}) · 답 ${a1}`);
      await H.screenshot({ path: `${OUT}/109-${r.id}-hall.png` });
      if (r.id === 'u5') { await H.setViewportSize({ width: 1280, height: 720 }); await H.waitForTimeout(1500); await H.screenshot({ path: `${OUT}/109-hall-1280.png` }); await H.setViewportSize({ width: 1024, height: 600 }); await H.waitForTimeout(1500); await H.screenshot({ path: `${OUT}/109-hall-1024.png` });
        const hw = await H.evaluate(() => ({ sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, w: innerWidth, h: innerHeight })); ok(hw.sw <= hw.w + 1, `종합실 1024 가로 넘침 없음 (${JSON.stringify(hw)})`); await H.setViewportSize({ width: 1600, height: 900 }); }
      if (r.id === 'u4') { await S2.bringToFront(); await S2.waitForTimeout(800); await shut(S2); await S2.screenshot({ path: `${OUT}/109-u4-s15-noans.png` }); ok(await S2.evaluate(() => document.querySelector('.screen.active').id) === 'screen-student', '안 낸 학생도 전투 화면'); }
      else await ans(S2);
      await T.screenshot({ path: `${OUT}/109-${r.id}-teacher.png` }); if (r.id === 'boss') ok(!(await T.$('.t-old')), '리모컨에 「옛 판」 없음 (가상 학생도 새 판)');
    }
    if (r.kind === 'boss') { await T.waitForTimeout(15000); break; }
    await shut(T); await go(); await T.waitForTimeout(1500);
  }
  ok(seen.filter((x, i) => x && x !== seen[i - 1]).length >= 5, `단계 (${seen.filter((x, i) => x !== seen[i - 1]).join(',')})`);
  await H.screenshot({ path: `${OUT}/109-end-hall.png` });
  await T.evaluate(() => DS.Bots.stop());
  console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs.slice(0, 10) : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
