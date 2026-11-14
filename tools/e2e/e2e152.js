// 📄 📚 11차시 레이드용 v1 (2026-11-14): 🧪 테스트 모드로 처음부터 끝까지 넘기기 · 대우 쓰기 · 증명 빈칸 · 소레이드 m3(✍) · m4(보기 모두 고르기) · 형성평가 — PORT=8766 node tools/e2e/e2e152.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  ok(await p.evaluate(() => [...document.querySelectorAll('#p-lesson option')].some((o) => o.value === 'set-11')), '수업 고르기에 11차시');
  await p.selectOption('#p-lesson', 'set-11'); await p.click('#x-go'); await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelectorAll('.nt-pop').forEach((e) => e.remove()));
  await p.click('#camp-gate'); await p.waitForTimeout(3500);
  const stepId = () => p.evaluate(async () => { const db = JSON.parse(localStorage.getItem('citadel-test-db')); const code = Object.keys(db.rooms).pop(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const st = DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), R); return st && st.id; });
  const seen = [];
  for (let i = 0; i < 16; i++) { const id = await stepId(); seen.push(id); if (['m1', 'm2', 'm3', 'm4', 'boss'].includes(id) && !seen.slice(0, -1).includes(id)) { await p.waitForTimeout(7500); await p.screenshot({ path: `${OUT}/152-${id}.png` });
      const txt = await p.evaluate(() => document.querySelector('#st-body') ? document.querySelector('#st-body').textContent : '');
      if (id === 'm1') ok(/대우는\?/.test(txt) && /n²이 짝수이면 n도 짝수이다/.test(txt), '문제 1 대우 쓰기 (예제 1 명제)');
      if (id === 'm2') ok(/대우는\?/.test(txt) && /2k − 1/.test(txt), '문제 2 증명 빈칸 (n = 2k − 1)');
      if (id === 'm3') ok(/3의 배수이면 n도 3의 배수/.test(txt), '문제 3 소레이드 졸개 ① = 교과서 문제 1 대우');
      if (id === 'm4') ok(/~r → ~q/.test(txt) && /대우는\?/.test(txt), '문제 4 소레이드 졸개 ① = ~r → ~q 의 대우'); }
    if (id === 'boss') break; await p.click('#tb-next'); await p.waitForTimeout(900); }
  ok(seen.filter((x, i) => x && x !== seen[i - 1]).join(',') === 'intro,c1,m1,c2,m2,m3,m4,sum,boss', `단계 순서 (${seen.join(',')})`);
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
