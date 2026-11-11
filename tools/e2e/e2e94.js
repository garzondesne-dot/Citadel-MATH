// 📖 #62 기호 톡 명제 (2026-11-10): 🧪 테스트 모드 8차시 문제 1 에서 「명제」 · ~ 에 점선 → 톡 = 말풍선 (SYMBOL-TALK 문구)
//   · 2차시 「조건제시법」 에는 안 붙음 — node tools/e2e/e2e94.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => d.accept());
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1200);
  await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000);
  const toMonster = async (lesson, want = 'm1') => {
    await p.evaluate((l) => { if (DS.Test.active && DS.Test.active()) DS.Test.stop && DS.Test.stop(); }, lesson);
    await p.selectOption('#p-lesson', lesson); await p.click('#x-go'); await p.waitForTimeout(2500);
    await p.evaluate(() => document.querySelectorAll('.nt-pop').forEach((e) => e.remove()));
    await p.click('#camp-gate'); await p.waitForTimeout(3500);
    for (let i = 0; i < 12; i++) {
      const k = await p.evaluate(async () => { const db = JSON.parse(localStorage.getItem('citadel-test-db')); const code = Object.keys(db.rooms).pop(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); const st = DS.Raid.stepOf(DS.Lessons.get(R.meta.lesson), R); return st && st.kind === 'monster' && st.id; });
      if (k === want) break; await p.click('#tb-next'); await p.waitForTimeout(900);
    }
    await p.waitForTimeout(7500); // 🌫 정찰 5초
    return p.evaluate(() => [...document.querySelectorAll('#st-body .sym-t')].map((e) => `${e.textContent}:${e.dataset.st}`));
  };
  const m8 = await toMonster('set-08');
  ok(m8.some((x) => x === '명제:prop'), `8차시 문제 1: 「명제」 낱말 (${m8.slice(0, 12).join(' ')})`);
  ok(await p.evaluate(() => !document.querySelector('#st-body button .sym-t[data-st="prop"], #st-body .choice .sym-t[data-st="prop"]')), '보기 단추 안 「명제」 엔 안 붙음 (고르기 그대로)');
  const el = await p.$('#st-body .sym-t[data-st="prop"]');
  if (el) { await el.click(); await p.waitForTimeout(300); const t = await p.textContent('.st-bub').catch(() => ''); ok(/참 또는 거짓을 명확하게 판별할 수 있는 문장이나 식/.test(t) && /참 · 거짓이 딱 정해지는 말/.test(t), `말풍선 (${t.slice(0, 50)})`); await p.screenshot({ path: `${OUT}/94-prop.png` }); }
  // 학생 폰 화면을 직접 써 넣어도 (명제 차시 = 진리집합 있을 때 P)
  const inj = await p.evaluate(async () => { const box = document.querySelector('#st-body .paper') || document.querySelector('#st-body'); const d = document.createElement('div'); d.className = 'paper'; d.innerHTML = '<p class="item-q">조건 p 의 부정 ~p 의 진리집합은 Pᶜ 이다</p>'; document.querySelector('#st-body').appendChild(d); await new Promise((r) => setTimeout(r, 400)); return [...d.querySelectorAll('.sym-t')].map((e) => `${e.textContent}:${e.dataset.st}`); });
  ok(['조건:cond', '~:neg', '진리집합:truth', 'P:truth'].every((x) => inj.includes(x)), `조건 · ~ · 진리집합 · P (${inj.join(' ')})`);
  await p.goto(U + '&role=teacher'); await p.waitForTimeout(1500);
  if (await p.isVisible('#f-teacher .t-id')) { await p.fill('#f-teacher .t-id', 'e2e-teacher'); await p.fill('#f-teacher .t-pw', '909090'); await p.click('#f-teacher .t-login'); await p.waitForTimeout(1000); }
  const m2 = await toMonster('set-02');
  const txt = await p.evaluate(() => document.querySelector('#st-body').textContent);
  ok(/조건/.test(txt) && !m2.some((x) => /cond|prop|neg|truth/.test(x)), `2차시: 「조건제시법」 에 명제 톡 없음 (${m2.slice(0, 8).join(' ')})`);
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
