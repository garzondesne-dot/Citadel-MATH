// 🏫 2026-11-13 선생님 「시간표 숨김」(학교판): 📅 시간표 · 오늘 수업 단추 없음 · 바로 연 수업 = 보스 타임바(교시 끝) 없음 · 종합실 찾기 = 바로 연 수업만
//   · 출석부 · 수업 일지 = 시간표 없이도 바로 연 수업 기록으로 열림 · 정식(우리 학교)은 그대로 — PORT=8766 node tools/e2e/e2e141.js <출력 폴더>
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), P = require('../school/page.js');
const OUT = process.argv[2] || '.', BASE = `http://localhost:${process.env.PORT || 8765}`;
const code = 'ex7q2', sch = P.list()[code], dir = path.join(ROOT, 's', code);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'index.html'), P.build(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), code, sch));
fs.writeFileSync(path.join(dir, 'manifest.webmanifest'), P.manifest(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'), code, sch));
const cleanup = () => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* 무시 */ } };
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const U = `${BASE}/s/${code}/index.html?local`;
  try {
    const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push('T: ' + e.message)); T.on('dialog', (d) => d.accept());
    await T.goto(U + '&role=teacher'); await T.waitForTimeout(1500);
    await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1200);
    await T.evaluate(async () => { const buf = await (await fetch('assets/templates/question-bank-school-v1.xlsx')).arrayBuffer(); const r = DS.SheetLesson.build(await DS.Xlsx.read(buf)); await DS.Net.set(`sheets/${r.pack.id}`, r.pack); await DS.Account.uploadRoster([{ c: '1-1', n: 1, name: '가' }, { c: '1-1', n: 2, name: '나' }]); });
    await T.reload(); await T.waitForTimeout(2000); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
    const vis = await T.evaluate(() => ['#t-sched', '#t-today'].map((q) => { const e = document.querySelector(q); return !!(e && e.offsetParent); }));
    ok(!vis[0] && !vis[1], `교사 메뉴: 📅 시간표 · 오늘 수업(예약) 숨김 (${vis})`);
    ok(await T.evaluate(async () => (await DS.Sched.periodEnd(Date.now())) === null && DS.Sched.active({ x: { from: 0, to: 9e15 } }, Date.now()) === null), '시간표 길 끔 (교시 끝 · 예약 수업 = 없음)');
    await T.selectOption('#t-cls', '1-1'); await T.waitForTimeout(300); await T.selectOption('#lesson', 'xl-ex-1'); await T.click('#t-new'); await T.waitForTimeout(2500);
    const rc = await T.evaluate(() => DS.Teacher.code());
    await T.evaluate(async (c) => { for (let n = 1; n <= 2; n++) { await DS.Net.set(`rooms/${c}/players/s${n}`, { num: n, nick: n === 1 ? '가' : '나', hero: n, fx: 'flame', cls: '1-1', at: Date.now() }); await DS.Net.set(`rooms/${c}/online/s${n}`, true); } }, rc);
    await T.evaluate(() => document.querySelector('#t-fwd').click()); await T.waitForTimeout(2000);
    const R = await T.evaluate(async (c) => DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), rc);
    ok(!R.state.deadline && !(R.meta || {}).deadline, `바로 연 수업 시작 = 보스 타임바(교시 끝) 없음 (deadline ${R.state.deadline})`);
    const rooms = await T.evaluate(() => DS.Act.openRooms());
    ok(rooms.length === 1 && rooms[0].code === rc && !rooms[0].sched, `종합실 「지금 열린 수업」 = 바로 연 수업만 (${rooms.map((x) => x.code)})`);
    // 수업 끝 → 출석부 · 수업 일지
    await T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.endClass(c, R).catch(() => {}); }, rc); await T.waitForTimeout(1500);
    await T.evaluate(() => DS.Control.run(() => DS.Att.enter())); await T.waitForTimeout(2500);
    const at = await T.evaluate(() => (document.querySelector('#att-body') || {}).innerText || '');
    ok(/출석부/.test(at) && !/Cannot read|undefined/.test(at), `🗓 출석부 = 시간표 없이 깨지지 않고 열림 (수업 일지 기록은 11/05 결정으로 정식도 안 쌓음) (${at.replace(/\s+/g, ' ').slice(0, 120)})`);
    await T.evaluate(() => { const t = document.querySelector('[data-t="log"]'); if (t) t.click(); }); await T.waitForTimeout(1200);
    const lg = await T.evaluate(() => (document.querySelector('#att-body') || {}).innerText || '');
    ok(/수업 일지/.test(lg) && !/Cannot read|undefined/.test(lg), '📖 수업 일지 = 열림');
    await T.screenshot({ path: `${OUT}/141-att.png` });
    // 정식 = 그대로
    const M = await ctx.newPage(); M.on('pageerror', (e) => errs.push('M: ' + e.message)); await M.goto(`${BASE}/index.html?local`); await M.waitForTimeout(1500);
    ok(await M.evaluate(() => !DS.OFF('sched') && DS.Sched.periodEnd(new Date('2026-11-16T01:30:00Z').getTime()) !== null), '정식(우리 학교) = 시간표 그대로 (월요일 교시 끝 있음)');
  } catch (e) { log.push('✘ 오류 ' + String(e.message).split('\n')[0]); bad++; } finally { cleanup(); }
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
