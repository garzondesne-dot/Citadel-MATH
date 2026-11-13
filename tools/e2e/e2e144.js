// 🏫 2026-11-13 학교판 대시보드 (선생님 「학교랑 학년 바뀌어도 오개념이랑 성취기준 개념별 약점 작동해?」): 학교판 = ⑤ 성취기준 · ⑥ 오개념 · 📝 설문 · 📖 기호 톡 탭 없음
//   · 오개념 기록 안 함 · ④ 개념별 약점 = 엑셀 차시 단계 제목으로 · 세특 메모에 성취기준 · 오개념 문장 없음 · 정식 그대로 — PORT=8766 node tools/e2e/e2e144.js <출력 폴더>
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
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  try {
    const T = await ctx.newPage(); T.on('pageerror', (e) => errs.push('T: ' + e.message)); T.on('dialog', (d) => d.accept());
    await T.goto(`${BASE}/s/${code}/index.html?local&role=teacher`); await T.waitForTimeout(1500);
    await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1200);
    await T.evaluate(async () => {
      const buf = await (await fetch('assets/templates/question-bank-school-v1.xlsx')).arrayBuffer(); const r = DS.SheetLesson.build(await DS.Xlsx.read(buf)); await DS.Net.set(`sheets/${r.pack.id}`, r.pack);
      await DS.Account.uploadRoster([{ c: '1-1', n: 1, name: '가' }, { c: '1-1', n: 2, name: '나' }]);
      await DS.Net.set('held/1-1/xl-ex-1', true); await DS.Net.set('unlock/1-1', 1);
      for (const n of [1, 2]) await DS.Net.set(`records/1-1/${n}/xl-ex-1`, { at: Date.now(), no: 1, conc: { m1: [1, 3], s1: [2, 3] }, boss: 1, bossN: 2, mis: { M04: [2, 0] } });
    });
    await T.reload(); await T.waitForTimeout(2000); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
    const fn = await T.evaluate(() => ({ cls: DS.Mis.classify({ type: 'number', answer: 32 }, 31), top: DS.Mis.top({ M04: [3, 0] }, 1).length, std: DS.Standards.of('xl-ex-1', 'm1', 2) }));
    ok(fn.cls.length === 0 && fn.top === 0 && fn.std === null, `오개념 분류 · 성취기준 묶기 끔 (${JSON.stringify(fn)})`);
    await T.evaluate(() => document.querySelector('#d-go').click()); await T.waitForTimeout(2500);
    const tabs = await T.evaluate(() => [...document.querySelectorAll('[data-tab]')].map((b) => b.dataset.tab));
    ok(!['std', 'mis', 'sv', 'sym'].some((k) => tabs.includes(k)) && ['weak', 'memo', 'photo', 'use'].every((k) => tabs.includes(k)), `대시보드 탭 = ${tabs.join(' ')} (성취기준 · 오개념 · 설문 · 기호 톡 없음)`);
    await T.evaluate(() => document.querySelector('[data-tab="weak"]').click()); await T.waitForTimeout(1200);
    const wk = await T.evaluate(() => (document.querySelector('#d-body, #screen-dash') || document.body).innerText);
    ok(/문제 1 · 예시 문제/.test(wk) && !/\bm1\b/.test(wk), `④ 개념별 약점 = 단계 제목으로 (${(wk.match(/문제 1 · 예시 문제|보강 · 한 걸음 더|\bm1\b/g) || []).join(', ')})`);
    log.push('약점 글: ' + wk.replace(/\s+/g, ' ').slice(0, 400)); await T.screenshot({ path: `${OUT}/144-weak.png` });
    await T.evaluate(() => document.querySelector('[data-tab="memo"]').click()); await T.waitForTimeout(1200);
    const memo = await T.evaluate(() => (document.querySelector('#d-body, #screen-dash') || document.body).innerText);
    ok(!/혼동하였으나|성취기준/.test(memo.replace(/⑦ 세특 메모/g, '')) && /수학 수업\(예시과목\)/.test(memo), '⑦ 세특 메모 = 성취기준 · 오개념 문장 없음 · 「수학 수업(과목)」');
    const M = await ctx.newPage(); M.on('pageerror', (e) => errs.push('M: ' + e.message)); await M.goto(`${BASE}/index.html?local`); await M.waitForTimeout(1500);
    ok(await M.evaluate(() => DS.Mis.classify({ type: 'number', answer: 32 }, 31).length >= 0 && !DS.OFF('mis') && DS.Standards.of('set-03', 'm1', 3) !== null), '정식 = 오개념 · 성취기준 그대로');
  } catch (e) { log.push('✘ 오류 ' + String(e.message).split('\n')[0]); bad++; } finally { cleanup(); }
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
