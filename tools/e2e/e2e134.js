// 🏫 학교판 (2026-11-13 · 선생님 「최대한 기본 기능 위주로 · 버그 없게」): 예시 학교 페이지를 잠깐 만들어(시험 뒤 지움) local 모드로 한 바퀴
//   ① 과목 중립 엑셀 양식이 게임 읽기로 그대로 읽힘(오류 0) ② 차시 = 엑셀 차시만 ③ 숨긴 기능(⚒ 모루 · 🏰 성채 · ⛺ 출제 · 📝 설문 · ⭕ OX) 단추 0 · 열어도 안 열림
//   ④ 학생 캠프 · 허수아비 · 교사 메뉴 · 수업 열기 · 학생 입장 · 쉼터 놀이 목록 · 콘솔 오류 0 ⑤ 정식(index.html)은 그대로 — PORT=8766 node tools/e2e/e2e134.js <출력 폴더>
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
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const U = `${BASE}/s/${code}/index.html?local`;
  try {
    // ① 양식 읽기 (학교 양식 · 정식 양식 둘 다) → 학교 페이지에 차시 등록
    const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1500);
    const sheet = await T.evaluate(async () => { const out = {}; for (const f of ['question-bank-school-v1', 'question-bank-v1']) { const buf = await (await fetch(`assets/templates/${f}.xlsx`)).arrayBuffer(); const tabs = await DS.Xlsx.read(buf); const r = DS.SheetLesson.build(tabs); out[f] = { err: (r.errors || []).length, steps: r.pack ? r.pack.steps.length : 0, id: r.pack && r.pack.id, firstErr: (r.errors || [])[0] || '' }; } return out; });
    ok(sheet['question-bank-school-v1'].err === 0 && sheet['question-bank-school-v1'].steps >= 4, `과목 중립 양식 = 오류 0 · 단계 ${sheet['question-bank-school-v1'].steps} (${sheet['question-bank-school-v1'].firstErr})`);
    const st0 = await T.evaluate(() => ({ school: DS.SCHOOL, subject: DS.SUBJECT, lessons: DS.Lessons.list.map((l) => l.id), title: document.title }));
    ok(st0.school && st0.school.code === 'ex7q2' && st0.subject === '예시과목' && /예시과목/.test(st0.title), `학교판 · 과목 글자 「${st0.subject}」 · 제목 「${st0.title}」`);
    ok(st0.lessons.length === 0, `우리 차시(2~10 · 성채 평가) 안 보임 (등록 ${st0.lessons.length}개)`);
    // 교사 로그인 → 엑셀 차시 하나 저장(이 기기 저장소) → 다시 열기
    await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
    await T.evaluate(async () => { const buf = await (await fetch('assets/templates/question-bank-school-v1.xlsx')).arrayBuffer(); const r = DS.SheetLesson.build(await DS.Xlsx.read(buf)); await DS.Net.set(`sheets/${r.pack.id}`, r.pack); await DS.Account.uploadRoster([{ c: '1-1', n: 1, name: '가' }, { c: '1-1', n: 2, name: '나' }, { c: '1-1', n: 3, name: '다' }]); });
    await T.reload(); await T.waitForTimeout(2000); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
    const menu = await T.evaluate(() => ({ lessons: DS.Lessons.list.map((l) => l.id), opts: [...document.querySelectorAll('#lesson option')].map((o) => o.value), vis: ['#sv-go', '#t-quest', '#t-camp', '#x-go', '#p-go'].map((q) => { const e = document.querySelector(q); return q + ':' + !!(e && e.offsetParent); }) }));
    ok(menu.lessons.join() === 'xl-ex-1' && menu.opts.filter(Boolean).every((v) => v === 'xl-ex-1'), `차시 = 엑셀 차시만 (${menu.lessons} · 수업 열기 ${menu.opts})`);
    ok(menu.vis.includes('#sv-go:false') && menu.vis.includes('#t-quest:false') && menu.vis.includes('#p-go:true'), `교사 메뉴: 📝 설문 · ✏ 출제 확인 숨김 · 📋 수업 준비 있음 (${menu.vis.join(' ')})`);
    await T.screenshot({ path: `${OUT}/134-teacher.png` });
    // 수업 열기 → 학생 셋 입장 → 쉼터 놀이 목록
    await T.selectOption('#t-cls', '1-1'); await T.waitForTimeout(300); await T.selectOption('#lesson', 'xl-ex-1'); await T.click('#t-new'); await T.waitForTimeout(2500);
    const rcode = await T.evaluate(() => DS.Teacher.code());
    ok(!!rcode, `수업 열림 (코드 ${rcode})`);
    const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
    await S.selectOption('#s-cls', '1-1'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
    await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
    await S.evaluate(() => { localStorage.setItem('citadel-tut-1-1-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2500);
    const camp = await S.evaluate(() => ({ cs: !!document.querySelector('#screen-camp.active'), vis: ['#camp-anvil', '#camp-castle', '#camp-tent', '#camp-dummy', '#camp-mail', '#camp-gate'].map((q) => { const e = document.querySelector(q); return q + ':' + !!(e && e.offsetParent); }) }));
    ok(camp.cs && camp.vis.includes('#camp-anvil:false') && camp.vis.includes('#camp-castle:false') && camp.vis.includes('#camp-tent:false') && camp.vis.includes('#camp-dummy:true') && camp.vis.includes('#camp-gate:true'), `학생 캠프: ⚒ 🏰 ⛺ 숨김 · 🎯 허수아비 · 🌀 차시 던전 있음 (${camp.vis.join(' ')})`);
    await S.screenshot({ path: `${OUT}/134-camp.png` });
    // 열어 보려 해도 안 열림 (모루 · 성채 · 출제 · 설문)
    await S.evaluate(async () => { const me = await DS.Account.me(); await DS.Forge.open(me); await DS.Quest.open(me); DS.Survey.open(me, () => {}); });
    await S.waitForTimeout(800);
    const opened = await S.evaluate(() => ({ forge: !!document.querySelector('#screen-forge.active, .fg-tabs'), quest: !!document.querySelector('#screen-quest.active, .qs-wrap'), sv: !!document.querySelector('.sv-box, #survey.active') }));
    ok(!opened.forge && !opened.quest && !opened.sv, `모루 · 출제 · 설문 = 불러도 안 열림 ${JSON.stringify(opened)}`);
    // 허수아비 (성채로 들어가려 해도 허수아비)
    await S.evaluate(() => DS.Camp.back()); await S.waitForTimeout(1200);
    await S.evaluate(() => DS.Control.run(async () => DS.Bonus.enter(await DS.Account.me(), {}))); await S.waitForTimeout(1800);
    const bn = await S.evaluate(() => (document.querySelector('#bonus') || {}).innerText || '');
    ok(/복습 허수아비/.test(bn) && !/성채/.test(bn), '성채 대신 🎯 허수아비 · 성채 글자 없음');
    await S.screenshot({ path: `${OUT}/134-dummy.png` });
    // 쉼터 놀이 목록 = ⭕ OX 없음
    const kinds = await S.evaluate(() => Object.keys(DS.Fun.KIND));
    ok(!kinds.includes('ox') && !kinds.includes('quiz'), `쉼터 놀이 = ⭕ OX 없음 (${kinds})`);
    // 칭호 목록 = 성채 · OX · 출제 칭호 없음 · 기호 톡 꺼짐
    const t = await S.evaluate(() => ({ ids: DS.Titles.BASE.map((x) => x.id), sym: (() => { const d = document.createElement('div'); d.className = 'paper'; d.textContent = 'A ∩ B = ∅'; document.body.appendChild(d); DS.SymTalk.scan(); const hit = !!d.querySelector('[data-sym], .sym-hl, mark'); d.parentNode.removeChild(d); return hit; })() }));
    ok(!t.ids.includes('king') && !t.ids.includes('oxsurv') && !t.ids.includes('quester'), '칭호 목록 = 성채 · OX · 출제 칭호 없음');
    ok(!t.sym, '📖 기호 톡 = 표시 안 함');
    // ⑤ 정식(index.html) = 그대로
    const M = await mk('M'); await M.goto(`${BASE}/index.html?local`); await M.waitForTimeout(1500);
    const main = await M.evaluate(() => ({ school: !!DS.SCHOOL, subject: DS.SUBJECT, n: DS.Lessons.list.filter((l) => /^set-/.test(l.id)).length, ox: Object.keys(DS.Fun.KIND).includes('ox'), off: DS.OFF('forge') }));
    ok(!main.school && main.subject === '공통수학2' && main.n >= 8 && main.ox && !main.off, `정식 = 그대로 (차시 ${main.n}개 · OX 있음 · 모루 켜짐)`);
  } catch (e) { log.push('✘ 오류 ' + String(e.message).split('\n')[0]); bad++; } finally { cleanup(); }
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
