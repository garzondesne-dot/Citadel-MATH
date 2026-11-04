// 🪞 8차시 거울 수정 광산 에셋 확인 (2026-11-04): 배경 dg-04-mine-v2 위에 'mirror:0~4' · 'mirrorboss:0' 세 자세 — node tools/e2e/e2e52.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2];
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html?local'); await p.waitForTimeout(1200);
  const ok = await p.evaluate(() => {
    const A = DS.ASSETS, bg = A.base + A.dungeons.bg('04-mine');
    const row = (n) => ['idle', 'attack', 'down'].map((s) => DS.Art.monster(n, s, '')).join('');
    document.body.innerHTML = `<div style="position:fixed;inset:0;background:url('${bg}') center/cover;display:grid;grid-template-columns:repeat(6,1fr);align-items:end;gap:6px;padding:20px">${[0, 1, 2, 3, 4].map((i) => `<div style="display:flex">${row('mirror:' + i)}</div>`).join('')}<div style="grid-column:1/-1;display:flex;justify-content:center;transform:scale(1.4)">${row('mirrorboss:0')}</div></div>`;
    return document.querySelectorAll('.art.monster').length;
  });
  await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/mirror.png` });
  console.log('몬스터 칸', ok); console.log(ok === 18 && !errs.length ? '✅ 통과' : '❌'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (ok !== 18 || errs.length) process.exit(1);
})();
