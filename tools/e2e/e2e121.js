// 📄 📚 10차시 레이드용 v1 (2026-11-12): 🧪 테스트 모드로 처음부터 끝까지 넘기기 · 원소 칩 · 소레이드 m5 · 형성평가 · 기호 톡 역 · 대우 — node tools/e2e/e2e100.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  ok(await p.evaluate(() => [...document.querySelectorAll('#p-lesson option')].some((o) => o.value === 'set-10')), '수업 고르기에 10차시');
  await p.selectOption('#p-lesson', 'set-10'); await p.click('#x-go'); await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelectorAll('.nt-pop').forEach((e) => e.remove()));
  await p.click('#camp-gate'); await p.waitForTimeout(3500);
  const stepId = () => p.evaluate(async () => { const db = JSON.parse(localStorage.getItem('citadel-test-db')); const code = Object.keys(db.rooms).pop(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const st = DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), R); return st && st.id; });
  const seen = [];
  for (let i = 0; i < 16; i++) { const id = await stepId(); seen.push(id); if (['m1', 'm2', 'm3', 'm4', 'boss'].includes(id) && !seen.slice(0, -1).includes(id)) { await p.waitForTimeout(7500); await p.screenshot({ path: `${OUT}/121-${id}.png` });
      const txt = await p.evaluate(() => document.querySelector('#st-body') ? document.querySelector('#st-body').textContent : '');
      if (id === 'm1') ok(/p 는 q 이기 위한 무슨 조건/.test(txt) && /충분조건/.test(txt), '문제 1 충분 · 필요 고르기');
      if (id === 'm2') ok(/9의 배수/.test(txt) && /필요충분조건/.test(txt), '문제 2 판정 (예제 2 ⑴)');
      if (id === 'm3') ok(/세 조건 p, q, r/.test(txt) && /R ⊂ Q ⊂ P/.test(txt), '문제 3 세 조건 포함 관계 보기');
      if (id === 'm4') ok(/포함 관계는\?/.test(txt) && /x ≤ 1/.test(txt), '문제 4 소레이드 졸개 ① = 포함 관계'); }
    if (id === 'boss') break; await p.click('#tb-next'); await p.waitForTimeout(900); }
  ok(seen.filter((x, i) => x && x !== seen[i - 1]).join(',') === 'intro,c1,m1,c2,m2,c3,m3,m4,sum,boss', `단계 순서 (${seen.join(',')})`);
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
